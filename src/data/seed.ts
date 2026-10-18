import { addDays, todayISO } from '../lib/dates';
import type { AppData } from './types';

/** Ilustracja zastępcza w miejscu zdjęcia — wyraźnie podpisana jako przykładowa. */
export function placeholderPhoto(label: string, hue: number, variant = 0): string {
  const mountains =
    variant % 2 === 0
      ? `<path d="M0 300 L120 170 L200 240 L310 120 L430 260 L520 190 L640 300 Z" fill="hsl(${hue} 30% 40%)"/>`
      : `<path d="M0 300 C120 230 220 260 320 220 C420 180 520 240 640 210 L640 360 L0 360 Z" fill="hsl(${hue} 35% 45%)"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="hsl(${hue} 60% 82%)"/><stop offset="1" stop-color="hsl(${hue} 40% 92%)"/>
  </linearGradient></defs>
  <rect width="640" height="400" fill="url(#g)"/>
  <circle cx="520" cy="90" r="40" fill="hsl(45 90% 75%)"/>
  ${mountains}
  <rect x="0" y="300" width="640" height="100" fill="hsl(${hue} 25% 30%)"/>
  <rect x="20" y="20" width="250" height="40" rx="6" fill="rgba(0,0,0,.65)"/>
  <text x="34" y="47" font-family="sans-serif" font-size="20" fill="#fff">ZDJĘCIE PRZYKŁADOWE</text>
  <text x="320" y="360" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#fff">${label}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Dane przykładowe. Daty liczone względem dzisiejszej daty, aby ekran „Dzisiaj”
 * zawsze miał co pokazać. Nazwy kempingów, telefony i strony są fikcyjne.
 */
export function createSeed(): AppData {
  const t = todayISO();
  const now = new Date().toISOString();
  const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

  return {
    stays: [
      {
        id: 's1',
        start: addDays(t, -7),
        end: addDays(t, -4),
        name: 'Kemping Przykładowy nad Wisłą',
        address: 'ul. Przykładowa 1, 24-120 Kazimierz Dolny (adres fikcyjny)',
        cost: { amount: 95, currency: 'PLN', basis: 'noc' },
        phone: '+48 000 000 001',
        website: 'https://example.com/kemping-wisla',
        lat: 51.3205,
        lng: 21.9475,
        demo: true,
      },
      {
        id: 's2',
        start: addDays(t, -4),
        end: t,
        name: 'Kemping Demonstracyjny pod Wawelem',
        address: 'ul. Testowa 12, 30-001 Kraków (adres fikcyjny)',
        cost: { amount: 420, currency: 'PLN', basis: 'pobyt' },
        phone: '+48 000 000 002',
        website: 'https://example.com/kemping-krakow',
        lat: 50.0375,
        lng: 19.9135,
        demo: true,
      },
      {
        id: 's3',
        start: t,
        end: addDays(t, 3),
        name: 'Pole Kempingowe Przykład Tatry',
        address: 'ul. Górska 5, 34-500 Zakopane (adres fikcyjny)',
        cost: { amount: 110, currency: 'PLN', basis: 'noc' },
        phone: '+48 000 000 003',
        website: 'https://example.com/kemping-tatry',
        lat: 49.2915,
        lng: 19.9565,
        demo: true,
      },
      {
        id: 's4',
        start: addDays(t, 3),
        end: addDays(t, 6),
        name: 'Autocamp Ukážka Liptov',
        address: 'Príkladová 7, 031 01 Liptovský Mikuláš (adres fikcyjny)',
        cost: { amount: 28, currency: 'EUR', basis: 'nieustalone' },
        phone: '+421 000 000 004',
        website: 'https://example.com/autocamp-liptov',
        lat: 49.0835,
        lng: 19.6085,
        demo: true,
      },
    ],
    places: [
      {
        id: 'p1',
        name: 'Dolina Kościeliska (przykład)',
        note: 'Spacer na pół dnia. Sprawdzić parking dla kampera.',
        lat: 49.2785,
        lng: 19.8705,
        routeAfterStayId: 's3',
        demo: true,
      },
      {
        id: 'p2',
        name: 'Jaskinia Demänovska (przykład)',
        note: 'Godziny otwarcia do sprawdzenia.',
        lat: 48.9985,
        lng: 19.5865,
        routeAfterStayId: null,
        demo: true,
      },
      {
        id: 'p3',
        name: 'Zamek w Niedzicy (przykład)',
        note: 'Można zahaczyć po drodze z Tatr.',
        lat: 49.4215,
        lng: 20.3195,
        routeAfterStayId: null,
        demo: true,
      },
    ],
    readings: [
      { id: 'r1', kind: 'woda', percent: 80, rawValue: null, rawUnit: '', at: hoursAgo(50), demo: true },
      { id: 'r2', kind: 'woda', percent: 35, rawValue: null, rawUnit: '', at: hoursAgo(5), demo: true },
      { id: 'r3', kind: 'gaz', percent: 60, rawValue: null, rawUnit: '', at: hoursAgo(30), demo: true },
      { id: 'r4', kind: 'akumulator', percent: 90, rawValue: 12.8, rawUnit: 'V', at: hoursAgo(26), demo: true },
      { id: 'r5', kind: 'akumulator', percent: 15, rawValue: 11.9, rawUnit: 'V', at: hoursAgo(2), demo: true },
    ],
    journal: [
      {
        id: 'j1',
        date: addDays(t, -7),
        title: 'Start! Pierwszy nocleg nad Wisłą',
        text: 'Wpis przykładowy. Wyruszyliśmy po południu, pierwszy postój nad rzeką. Wieczorny spacer po rynku i lody.',
        placeName: 'Kazimierz Dolny',
        lat: 51.3225,
        lng: 21.9505,
        photos: [
          { src: placeholderPhoto('Kazimierz Dolny', 200, 1), caption: 'Widok na rzekę (przykład)', demo: true },
        ],
        demo: true,
      },
      {
        id: 'j2',
        date: addDays(t, -5),
        title: 'Wąwozy lessowe',
        text: 'Wpis przykładowy. Cały dzień na rowerach — rowery jadą z nami na bagażniku z tyłu kampera.',
        placeName: 'Okolice Kazimierza Dolnego',
        lat: 51.3105,
        lng: 21.9705,
        photos: [
          { src: placeholderPhoto('Wąwóz Korzeniowy Dół', 110, 0), caption: 'Wąwóz (przykład)', demo: true },
          { src: placeholderPhoto('Rowerem po okolicy', 140, 1), caption: 'Na rowerach (przykład)', demo: true },
        ],
        demo: true,
      },
      {
        id: 'j3',
        date: addDays(t, -3),
        title: 'Kraków — Wawel i Kazimierz',
        text: 'Wpis przykładowy. Do centrum dojechaliśmy tramwajem, kamper odpoczywał na kempingu.',
        placeName: 'Kraków',
        lat: 50.0545,
        lng: 19.9355,
        photos: [{ src: placeholderPhoto('Kraków', 25, 0), caption: 'Wawel (przykład)', demo: true }],
        demo: true,
      },
      {
        id: 'j4',
        date: addDays(t, -1),
        title: 'Kopalnia soli',
        text: 'Wpis przykładowy. Zwiedzanie trasy turystycznej, potem obiad i pakowanie przed jutrzejszym przejazdem.',
        placeName: 'Wieliczka',
        lat: 49.9835,
        lng: 20.0555,
        photos: [{ src: placeholderPhoto('Wieliczka', 280, 1), caption: 'Pod ziemią (przykład)', demo: true }],
        demo: true,
      },
    ],
    status: {
      where: 'Wpis przykładowy. Dziś przejeżdżamy z Krakowa pod Tatry.',
      plans: 'Wpis przykładowy. Trzy noce w Tatrach, potem Słowacja — Liptów.',
      updatedAt: now,
      demo: true,
    },
  };
}
