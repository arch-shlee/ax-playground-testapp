import type { EdgeKind, NodeKind, ProcessGraph, ProcessLink, ProcessStep, Role } from '../types';

const DECISION_PATTERN = /여부|통과하면|실패하면|승인되면/;
const FAIL_PATTERN = /실패|보완|거절|반려/;
const RETRY_PATTERN = /다시|재등록|재시도|재실행|재검토/;

const ROLE_PATTERNS: [RegExp, Role][] = [
  [/개발자/, '개발자'],
  [/승인자/, '승인자'],
  [/시스템/, '검증 시스템'],
  [/사용자/, '사용자'],
  [/담당자/, '운영 담당자'],
];

function detectRole(sentence: string): Role {
  for (const [pattern, role] of ROLE_PATTERNS) {
    if (pattern.test(sentence)) return role;
  }
  return '담당자 미지정';
}

function splitSentences(text: string): string[] {
  return text
    .split(/[.\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function buildLabel(sentence: string): { label: string; description: string } {
  const description = sentence;
  const MAX = 20;
  if (sentence.length <= MAX) return { label: sentence, description };
  const cut = sentence.slice(0, MAX);
  const lastSpace = cut.lastIndexOf(' ');
  const label = (lastSpace > 8 ? cut.slice(0, lastSpace) : cut) + '…';
  return { label, description };
}

let uidCounter = 0;
export function nextId(prefix = 'node'): string {
  uidCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${uidCounter}`;
}

/**
 * Rule-based (no AI) conversion of free-form Korean process text into a
 * ProcessGraph. Prioritizes stable, predictable output over linguistic
 * accuracy — see spec: "완벽한 자연어 분석보다 샘플 시나리오가 안정적으로
 * 변환되는 것을 우선".
 */
export function generateProcessFromText(text: string, title = '새 프로세스'): ProcessGraph {
  const sentences = splitSentences(text);
  if (sentences.length === 0) {
    return { title, steps: [], links: [] };
  }

  const steps: ProcessStep[] = sentences.map((sentence, i) => {
    const isFirst = i === 0;
    const isLast = i === sentences.length - 1;
    let kind: NodeKind = 'process';
    if (isFirst) kind = 'start';
    else if (isLast) kind = 'end';
    else if (DECISION_PATTERN.test(sentence)) kind = 'decision';

    const { label, description } = buildLabel(sentence);

    return {
      id: `n${i}`,
      kind,
      label,
      role: detectRole(sentence),
      description,
      inputs: '',
      completionCriteria: '',
      checkpoints: '',
      memo: '',
      status: '대기',
      order: i,
    };
  });

  const links: ProcessLink[] = [];
  for (let i = 0; i < sentences.length - 1; i++) {
    links.push({ id: `e${i}-${i + 1}`, source: `n${i}`, target: `n${i + 1}`, kind: 'normal' });
  }

  const findLink = (source: string, target: string) =>
    links.find((l) => l.source === source && l.target === target);

  for (let i = 0; i < sentences.length; i++) {
    if (steps[i].kind !== 'decision') continue;
    const nextIdx = i + 1;
    if (nextIdx >= sentences.length) continue;
    if (!FAIL_PATTERN.test(sentences[nextIdx])) continue;

    const failLink = findLink(`n${i}`, `n${nextIdx}`);
    if (failLink) {
      failLink.kind = 'fail';
      failLink.label = '아니오';
    }

    let retryIdx = -1;
    for (let j = nextIdx + 1; j <= Math.min(nextIdx + 3, sentences.length - 1); j++) {
      if (RETRY_PATTERN.test(sentences[j])) {
        retryIdx = j;
        break;
      }
    }

    if (retryIdx >= 0) {
      const rejoinIdx = retryIdx + 1;
      if (rejoinIdx < sentences.length) {
        // the retry step loops back instead of continuing forward — drop the
        // default linear edge so it doesn't also point at the rejoin step
        const staleEdgeIdx = links.findIndex((l) => l.source === `n${retryIdx}` && l.target === `n${rejoinIdx}`);
        if (staleEdgeIdx >= 0) links.splice(staleEdgeIdx, 1);

        links.push({
          id: `e-yes-${i}-${rejoinIdx}`,
          source: `n${i}`,
          target: `n${rejoinIdx}`,
          kind: 'normal',
          label: '예',
        });
      }
      const loopTargetIdx = Math.max(i - 1, 0);
      links.push({
        id: `e-retry-${retryIdx}-${loopTargetIdx}`,
        source: `n${retryIdx}`,
        target: `n${loopTargetIdx}`,
        kind: 'fail' as EdgeKind,
        label: '재시도',
      });
    } else if (nextIdx + 1 < sentences.length) {
      links.push({
        id: `e-yes-${i}-${nextIdx + 1}`,
        source: `n${i}`,
        target: `n${nextIdx + 1}`,
        kind: 'normal',
        label: '예',
      });
    }
  }

  return { title, steps, links };
}
