import type { Stay } from '../data/types';
import { nightsBetween } from './dates';

export const COST_BASIS_LABEL: Record<Stay['cost']['basis'], string> = {
  noc: 'za noc',
  pobyt: 'za cały pobyt',
  nieustalone: 'sposób rozliczenia nieustalony',
};

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/** Opis kosztu, zawsze z informacją o sposobie rozliczenia. */
export function describeCost(stay: Stay): { main: string; detail: string } {
  const { amount, currency, basis } = stay.cost;
  if (amount === null) return { main: 'Koszt nieznany', detail: '' };
  const nights = nightsBetween(stay.start, stay.end);
  const main = `${formatMoney(amount, currency)} ${COST_BASIS_LABEL[basis]}`;
  if (basis === 'noc') return { main, detail: `${nights} × noc ≈ ${formatMoney(amount * nights, currency)} łącznie` };
  if (basis === 'pobyt') return { main, detail: `${nights} noc(y)` };
  return { main, detail: 'Nie wiadomo, czy kwota dotyczy nocy, czy całego pobytu.' };
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
