# CamperMizar

Aplikacja webowa do planowania podróży kamperem CI Mizar 140 (1996, Fiat Ducato), obsługi jego wyposażenia i prowadzenia dziennika podróży.

Wymagania: [docs/wymagania-aplikacji-kamper.md](docs/wymagania-aplikacji-kamper.md)

## Etap 1 — interaktywny prototyp (bez backendu)

Wszystkie dane są przykładowe, a wyniki usług zewnętrznych (czas przejazdu, zasięg) są symulowane i tak oznaczone. Zmiany zapisują się tylko w pamięci przeglądarki (`localStorage`); przycisk „Przywróć dane przykładowe” w górnym pasku je czyści.

Hasło demonstracyjne do części prywatnej: `kamper` (sprawdzane w przeglądarce — tylko w prototypie).

### Uruchomienie

```bash
npm install
npm run dev
```

Następnie otwórz http://localhost:5173.

Wersja do wgrania jako statyczne pliki: `npm run build` → katalog `dist/`.

### Technologia

React 18 + TypeScript + Vite, mapy: Leaflet z kafelkami OpenStreetMap.
