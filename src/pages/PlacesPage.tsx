import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { DemoBadge } from '../components/Badges';
import MapView from '../components/MapView';
import { sortedStays, useStore } from '../data/store';
import type { Place } from '../data/types';
import { formatShort, uid } from '../lib/dates';

export default function PlacesPage() {
  const { data, update } = useStore();
  const stays = sortedStays(data.stays);
  const [form, setForm] = useState({ name: '', note: '', lat: null as number | null, lng: null as number | null });
  const [error, setError] = useState<string | null>(null);

  function setRoute(id: string, stayId: string) {
    update((d) => ({
      ...d,
      places: d.places.map((p) => (p.id === id ? { ...p, routeAfterStayId: stayId || null } : p)),
    }));
  }

  function remove(id: string) {
    if (!confirm('Usunąć to miejsce?')) return;
    update((d) => ({ ...d, places: d.places.filter((p) => p.id !== id) }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setError('Podaj nazwę miejsca.');
    if (form.lat === null || form.lng === null) return setError('Zaznacz miejsce na mapie.');
    const place: Place = { id: uid(), name: form.name.trim(), note: form.note.trim(), lat: form.lat, lng: form.lng, routeAfterStayId: null, demo: false };
    update((d) => ({ ...d, places: [...d.places, place] }));
    setForm({ name: '', note: '', lat: null, lng: null });
    setError(null);
  }

  return (
    <div className="page">
      <h1>Miejsca do odwiedzenia</h1>
      <p className="lead">
        Zapisuj ciekawe miejsca na później i dodawaj je do <Link to="/trasa">trasy</Link> jako przystanki po wybranym
        pobycie.
      </p>

      <MapView
        height={360}
        onPick={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
        markers={[
          ...data.places.map((p) => ({
            id: p.id,
            lat: p.lat,
            lng: p.lng,
            symbol: p.routeAfterStayId ? '★' : '☆',
            className: 'pin-place',
            title: `${p.name}${p.routeAfterStayId ? ' (na trasie)' : ''}`,
            permanentLabel: true,
          })),
          ...(form.lat !== null ? [{ id: 'new', lat: form.lat, lng: form.lng!, symbol: '+', className: 'pin-target', title: 'Nowe miejsce' }] : []),
        ]}
      />
      <p className="form-hint">★ — miejsce dodane do trasy · ☆ — zapisane na później · kliknij mapę, aby zaznaczyć nowe miejsce.</p>

      <div className="two-col">
        <section className="card">
          <h2>Zapisane miejsca</h2>
          <ul className="place-list">
            {data.places.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>
                    {p.routeAfterStayId ? '★' : '☆'} {p.name}
                  </strong>{' '}
                  {p.demo && <DemoBadge />}
                  {p.note && <p>{p.note}</p>}
                </div>
                <label>
                  Na trasie:
                  <select value={p.routeAfterStayId ?? ''} onChange={(e) => setRoute(p.id, e.target.value)}>
                    <option value="">— nie, zapisane na później —</option>
                    {stays.map((s) => (
                      <option key={s.id} value={s.id}>
                        po pobycie: {s.name} ({formatShort(s.start)})
                      </option>
                    ))}
                  </select>
                </label>
                <button className="btn btn-ghost btn-small" onClick={() => remove(p.id)}>
                  Usuń
                </button>
              </li>
            ))}
          </ul>
        </section>

        <form className="card form" onSubmit={submit}>
          <h2>Dodaj miejsce</h2>
          <label>
            Nazwa
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Notatka
            <textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </label>
          <p className="label-text">
            Lokalizacja:{' '}
            {form.lat !== null ? (
              <span className="ok-text">
                ✓ {form.lat.toFixed(4)}, {form.lng!.toFixed(4)}
              </span>
            ) : (
              'kliknij na mapie powyżej'
            )}
          </p>
          {error && <p className="error-text">✗ {error}</p>}
          <button className="btn btn-primary" type="submit">
            Zapisz miejsce
          </button>
        </form>
      </div>
    </div>
  );
}
