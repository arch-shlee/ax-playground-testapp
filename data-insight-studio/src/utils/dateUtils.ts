const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysRemaining(dueDateIso: string): number {
  const due = startOfDay(new Date(dueDateIso));
  const today = startOfDay(new Date());
  return Math.round((due.getTime() - today.getTime()) / DAY_MS);
}

export function formatDateKo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function todayStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

export function remainingLabel(dueDateIso: string): string {
  const remaining = daysRemaining(dueDateIso);
  if (remaining < 0) return `D+${Math.abs(remaining)} 지연`;
  if (remaining === 0) return 'D-Day';
  return `D-${remaining}`;
}
