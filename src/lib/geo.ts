export interface LatLng {
  lat: number;
  lng: number;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Parametry SYMULACJI czasu przejazdu. To nie jest wynik usługi wyznaczania tras —
 * przybliżenie służy wyłącznie do pokazania układu ekranu w prototypie.
 */
export const SIM = {
  /** Współczynnik zamiany odległości w linii prostej na przybliżoną długość drogi */
  roadFactor: 1.35,
  /** Średnia prędkość spokojnej jazdy kamperem (km/h) */
  camperAvgKmh: 65,
  /** Średnia prędkość samochodu osobowego dla porównania (km/h) */
  carAvgKmh: 85,
  /** Przerwa co 2 godziny jazdy (min) */
  breakEveryMin: 120,
  breakMin: 15,
};

export interface DriveEstimate {
  straightKm: number;
  roadKm: number;
  camperMinutes: number;
  carMinutes: number;
}

export function estimateDrive(a: LatLng, b: LatLng): DriveEstimate {
  const straightKm = haversineKm(a, b);
  const roadKm = straightKm * SIM.roadFactor;
  const driveMin = (roadKm / SIM.camperAvgKmh) * 60;
  const breaks = Math.floor(driveMin / SIM.breakEveryMin) * SIM.breakMin;
  return {
    straightKm,
    roadKm,
    camperMinutes: Math.round(driveMin + breaks),
    carMinutes: Math.round((roadKm / SIM.carAvgKmh) * 60),
  };
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, '0')} min`;
}

export function interpolate(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}
