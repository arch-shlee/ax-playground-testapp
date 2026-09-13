# Process Canvas

업무 절차를 자연어로 입력하면 시각적인 프로세스 맵으로 변환해주는 발표 시연용 웹 애플리케이션입니다. 외부 서버, 데이터베이스, AI API 호출 없이 브라우저에서만 동작합니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 (1920×1080 발표 화면에 최적화되어 있습니다).

### 빌드

```bash
npm run build
npm run preview
```

## 주요 기능

- **텍스트 → 프로세스 변환**: 마침표/줄바꿈 단위 문장 분리, 동사 기반 단계명 생성, 역할 키워드 인식(개발자/담당자/시스템/승인자/사용자), "여부·통과하면·실패하면·승인되면" 키워드 기반 의사결정 노드 생성, 실패 시 Yes/No 분기 + 재시도 루프백을 규칙 기반으로 처리합니다 (`src/utils/textToProcess.ts`).
- **샘플 시나리오 3종**: 앱 등록 및 검증(기본), 문서 검토, 데이터 요청 처리 (`src/data/sampleScenarios.ts`).
- **3가지 보기 모드**: 기본 흐름도(React Flow + Dagre 자동 배치), 담당자별 스윔레인 보기, 단계 목록(세로 타임라인) — 전환 시 부드러운 애니메이션 적용.
- **편집 기능**: 노드 추가/삭제, 단계명·역할·상태·설명 등 수정, 노드 드래그 이동, 연결선 추가/삭제, 자동 정렬, 변경 취소(undo), 전체 초기화.
- **자연어 수정 요청** (규칙 기반, 하단 입력창): "보안 검토 단계를 추가해줘", "실패 흐름을 빨간색으로 표시해줘", "담당자별로 구분해줘", "승인 단계를 제거해줘". 지원하지 않는 요청은 안내 메시지를 표시합니다.
- **프로세스 확인사항 자동 분석**: 전체 단계 수, 담당 역할 수, 의사결정 단계 수, 담당자 미지정 단계, 반복/되돌아가는 흐름, 확인이 필요한 단계.
- **다운로드**: 캔버스를 PNG/SVG로, 단계 목록을 CSV로 저장(파일명에 날짜 포함).
- **새로고침 후에도 마지막 상태를 `localStorage`에서 복원**하며, 저장된 상태가 없거나 손상된 경우 기본 샘플로 자동 복구됩니다.
- 렌더링 오류가 발생해도 빈 화면 대신 오류 안내와 "기본 샘플로 초기화" 버튼을 표시합니다 (`src/components/ErrorBoundary.tsx`).

## 코드 구조

```
src/
  types.ts                 프로세스 데이터 구조, 역할별 색상 정의
  data/sampleScenarios.ts  샘플 시나리오 원문 및 그래프 생성
  utils/textToProcess.ts   규칙 기반 텍스트 → 프로세스 변환
  utils/layout.ts          Dagre 자동 배치 / 스윔레인 배치
  utils/nlEdit.ts          자연어 수정 요청 처리
  utils/analysis.ts        프로세스 확인사항 계산
  utils/exportUtils.ts     PNG/SVG/CSV 다운로드
  store/processStore.ts    zustand 전역 상태(그래프, 보기 모드, 선택, 히스토리)
  components/
    Header.tsx             상단 헤더, 보기 모드 전환, 내보내기
    InputPanel.tsx          입력 패널 (좌측)
    ProcessCanvas.tsx       React Flow 캔버스 (중앙)
    TimelineView.tsx        세로 타임라인 보기
    DetailPanel.tsx         상세 정보 패널 (우측)
    AnalysisPanel.tsx       프로세스 확인사항
    NlEditBar.tsx           자연어 수정 요청 입력창
    nodes/                  커스텀 노드 컴포넌트 (일반/의사결정/시작·종료/스윔레인 레인 라벨)
```

## 참고

- 본 프로세스(앱 등록 및 검증 등)는 기능 시연을 위해 구성한 예시이며 실제 회사의 확정된 절차가 아닙니다.
- 규칙 기반 변환은 완벽한 자연어 이해보다 샘플 시나리오의 안정적인 변환을 우선합니다.
