export type CostBasis = 'noc' | 'pobyt' | 'nieustalone';

export interface Stay {
  id: string;
  /** Data przyjazdu, YYYY-MM-DD */
  start: string;
  /** Data wyjazdu, YYYY-MM-DD */
  end: string;
  name: string;
  address: string;
  cost: { amount: number | null; currency: string; basis: CostBasis };
  phone: string;
  website: string;
  lat: number;
  lng: number;
  demo: boolean;
}

export interface Place {
  id: string;
  name: string;
  note: string;
  lat: number;
  lng: number;
  /** Jeśli ustawione — miejsce jest przystankiem na trasie po danym pobycie */
  routeAfterStayId: string | null;
  demo: boolean;
}

export type SupplyKind = 'woda' | 'gaz' | 'akumulator';

export interface Reading {
  id: string;
  kind: SupplyKind;
  /** Poziom w procentach 0–100 (jednostka docelowa do ustalenia) */
  percent: number;
  /** Opcjonalna wartość w jednostce fizycznej (np. litry, kg, V) */
  rawValue: number | null;
  rawUnit: string;
  at: string;
  demo: boolean;
}

export interface Photo {
  src: string;
  caption: string;
  demo: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  text: string;
  placeName: string;
  lat: number | null;
  lng: number | null;
  photos: Photo[];
  demo: boolean;
}

export interface CurrentStatus {
  where: string;
  plans: string;
  updatedAt: string;
  demo: boolean;
}

export interface AppData {
  stays: Stay[];
  places: Place[];
  readings: Reading[];
  journal: JournalEntry[];
  status: CurrentStatus;
}
