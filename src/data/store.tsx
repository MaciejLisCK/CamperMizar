import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { todayISO } from '../lib/dates';
import { createSeed } from './seed';
import type { AppData, Stay } from './types';

const STORAGE_KEY = 'kamper-mizar-prototyp-v1';

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppData;
  } catch {
    /* brak dostępu do pamięci przeglądarki — używamy danych przykładowych */
  }
  return createSeed();
}

interface Store {
  data: AppData;
  update: (fn: (d: AppData) => AppData) => void;
  reset: () => void;
  saveError: string | null;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSaveError(null);
    } catch {
      setSaveError('Nie udało się zapisać zmian w pamięci przeglądarki (możliwe przekroczenie limitu — np. za duże zdjęcia).');
    }
  }, [data]);

  const update = useCallback((fn: (d: AppData) => AppData) => setData((d) => fn(d)), []);
  const reset = useCallback(() => setData(createSeed()), []);

  const value = useMemo(() => ({ data, update, reset, saveError }), [data, update, reset, saveError]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore poza StoreProvider');
  return s;
}

export function sortedStays(stays: Stay[]): Stay[] {
  return [...stays].sort((a, b) => a.start.localeCompare(b.start));
}

/** Pobyt trwający dziś (przyjazd <= dziś < wyjazd). */
export function currentStay(stays: Stay[], today = todayISO()): Stay | undefined {
  return sortedStays(stays).find((s) => s.start <= today && today < s.end);
}

/**
 * Cel bieżącego przejazdu: pobyt zaczynający się dziś, a jeśli takiego nie ma —
 * najbliższy przyszły pobyt.
 */
export function nextTarget(stays: Stay[], today = todayISO()): Stay | undefined {
  const sorted = sortedStays(stays);
  return sorted.find((s) => s.start === today) ?? sorted.find((s) => s.start > today);
}

export interface RoutePoint {
  kind: 'stay' | 'place';
  id: string;
  name: string;
  lat: number;
  lng: number;
  stay?: Stay;
}

/** Kolejne punkty trasy: pobyty według dat, a po każdym pobycie przypisane do niego miejsca. */
export function buildRoute(data: AppData): RoutePoint[] {
  const out: RoutePoint[] = [];
  for (const s of sortedStays(data.stays)) {
    out.push({ kind: 'stay', id: s.id, name: s.name, lat: s.lat, lng: s.lng, stay: s });
    for (const p of data.places.filter((p) => p.routeAfterStayId === s.id)) {
      out.push({ kind: 'place', id: p.id, name: p.name, lat: p.lat, lng: p.lng });
    }
  }
  return out;
}

export function previousStay(stays: Stay[], target: Stay): Stay | undefined {
  const sorted = sortedStays(stays);
  const idx = sorted.findIndex((s) => s.id === target.id);
  return idx > 0 ? sorted[idx - 1] : undefined;
}
