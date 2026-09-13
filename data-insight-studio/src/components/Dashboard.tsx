import { useMemo } from 'react';
import { FileDown, NotebookPen } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';
import { applyFilters } from '../utils/filters';
import {
  buildCategoryDonutData,
  buildCompanyStatusData,
  buildProgressTrend,
  buildScatterData,
  buildUpcomingDeadlines,
  computeKpis,
} from '../utils/metrics';
import { buildInsights } from '../utils/insights';
import { exportProjectsAsCsv } from '../utils/exportUtils';
import { FilterBar } from './FilterBar';
import { KpiRow } from './KpiRow';
import { ProgressTrendChart } from './charts/ProgressTrendChart';
import { CompanyStatusChart } from './charts/CompanyStatusChart';
import { CategoryDonutChart } from './charts/CategoryDonutChart';
import { ProgressScatterChart } from './charts/ProgressScatterChart';
import { UpcomingDeadlines } from './charts/UpcomingDeadlines';
import { InsightsPanel } from './InsightsPanel';
import { ProjectTable } from './ProjectTable';
import { ProjectDetailPanel } from './ProjectDetailPanel';
import { ReportSummaryModal } from './ReportSummaryModal';

export function Dashboard() {
  const projects = useDashboardStore((s) => s.projects);
  const filters = useDashboardStore((s) => s.filters);
  const selectedProjectId = useDashboardStore((s) => s.selectedProjectId);
  const selectProject = useDashboardStore((s) => s.selectProject);
  const reportModalOpen = useDashboardStore((s) => s.reportModalOpen);
  const openReportModal = useDashboardStore((s) => s.openReportModal);
  const closeReportModal = useDashboardStore((s) => s.closeReportModal);
  const dataSource = useDashboardStore((s) => s.dataSource);

  const filteredProjects = useMemo(() => applyFilters(projects, filters), [projects, filters]);
  const orderedProjects = useMemo(
    () => [...filteredProjects].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [filteredProjects],
  );

  const kpi = useMemo(() => computeKpis(filteredProjects), [filteredProjects]);
  const trendData = useMemo(() => buildProgressTrend(filteredProjects), [filteredProjects]);
  const companyStatusData = useMemo(() => buildCompanyStatusData(filteredProjects), [filteredProjects]);
  const categoryDonutData = useMemo(() => buildCategoryDonutData(filteredProjects), [filteredProjects]);
  const scatterData = useMemo(() => buildScatterData(filteredProjects), [filteredProjects]);
  const upcoming = useMemo(() => buildUpcomingDeadlines(filteredProjects), [filteredProjects]);
  const insights = useMemo(() => buildInsights(filteredProjects), [filteredProjects]);

  const selectedProject = filteredProjects.find((p) => p.id === selectedProjectId) ?? null;

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto dis-scrollbar bg-slate-50/40 px-8 py-6">
      {dataSource === 'sample' && (
        <p className="text-[11.5px] font-medium text-slate-400">현재 샘플 데이터 모드로 표시 중입니다.</p>
      )}

      <FilterBar projects={projects} />
      <KpiRow kpi={kpi} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ProgressTrendChart data={trendData} />
          <CompanyStatusChart data={companyStatusData} />
          <CategoryDonutChart data={categoryDonutData} />
          <ProgressScatterChart data={scatterData} />
          <div className="lg:col-span-2">
            <UpcomingDeadlines projects={upcoming} onSelect={selectProject} />
          </div>
        </div>
        <InsightsPanel insights={insights} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-slate-700">상세 데이터</h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportProjectsAsCsv(filteredProjects)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50"
          >
            <FileDown size={14} /> CSV 다운로드
          </button>
          <button
            onClick={openReportModal}
            className="flex items-center gap-1.5 rounded-lg bg-navy-700 px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-800"
          >
            <NotebookPen size={14} /> 이번 주 보고 요약
          </button>
        </div>
      </div>

      <ProjectTable projects={filteredProjects} selectedId={selectedProjectId} onSelect={selectProject} />

      <p className="pb-2 pt-1 text-center text-[11.5px] text-slate-300">
        본 화면의 데이터는 시연을 위해 생성한 가상 데이터입니다.
      </p>

      {selectedProject && (
        <ProjectDetailPanel
          project={selectedProject}
          orderedProjects={orderedProjects}
          onClose={() => selectProject(null)}
          onNavigate={selectProject}
        />
      )}

      {reportModalOpen && <ReportSummaryModal projects={filteredProjects} onClose={closeReportModal} />}
    </div>
  );
}
