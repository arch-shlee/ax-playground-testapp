import type { Filters, Project } from '../types';
import { daysRemaining } from './dateUtils';

export function applyFilters(projects: Project[], filters: Filters): Project[] {
  return projects.filter((p) => {
    if (filters.company !== 'all' && p.company !== filters.company) return false;
    if (filters.department !== 'all' && p.department !== filters.department) return false;
    if (filters.status !== 'all' && p.status !== filters.status) return false;
    if (filters.category !== 'all' && p.category !== filters.category) return false;

    if (filters.dueRange !== 'all') {
      const remaining = daysRemaining(p.dueDate);
      if (filters.dueRange === 'overdue' && remaining >= 0) return false;
      if (filters.dueRange === '7' && (remaining < 0 || remaining > 7)) return false;
      if (filters.dueRange === '14' && (remaining < 0 || remaining > 14)) return false;
      if (filters.dueRange === '30' && (remaining < 0 || remaining > 30)) return false;
    }

    return true;
  });
}

export function uniqueDepartments(projects: Project[]): string[] {
  return Array.from(new Set(projects.map((p) => p.department))).sort();
}
