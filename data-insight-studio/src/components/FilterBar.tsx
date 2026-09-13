import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';
import type { Project } from '../types';
import { STATUS_LIST, DEFAULT_FILTERS } from '../types';

const DUE_RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '전체 기간' },
  { value: 'overdue', label: '기한 초과' },
  { value: '7', label: '7일 이내' },
  { value: '14', label: '14일 이내' },
  { value: '30', label: '30일 이내' },
];

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

export function FilterBar({ projects }: { projects: Project[] }) {
  const filters = useDashboardStore((s) => s.filters);
  const setFilter = useDashboardStore((s) => s.setFilter);
  const resetFilters = useDashboardStore((s) => s.resetFilters);

  const companies = uniqueSorted(projects.map((p) => p.company));
  const departments = uniqueSorted(projects.map((p) => p.department));
  const categories = uniqueSorted(projects.map((p) => p.category));

  const isDefault = JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-2xl bg-slate-50/70 px-4 py-3">
      <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-500">
        <SlidersHorizontal size={14} /> 필터
      </div>

      <select
        value={filters.company}
        onChange={(e) => setFilter('company', e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px] text-slate-600 outline-none focus:border-blue-400"
      >
        <option value="all">관계사 전체</option>
        {companies.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={filters.department}
        onChange={(e) => setFilter('department', e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px] text-slate-600 outline-none focus:border-blue-400"
      >
        <option value="all">담당 조직 전체</option>
        {departments.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => setFilter('status', e.target.value as Project['status'] | 'all')}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px] text-slate-600 outline-none focus:border-blue-400"
      >
        <option value="all">상태 전체</option>
        {STATUS_LIST.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={filters.category}
        onChange={(e) => setFilter('category', e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px] text-slate-600 outline-none focus:border-blue-400"
      >
        <option value="all">업무 유형 전체</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={filters.dueRange}
        onChange={(e) => setFilter('dueRange', e.target.value as typeof filters.dueRange)}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px] text-slate-600 outline-none focus:border-blue-400"
      >
        {DUE_RANGE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {!isDefault && (
        <button
          onClick={resetFilters}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-blue-600 hover:bg-blue-50"
        >
          <RotateCcw size={13} /> 필터 초기화
        </button>
      )}
    </div>
  );
}
