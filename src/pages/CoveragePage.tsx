import { useMemo, useState } from 'react';
import { DemoBadge, Notice } from '../components/Badges';
import MapView, { type MapMarker } from '../components/MapView';
import { buildRoute, useStore } from '../data/store';
import { interpolate } from '../lib/geo';

type Level = 'dobry' | 'slaby' | 'nieznany';

const LEVELS: Record<Level, { label: string; symbol: string; desc: string }> = {
  dobry: { label: 'Dobry (szacunek)', symbol: '▮▮▮', desc: 'Przewidywany dobry zasięg' },
  slaby: { label: 'Słaby (szacunek)', symbol: '▮▯▯', desc: 'Przewidywany słaby zasięg' },
  nieznany: { label: 'Nieznany', symbol: '?', desc: 'Brak danych — nie wiadomo' },
};

/** Deterministyczny pseudolosowy poziom — DANE DEMONSTRACYJNE, nie pochodzą z żadnej bazy BTS. */
function demoLevel(seed: string): Level {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const r = h % 10;
  return r < 5 ? 'dobry' : r < 8 ? 'slaby' : 'nieznany';
}

function LevelTag({ level }: { level: Level }) {
  return (
    <span className={`level-tag lvl-${level}`}>
      <span aria-hidden>{LEVELS[level].symbol}</span> {LEVELS[level].label}
    </span>
  );
}

export default function CoveragePage() {
  const { data } = useStore();
  const route = buildRoute(data);
  const [visible, setVisible] = useState<Record<Level, boolean>>({ dobry: true, slaby: true, nieznany: true });

  const points = useMemo(() => {
    const pts: { id: string; lat: number; lng: number; level: Level; name: string; isStop: boolean }[] = [];
    route.forEach((p, i) => {
      pts.push({ id: `stop-${p.id}`, lat: p.lat, lng: p.lng, level: demoLevel(p.id + p.name), name: p.name, isStop: true });
      const next = route[i + 1];
      if (next) {
        [0.2, 0.4, 0.6, 0.8].forEach((t) => {
          const q = interpolate(p, next, t);
          pts.push({ id: `seg-${i}-${t}`, ...q, level: demoLevel(`${p.id}-${next.id}-${t}`), name: `Trasa: odcinek ${i + 1}`, isStop: false });
        });
      }
    });
    return pts;
  }, [route]);

  const markers: MapMarker[] = points
    .filter((p) => visible[p.level])
    .map((p) => ({
      id: p.id,
      lat: p.lat,
      lng: p.lng,
      symbol: LEVELS[p.level].symbol,
      className: `pin-cov lvl-${p.level}${p.isStop ? ' pin-stop' : ''}`,
      title: `${p.name} — ${LEVELS[p.level].label} (dane demonstracyjne)`,
      popup: (
        <div>
          <strong>{p.name}</strong>
          <br />
          <LevelTag level={p.level} />
          <br />
          <small>◇ Dane demonstracyjne — nie pochodzą z bazy nadajników.</small>
        </div>
      ),
    }));

  const stops = points.filter((p) => p.isStop);

  return (
    <div className="page">
      <h1>
        Przewidywany zasięg internetu <DemoBadge>DANE DEMONSTRACYJNE</DemoBadge>
      </h1>
      <Notice kind="demo">
        <strong>To nie są prawdziwe dane o zasięgu.</strong> Poziomy wygenerowano losowo, aby pokazać wygląd ekranu.
        Prototyp nie sprawdził zasięgu żadnego operatora. W docelowej wersji wynik będzie <strong>szacunkiem</strong>{' '}
        na podstawie danych o nadajnikach (BTS) i pokryciu — nie gwarancją prędkości. Operatorzy, kraje i źródło danych
        są do ustalenia.
      </Notice>

      <fieldset className="card filter-row">
        <legend>Pokaż poziomy</legend>
        {(Object.keys(LEVELS) as Level[]).map((l) => (
          <label key={l} className="check">
            <input type="checkbox" checked={visible[l]} onChange={(e) => setVisible({ ...visible, [l]: e.target.checked })} />
            <LevelTag level={l} />
          </label>
        ))}
      </fieldset>

      <MapView
        height={460}
        markers={markers}
        lines={route.slice(1).map((to, i) => ({
          id: `l${i}`,
          points: [[route[i].lat, route[i].lng], [to.lat, to.lng]],
          dashed: true,
          className: 'route-line route-muted',
        }))}
      />
      <p className="form-hint">
        Legenda: <LevelTag level="dobry" /> kółko z trzema kreskami · <LevelTag level="slaby" /> kwadrat z jedną kreską
        · <LevelTag level="nieznany" /> romb przerywany ze znakiem zapytania. Większe znaczniki z obwódką — miejsca
        postoju.
      </p>

      <section className="card">
        <h2>Miejsca postoju</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Miejsce</th>
                <th>Przewidywany zasięg</th>
                <th>Źródło</th>
              </tr>
            </thead>
            <tbody>
              {stops.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>
                    <LevelTag level={s.level} />
                  </td>
                  <td>
                    <DemoBadge>DEMO</DemoBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
