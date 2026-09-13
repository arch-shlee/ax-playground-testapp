import type { Project } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

function offsetDate(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10);
}

interface RawRow {
  projectName: string;
  company: Project['company'];
  department: string;
  owner: string;
  startOffset: number;
  dueOffset: number;
  progress: number;
  status: Project['status'];
  category: Project['category'];
  issue: string;
  weeklyChange: number;
}

const RAW_ROWS: RawRow[] = [
  { projectName: 'SKMR 판매 데이터 통합 대시보드 구축', company: 'SKMR', department: '데이터플랫폼팀', owner: '김도윤', startOffset: -70, dueOffset: 5, progress: 62, status: '주의', category: '데이터 분석', issue: '일부 매장 POS 데이터 연동 지연', weeklyChange: 3 },
  { projectName: 'SKMR 재고 예측 모델 고도화', company: 'SKMR', department: 'AI혁신팀', owner: '이서연', startOffset: -50, dueOffset: 25, progress: 78, status: '정상', category: '데이터 분석', issue: '', weeklyChange: 5 },
  { projectName: 'SKMR 사내 문서 검색 시스템 구축', company: 'SKMR', department: 'IT기획팀', owner: '박지훈', startOffset: -40, dueOffset: -3, progress: 55, status: '지연', category: '문서 검색', issue: '검색 엔진 색인 성능 이슈로 일정 재조정 필요', weeklyChange: 0 },
  { projectName: 'SKMR 주간 실적 보고 자동화', company: 'SKMR', department: '경영지원팀', owner: '최유진', startOffset: -30, dueOffset: 12, progress: 88, status: '정상', category: '업무 자동화', issue: '', weeklyChange: 4 },
  { projectName: 'SKMJ 생산 현황 모니터링 대시보드', company: 'SKMJ', department: '디지털전환팀', owner: '정민재', startOffset: -60, dueOffset: 8, progress: 66, status: '주의', category: '현황 관리', issue: '설비 데이터 수집 주기 표준화 필요', weeklyChange: 2 },
  { projectName: 'SKMJ 품질 데이터 통합 분석', company: 'SKMJ', department: '데이터플랫폼팀', owner: '한소율', startOffset: -45, dueOffset: 40, progress: 45, status: '정상', category: '데이터 분석', issue: '', weeklyChange: 6 },
  { projectName: 'SKMJ 사내규정 검색 챗봇', company: 'SKMJ', department: 'IT기획팀', owner: '오태양', startOffset: -35, dueOffset: -8, progress: 48, status: '지연', category: '문서 검색', issue: '법무 검토 지연으로 데이터 반영이 늦어짐', weeklyChange: -2 },
  { projectName: 'SKMJ 설비 점검 보고 자동화', company: 'SKMJ', department: '현장운영팀', owner: '강예린', startOffset: -20, dueOffset: 18, progress: 34, status: '주의', category: '업무 자동화', issue: '현장 앱 배포 일정 조정 중', weeklyChange: 0 },
  { projectName: 'SKMP 수요예측 AI 모델 개발', company: 'SKMP', department: 'AI혁신팀', owner: '윤성민', startOffset: -80, dueOffset: 30, progress: 71, status: '정상', category: '데이터 분석', issue: '', weeklyChange: 7 },
  { projectName: 'SKMP 통합 현황판 구축', company: 'SKMP', department: '데이터플랫폼팀', owner: '임하늘', startOffset: -55, dueOffset: 6, progress: 58, status: '주의', category: '현황 관리', issue: '부서별 데이터 정의 통일 필요', weeklyChange: 1 },
  { projectName: 'SKMP 계약서 검색 시스템', company: 'SKMP', department: '경영지원팀', owner: '조은서', startOffset: -25, dueOffset: 45, progress: 20, status: '정상', category: '문서 검색', issue: '', weeklyChange: 8 },
  { projectName: 'SKMP 결재 프로세스 자동화', company: 'SKMP', department: 'IT기획팀', owner: '백승우', startOffset: -65, dueOffset: -15, progress: 40, status: '지연', category: '업무 자동화', issue: '타 시스템 연동 API 변경으로 재작업 발생', weeklyChange: -4 },
  { projectName: 'SKTC 안전점검 현황 관리', company: 'SKTC', department: '현장운영팀', owner: '김도윤', startOffset: -40, dueOffset: 4, progress: 74, status: '정상', category: '현황 관리', issue: '', weeklyChange: 3 },
  { projectName: 'SKTC 물류 데이터 분석 플랫폼', company: 'SKTC', department: '데이터플랫폼팀', owner: '이서연', startOffset: -70, dueOffset: 50, progress: 33, status: '정상', category: '데이터 분석', issue: '', weeklyChange: 5 },
  { projectName: 'SKTC 고객 문의 검색 고도화', company: 'SKTC', department: 'AI혁신팀', owner: '박지훈', startOffset: -30, dueOffset: 9, progress: 62, status: '주의', category: '문서 검색', issue: '동의어 사전 정비 필요', weeklyChange: 0 },
  { projectName: 'SKTC 일일 업무 보고 자동화', company: 'SKTC', department: '디지털전환팀', owner: '최유진', startOffset: -15, dueOffset: 21, progress: 85, status: '정상', category: '업무 자동화', issue: '', weeklyChange: 6 },
  { projectName: 'SKTC 계열사 현황 통합 관리', company: 'SKTC', department: 'IT기획팀', owner: '정민재', startOffset: -90, dueOffset: -20, progress: 42, status: '지연', category: '현황 관리', issue: '계열사별 보고 주기 상이로 데이터 정합성 이슈', weeklyChange: -1 },
  { projectName: 'SKAP 구매 데이터 분석', company: 'SKAP', department: '경영지원팀', owner: '한소율', startOffset: -35, dueOffset: 33, progress: 51, status: '정상', category: '데이터 분석', issue: '', weeklyChange: 4 },
  { projectName: 'SKAP 인사 문서 검색 시스템', company: 'SKAP', department: '데이터플랫폼팀', owner: '오태양', startOffset: -50, dueOffset: 7, progress: 60, status: '주의', category: '문서 검색', issue: '개인정보 마스킹 처리 검토 중', weeklyChange: 2 },
  { projectName: 'SKAP 근태관리 자동화', company: 'SKAP', department: 'IT기획팀', owner: '강예린', startOffset: -20, dueOffset: 16, progress: 90, status: '정상', category: '업무 자동화', issue: '', weeklyChange: 3 },
  { projectName: 'SKAP 설비이상 탐지 모델', company: 'SKAP', department: 'AI혁신팀', owner: '윤성민', startOffset: -75, dueOffset: -5, progress: 47, status: '지연', category: '데이터 분석', issue: '학습 데이터 라벨링 지연', weeklyChange: -3 },
  { projectName: 'SKMR 매장 현황 실시간 관리', company: 'SKMR', department: '현장운영팀', owner: '임하늘', startOffset: -25, dueOffset: 3, progress: 68, status: '주의', category: '현황 관리', issue: '일부 매장 태블릿 보급 지연', weeklyChange: 0 },
  { projectName: 'SKMJ 회의록 검색 자동화', company: 'SKMJ', department: '경영지원팀', owner: '조은서', startOffset: -18, dueOffset: 60, progress: 15, status: '정상', category: '문서 검색', issue: '', weeklyChange: 5 },
  { projectName: 'SKMP 작업일지 자동화', company: 'SKMP', department: '현장운영팀', owner: '백승우', startOffset: -28, dueOffset: 11, progress: 80, status: '정상', category: '업무 자동화', issue: '', weeklyChange: 2 },
];

export function buildSampleProjects(): Project[] {
  return RAW_ROWS.map((row, i) => ({
    id: `sample-${i + 1}`,
    projectName: row.projectName,
    company: row.company,
    department: row.department,
    owner: row.owner,
    startDate: offsetDate(row.startOffset),
    dueDate: offsetDate(row.dueOffset),
    progress: row.progress,
    status: row.status,
    category: row.category,
    issue: row.issue,
    weeklyChange: row.weeklyChange,
  }));
}
