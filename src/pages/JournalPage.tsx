import { Link } from 'react-router-dom';
import { DemoBadge, Notice } from '../components/Badges';
import JournalEntryView from '../components/JournalEntryView';
import MapView from '../components/MapView';
import { useAuth } from '../data/auth';
import { useStore } from '../data/store';
import { formatDateTime, formatShort } from '../lib/dates';

export default function JournalPage() {
  const { data } = useStore();
  const { unlocked } = useAuth();
  const entries = [...data.journal].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const located = [...entries].reverse().filter((e) => e.lat !== null && e.lng !== null);

  return (
    <div className="page journal">
      <header className="journal-hero">
        <h1>
          <span aria-hidden>🚐</span> Dziennik podróży kamperem
        </h1>
        <p className="lead">CI Mizar 140 · rok 1996 · Fiat Ducato</p>
        {unlocked && (
          <Link className="btn btn-primary" to="/dziennik/nowy">
            ✎ Nowy wpis
          </Link>
        )}
      </header>

      <section className="card status-card">
        <h2>
          Gdzie jesteśmy teraz {data.status.demo && <DemoBadge />}
        </h2>
        <p>{data.status.where}</p>
        <h3>Dalsze plany</h3>
        <p>{data.status.plans}</p>
        <p className="muted-text">Zaktualizowano: {formatDateTime(data.status.updatedAt)}</p>
      </section>

      <section className="card">
        <h2>Przebyta trasa</h2>
        <MapView
          height={360}
          markers={located.map((e, i) => ({
            id: e.id,
            lat: e.lat!,
            lng: e.lng!,
            symbol: String(i + 1),
            className: 'pin-past',
            title: `${i + 1}. ${e.placeName} (${formatShort(e.date)})`,
          }))}
          lines={[{ id: 'trasa', points: located.map((e) => [e.lat!, e.lng!] as [number, number]), className: 'route-line route-past' }]}
        />
        <p className="form-hint">
          Linia łączy kolejno lokalizacje wpisów (poglądowo, nie jest zapisem GPS). Sposób zapisywania rzeczywistej
          przebytej trasy jest do ustalenia.
        </p>
      </section>

      {entries.some((e) => e.demo) && (
        <Notice kind="demo">Wpisy i zdjęcia oznaczone jako przykładowe są danymi demonstracyjnymi.</Notice>
      )}

      <ol className="timeline">
        {entries.map((e) => (
          <li key={e.id}>
            <JournalEntryView entry={e} />
          </li>
        ))}
      </ol>
    </div>
  );
}
