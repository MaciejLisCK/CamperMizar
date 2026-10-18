import { Link } from 'react-router-dom';
import { Notice, SimBadge, TodoBadge } from '../components/Badges';
import MapView from '../components/MapView';
import { ROAD_AVOID, ROAD_PREFERENCES, VEHICLE } from '../data/camper';
import { buildRoute, useStore } from '../data/store';
import { formatShort, todayISO } from '../lib/dates';
import { estimateDrive, formatMinutes, SIM } from '../lib/geo';

function dim(v: number | null, unit: string) {
  return v === null ? <TodoBadge /> : `${v} ${unit}`;
}

export default function RoutePage() {
  const { data } = useStore();
  const today = todayISO();
  const route = buildRoute(data);
  const legs = route.slice(1).map((to, i) => ({ from: route[i], to, est: estimateDrive(route[i], to) }));
  const total = legs.reduce((acc, l) => ({ km: acc.km + l.est.roadKm, min: acc.min + l.est.camperMinutes }), { km: 0, min: 0 });

  let stayNo = 0;
  const markers = route.map((p) => {
    const past = p.stay ? p.stay.end <= today : false;
    if (p.kind === 'stay') stayNo += 1;
    return {
      id: p.id,
      lat: p.lat,
      lng: p.lng,
      symbol: p.kind === 'stay' ? String(stayNo) : '★',
      className: p.kind === 'place' ? 'pin-place' : past ? 'pin-past' : 'pin-target',
      title: p.name,
      permanentLabel: true,
    };
  });

  return (
    <div className="page">
      <h1>Trasa i przejazdy</h1>
      <Notice kind="sim">
        <strong>Symulacja.</strong> Prototyp nie korzysta z usługi wyznaczania tras. Linie na mapie łączą punkty w linii
        prostej, a czasy są przybliżeniem. <strong>Nie sprawdzono przejezdności, ograniczeń wysokości, wąskich dróg ani
        progów zwalniających.</strong> Brak danych o ograniczeniach nie oznacza potwierdzonej przejezdności.
      </Notice>

      <div className="two-col">
        <section className="card">
          <h2>Profil kampera</h2>
          <dl className="details">
            <dt>Pojazd</dt>
            <dd>
              {VEHICLE.name}, {VEHICLE.year}, baza {VEHICLE.base}
            </dd>
            <dt>Wysokość</dt>
            <dd>{dim(VEHICLE.heightM, 'm')}</dd>
            <dt>Szerokość</dt>
            <dd>{dim(VEHICLE.widthM, 'm')}</dd>
            <dt>Długość</dt>
            <dd>{dim(VEHICLE.lengthM, 'm')}</dd>
            <dt>Masa</dt>
            <dd>{dim(VEHICLE.massKg, 'kg')}</dd>
            <dt>Tempo jazdy</dt>
            <dd>
              spokojne, śr. {SIM.camperAvgKmh} km/h + {SIM.breakMin} min przerwy co {SIM.breakEveryMin / 60} h <SimBadge>ZAŁOŻENIE</SimBadge>
            </dd>
          </dl>
          <p className="form-hint">Wymiary i masa rzeczywistego pojazdu pozostają do uzupełnienia przez właściciela.</p>
        </section>

        <section className="card">
          <h2>Preferencje dróg</h2>
          <ol className="pref-list">
            {ROAD_PREFERENCES.map((p) => (
              <li key={p.rank}>
                <span className="pref-rank">{p.rank}</span> {p.label}
              </li>
            ))}
          </ol>
          <h3>Unikać</h3>
          <ul className="avoid-list">
            {ROAD_AVOID.map((a) => (
              <li key={a}>
                <span aria-hidden>⛔</span> {a}
              </li>
            ))}
          </ul>
          <Notice kind="warn">
            Preferencje są zapisane, ale w prototypie <strong>nie wpływają na przebieg linii</strong>. Które z nich
            obsłuży wybrany dostawca tras — do ustalenia.
          </Notice>
        </section>
      </div>

      <MapView
        height={440}
        markers={markers}
        lines={legs.map((l, i) => ({
          id: `leg${i}`,
          points: [[l.from.lat, l.from.lng], [l.to.lat, l.to.lng]],
          dashed: true,
          label: `Odcinek ${i + 1} — linia poglądowa, nie rzeczywista trasa`,
        }))}
      />
      <p className="form-hint">
        Legenda: <span className="legend-pin pin-past">1</span> pobyt zakończony ·{' '}
        <span className="legend-pin pin-target">2</span> pobyt planowany · <span className="legend-pin pin-place">★</span>{' '}
        miejsce do odwiedzenia dodane do trasy (<Link to="/miejsca">zarządzaj</Link>) · linia przerywana — połączenie
        poglądowe
      </p>

      <section className="card">
        <h2>
          Odcinki <SimBadge />
        </h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Z</th>
                <th>Do</th>
                <th>Odległość (szac.)</th>
                <th>Czas kamperem (szac.)</th>
                <th>Dla porównania: samochód</th>
              </tr>
            </thead>
            <tbody>
              {legs.map((l, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{l.from.name}</td>
                  <td>
                    {l.to.kind === 'place' ? '★ ' : ''}
                    {l.to.name}
                    {l.to.stay && <small> (przyjazd {formatShort(l.to.stay.start)})</small>}
                  </td>
                  <td>≈ {Math.round(l.est.roadKm)} km</td>
                  <td>
                    <strong>≈ {formatMinutes(l.est.camperMinutes)}</strong>
                  </td>
                  <td>≈ {formatMinutes(l.est.carMinutes)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Razem</td>
                <td>≈ {Math.round(total.km)} km</td>
                <td>
                  <strong>≈ {formatMinutes(total.min)}</strong>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="form-hint">
          Odległość = linia prosta × {SIM.roadFactor} (przybliżenie długości drogi). To nie jest wynik wyznaczania trasy.
        </p>
      </section>
    </div>
  );
}
