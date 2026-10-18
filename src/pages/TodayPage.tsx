import { Link } from 'react-router-dom';
import { DemoBadge, Notice, SimBadge } from '../components/Badges';
import MapView from '../components/MapView';
import { currentStay, nextTarget, previousStay, useStore } from '../data/store';
import { formatWeekday, nightsBetween, todayISO } from '../lib/dates';
import { describeCost, telHref } from '../lib/format';
import { estimateDrive, formatMinutes } from '../lib/geo';

export default function TodayPage() {
  const { data } = useStore();
  const today = todayISO();
  const target = nextTarget(data.stays, today);
  const current = currentStay(data.stays, today);
  const from = target ? previousStay(data.stays, target) : undefined;
  const isTravelDay = target?.start === today;
  const est = target && from ? estimateDrive(from, target) : undefined;

  return (
    <div className="page">
      <h1>Dzisiaj</h1>
      <p className="lead">{formatWeekday(today)}</p>

      {!target && !current && (
        <div className="card">
          <p>Brak zaplanowanych pobytów. Dodaj pobyt w <Link to="/kalendarz">kalendarzu</Link>.</p>
        </div>
      )}

      {target && (
        <section className="card today-hero">
          <div className="today-label">{isTravelDay ? 'Cel dzisiejszego przejazdu' : 'Następny cel'}</div>
          <h2>
            {target.name} {target.demo && <DemoBadge />}
          </h2>
          <p className="today-address">
            <span aria-hidden>📍</span> {target.address}
          </p>
          {!isTravelDay && <p>Przyjazd: {formatWeekday(target.start)}</p>}

          <div className="today-grid">
            <div className="stat">
              <div className="stat-label">
                Szacowany czas dojazdu <SimBadge />
              </div>
              <div className="stat-value">{est ? formatMinutes(est.camperMinutes) : '—'}</div>
              <div className="stat-sub">
                {est
                  ? `${from?.name ? `z: ${from.name}, ` : ''}ok. ${Math.round(est.roadKm)} km`
                  : 'Brak punktu startowego w planie.'}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">Koszt pobytu</div>
              <div className="stat-value small">{describeCost(target).main}</div>
              <div className="stat-sub">{describeCost(target).detail}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Noclegi</div>
              <div className="stat-value">{nightsBetween(target.start, target.end)}</div>
            </div>
          </div>

          <div className="actions">
            {target.phone && (
              <a className="btn btn-primary btn-big" href={telHref(target.phone)}>
                <span aria-hidden>📞</span> Zadzwoń na kemping ({target.phone})
              </a>
            )}
            <a
              className="btn"
              href={`https://www.openstreetmap.org/?mlat=${target.lat}&mlon=${target.lng}#map=14/${target.lat}/${target.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              Otwórz na mapie ↗
            </a>
            {target.website && (
              <a className="btn" href={target.website} target="_blank" rel="noreferrer">
                Strona WWW ↗
              </a>
            )}
          </div>

          <Notice kind="sim">
            Czas dojazdu to <strong>symulacja</strong> na podstawie odległości w linii prostej i spokojnego tempa
            kampera. Nie sprawdza rzeczywistych dróg, ruchu, ograniczeń wysokości ani przejezdności.
          </Notice>
        </section>
      )}

      {target && (
        <MapView
          height={300}
          markers={[
            ...(from
              ? [{ id: 'from', lat: from.lat, lng: from.lng, symbol: 'A', className: 'pin-past', title: `Start: ${from.name}` }]
              : []),
            { id: 'to', lat: target.lat, lng: target.lng, symbol: 'B', className: 'pin-target', title: `Cel: ${target.name}`, permanentLabel: true },
          ]}
          lines={
            from
              ? [{ id: 'l', points: [[from.lat, from.lng], [target.lat, target.lng]], dashed: true, label: 'Linia poglądowa — nie jest rzeczywistą trasą' }]
              : []
          }
        />
      )}

      {current && current.id !== target?.id && (
        <section className="card">
          <h2>Obecny pobyt</h2>
          <p>
            <strong>{current.name}</strong> {current.demo && <DemoBadge />}
          </p>
          <p>{current.address}</p>
          {current.phone && (
            <a className="btn" href={telHref(current.phone)}>
              📞 {current.phone}
            </a>
          )}
        </section>
      )}
    </div>
  );
}
