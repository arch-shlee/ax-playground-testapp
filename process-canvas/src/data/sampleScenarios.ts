import { generateProcessFromText } from '../utils/textToProcess';
import type { ProcessGraph } from '../types';

export interface SampleScenario {
  id: string;
  title: string;
  text: string;
  /** optional per-step enrichment (index-aligned) for a richer demo */
  enrich?: Partial<{
    inputs: string;
    completionCriteria: string;
    checkpoints: string;
  }>[];
}

export const APP_REGISTRATION_TEXT = `개발자가 앱 등록을 요청한다.
담당자가 필수 등록정보를 확인한다.
시스템이 Git 저장소와 버전정보를 확인한다.
시스템이 자동 검증 파이프라인을 실행한다.
시스템이 검증 통과 여부를 판단한다.
검증에 실패하면 개발자에게 보완을 요청한다.
개발자가 수정 후 다시 등록한다.
검증에 통과하면 승인자가 배포 여부를 검토한다.
승인되면 담당자가 실행환경에 배포한다.
사용자에게 앱을 공개한다.`;

const APP_REGISTRATION_ENRICH: SampleScenario['enrich'] = [
  { inputs: '앱 이름, 패키지 정보', completionCriteria: '등록 요청 접수', checkpoints: '' },
  { inputs: '등록 신청서', completionCriteria: '필수 항목 누락 없음', checkpoints: '필수 항목 공란 여부' },
  { inputs: 'Git 저장소 URL, 버전 태그', completionCriteria: '저장소 접근 가능, 버전 형식 일치', checkpoints: '버전 규칙 준수 여부' },
  { inputs: '빌드 아티팩트', completionCriteria: '파이프라인 정상 종료', checkpoints: '' },
  { inputs: '검증 리포트', completionCriteria: '통과/실패 판정 완료', checkpoints: '오탐 여부 재확인' },
  { inputs: '실패 사유서', completionCriteria: '보완 요청 전달', checkpoints: '' },
  { inputs: '수정된 빌드', completionCriteria: '재등록 완료', checkpoints: '' },
  { inputs: '검증 통과 리포트', completionCriteria: '배포 승인/반려 결정', checkpoints: '보안 영향도 확인' },
  { inputs: '배포 패키지', completionCriteria: '운영 환경 반영 완료', checkpoints: '롤백 계획 확인' },
  { inputs: '공개 안내 문구', completionCriteria: '스토어/포털 게시 완료', checkpoints: '' },
];

export const DOCUMENT_REVIEW_TEXT = `담당자가 검토할 문서를 접수한다.
시스템이 문서 형식과 필수 항목을 자동으로 확인한다.
담당자가 내용의 적합성을 검토한다.
담당자가 검토 통과 여부를 판단한다.
검토에 실패하면 담당자가 보완을 요청한다.
담당자가 문서를 수정하여 다시 제출한다.
검토에 통과하면 승인자가 최종 확인을 진행한다.
승인되면 사용자에게 문서를 공개한다.`;

export const DATA_REQUEST_TEXT = `사용자가 데이터 요청을 등록한다.
담당자가 요청 내용을 확인한다.
시스템이 데이터 접근 권한을 자동으로 확인한다.
승인자가 제공 여부를 판단한다.
승인이 거절되면 담당자가 사유를 사용자에게 안내한다.
담당자가 요청 내용을 보완하여 다시 접수한다.
승인되면 시스템이 데이터를 추출한다.
사용자에게 데이터를 전달한다.`;

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  { id: 'app-registration', title: '앱 등록 및 검증', text: APP_REGISTRATION_TEXT, enrich: APP_REGISTRATION_ENRICH },
  { id: 'document-review', title: '문서 검토', text: DOCUMENT_REVIEW_TEXT },
  { id: 'data-request', title: '데이터 요청 처리', text: DATA_REQUEST_TEXT },
];

export function buildScenarioGraph(scenario: SampleScenario): ProcessGraph {
  const graph = generateProcessFromText(scenario.text, scenario.title);
  if (scenario.enrich) {
    graph.steps = graph.steps.map((step, i) => ({
      ...step,
      ...(scenario.enrich?.[i] ?? {}),
    }));
  }
  return graph;
}

export const DEFAULT_SCENARIO = SAMPLE_SCENARIOS[0];
