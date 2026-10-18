export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function nightsBetween(start: string, end: string): number {
  const ms = parseISO(end).getTime() - parseISO(start).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

const fmtDate = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtShort = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short' });
const fmtWeekday = new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtDateTime = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatDate = (iso: string) => fmtDate.format(parseISO(iso));
export const formatShort = (iso: string) => fmtShort.format(parseISO(iso));
export const formatWeekday = (iso: string) => fmtWeekday.format(parseISO(iso));
export const formatDateTime = (isoDateTime: string) => fmtDateTime.format(new Date(isoDateTime));

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
