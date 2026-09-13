import { useMemo, useState } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';
import type { Project } from '../types';
import { STATUS_COLORS } from '../types';
import { formatDateKo, remainingLabel } from '../utils/dateUtils';

type SortKey = 'projectName' | 'company' | 'owner' | 'status' | 'progress' | 'dueDate';

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'projectName', label: '과제명' },
  { key: 'company', label: '관계사' },
  { key: 'owner', label: '담당자' },
  { key: 'status', label: '상태' },
  { key: 'progress', label: '진행률' },
  { key: 'dueDate', label: '완료 예정일' },
];

export function ProjectTable({
  projects,
  selectedId,
  onSelect,
}: {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortAsc, setSortAsc] = useState(true);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? projects.filter(
          (p) =>
            p.projectName.toLowerCase().includes(term) ||
            p.owner.toLowerCase().includes(term) ||
            p.company.toLowerCase().includes(term),
        )
      : projects;

    return [...filtered].sort((a, b) => {
      let result = 0;
      if (sortKey === 'progress') result = a.progress - b.progress;
      else if (sortKey === 'dueDate') result = a.dueDate.localeCompare(b.dueDate);
      else result = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortAsc ? result : -result;
    });
  }, [projects, search, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc((prev) => !prev);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="dis-fade-in flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[13.5px] font-bold text-slate-700">상세 프로젝트 목록 ({rows.length}건)</h3>
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="과제명, 담당자, 관계사 검색"
            className="w-64 rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-[12.5px] outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto dis-scrollbar">
        <table className="w-full border-collapse text-left text-[12.5px]">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-slate-100 text-slate-400">
              {COLUMNS.map((col) => (
                <th key={col.key} className="cursor-pointer select-none py-2 pr-4 font-medium" onClick={() => toggleSort(col.key)}>
                  <span className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown size={11} className={sortKey === col.key ? 'text-blue-500' : 'text-slate-300'} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const colors = STATUS_COLORS[p.status];
              const isSelected = p.id === selectedId;
              return (
                <tr
                  key={p.id}
                  onClick={() => onSelect(p.id)}
                  className={`cursor-pointer border-b border-slate-50 transition-colors ${
                    isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="max-w-[220px] truncate py-2.5 pr-4 font-medium text-slate-700">{p.projectName}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{p.company}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{p.owner}</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-slate-600">{p.progress}%</td>
                  <td className="py-2.5 pr-4 text-slate-500">
                    {formatDateKo(p.dueDate)}
                    <span className="ml-1.5 text-[11px] text-slate-400">({remainingLabel(p.dueDate)})</span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="py-10 text-center text-slate-400">
                  조건에 맞는 과제가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
