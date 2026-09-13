# Data Insight Studio

Excel 또는 CSV 파일을 업로드하면 프로젝트 현황을 시각적인 대시보드로 보여주는 발표 시연용 웹 애플리케이션입니다. 외부 서버, 데이터베이스, AI API 호출 없이 브라우저에서만 동작합니다.

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

- **샘플 데이터**: SKMR/SKMJ/SKMP/SKTC/SKAP 5개 관계사가 섞인 가상 프로젝트 24건을 기본 제공 (`src/data/sampleData.ts`). 완료 예정일은 실행 시점 기준 상대 날짜로 생성되어 "7일 이내 마감" 등 기간 기반 인사이트가 항상 의미 있게 동작합니다.
- **파일 업로드**: Excel(.xlsx/.xls, SheetJS)과 CSV(PapaParse)를 지원하며, 컬럼명이 다르게 들어와도 한글/영문 별칭을 매칭해 최대한 읽어들이고(`src/utils/fileParser.ts`), 상태 값이 없거나 알 수 없는 경우 진행률·마감일 기준으로 상태를 자동 추정합니다.
- **분석 애니메이션**: 샘플/업로드 데이터를 불러올 때 "데이터 구조 확인 → 주요 지표 계산 → 대시보드 구성" 3단계가 순서대로 표시됩니다.
- **KPI**: 전체 과제, 정상 진행, 확인 필요, 일정 지연, 평균 진행률과 지난주 대비 변화.
- **필터**: 관계사 / 담당 조직 / 상태 / 업무 유형 / 완료 예정 기간 — 모든 그래프·KPI·목록에 즉시 반영되며 "필터 초기화" 제공.
- **시각화**: 주차별 진행률 추이(선그래프), 관계사별 상태 현황(누적 막대), 업무 유형별 과제 수(도넛), 진행률-남은기간 관계(산점도), 마감 임박 과제(진행률 바) — Recharts, 한글 축/범례/툴팁.
- **이번 주 확인사항**: 지연 과제 수, 마감 임박(7일 이내)이면서 진행률 70% 미만인 과제, 지난주 대비 변화 없는 과제, 관계사별 최우선 확인 항목을 규칙 기반으로 자동 계산·문장화 (`src/utils/insights.ts`).
- **상세 프로젝트 목록**: 검색, 정렬, 행 클릭 시 우측 상세 패널(이전/다음 탐색 포함).
- **이번 주 보고 요약**: 현재 필터 기준으로 전체 현황/주요 진척/확인 필요 사항/일정 지연 항목/다음 주 우선 확인사항을 생성하는 모달, 클립보드 복사 지원 (`src/utils/reportSummary.ts`).
- **다운로드**: 필터링된 데이터 CSV, 보고 요약 TXT — 파일명에 날짜 포함.
- 렌더링 오류 시 빈 화면 대신 안내 메시지를 표시하고(`src/components/ErrorBoundary.tsx`), 파일 파싱 실패 시에도 오류 배너만 뜨고 앱은 계속 사용 가능합니다.

## 코드 구조

```
src/
  types.ts                    데이터 구조, 상태/카테고리 색상
  data/sampleData.ts          샘플 프로젝트 24건
  utils/
    dateUtils.ts               날짜 포맷, 남은 기간 계산
    filters.ts                 필터 적용
    metrics.ts                 KPI, 차트 데이터 가공
    insights.ts                이번 주 확인사항 규칙 기반 생성
    reportSummary.ts           보고 요약 텍스트 생성
    fileParser.ts               Excel/CSV 파싱 및 컬럼 매핑
    exportUtils.ts              CSV/TXT 다운로드
  store/dashboardStore.ts      zustand 전역 상태
  components/
    Header.tsx, UploadScreen.tsx, AnalysisLoader.tsx, ErrorBanner.tsx
    FilterBar.tsx, KpiRow.tsx, InsightsPanel.tsx
    ProjectTable.tsx, ProjectDetailPanel.tsx, ReportSummaryModal.tsx
    Dashboard.tsx, ErrorBoundary.tsx
    charts/  (ProgressTrendChart, CompanyStatusChart, CategoryDonutChart, ProgressScatterChart, UpcomingDeadlines, ChartCard)
```

## 참고

- 화면 하단에 표시되는 대로, 본 화면의 데이터는 시연을 위해 생성한 가상 데이터입니다.
- 업로드 파일 파싱은 완벽한 스키마 검증보다 다양한 컬럼명에도 대시보드가 깨지지 않고 표시되는 것을 우선합니다.
