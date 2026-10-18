import { useMemo, useState, type FormEvent } from 'react';
import { DemoBadge, Notice } from '../components/Badges';
import MapView from '../components/MapView';
import { sortedStays, useStore } from '../data/store';
import type { CostBasis, Stay } from '../data/types';
import { addDays, formatDate, formatShort, nightsBetween, parseISO, todayISO, toISODate, uid } from '../lib/dates';
import { describeCost, telHref } from '../lib/format';

const WEEKDAYS = ['pn', 'wt', 'śr', 'cz', 'pt', 'so', 'nd'];
const CURRENCIES = ['PLN', 'EUR', 'CZK', 'HUF', 'CHF'];

function monthGrid(year: number, month: number): string[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // poniedziałek = 0
  const start = toISODate(new Date(year, month, 1 - offset));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

const emptyForm = () => ({
  start: todayISO(),
  end: addDays(todayISO(), 2),
  name: '',
  address: '',
  amount: '',
  currency: 'PLN',
  basis: '' as CostBasis | '',
  phone: '',
  website: '',
  lat: null as number | null,
  lng: null as number | null,
});

export default function CalendarPage() {
  const { data, update } = useStore();
  const stays = sortedStays(data.stays);
  const today = todayISO();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selectedId, setSelectedId] = useState<string | null>(stays[0]?.id ?? null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const days = useMemo(() => monthGrid(cursor.y, cursor.m), [cursor]);
  const indexOf = (s: Stay) => stays.findIndex((x) => x.id === s.id) + 1;
  const selected = stays.find((s) => s.id === selectedId);
  const monthName = new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(new Date(cursor.y, cursor.m, 1));

  function shiftMonth(delta: number) {
    setCursor(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Podaj nazwę kempingu.');
    if (form.end <= form.start) return setFormError('Data wyjazdu musi być późniejsza niż data przyjazdu.');
    if (form.amount !== '' && !form.basis) return setFormError('Wybierz, czego dotyczy kwota: noc czy cały pobyt.');
    if (form.lat === null || form.lng === null) return setFormError('Zaznacz lokalizację kempingu, klikając na mapie.');
    const stay: Stay = {
      id: uid(),
      start: form.start,
      end: form.end,
      name: form.name.trim(),
      address: form.address.trim(),
      cost: {
        amount: form.amount === '' ? null : Number(form.amount),
        currency: form.currency,
        basis: form.basis || 'nieustalone',
      },
      phone: form.phone.trim(),
      website: form.website.trim(),
      lat: form.lat,
      lng: form.lng,
      demo: false,
    };
    update((d) => ({ ...d, stays: [...d.stays, stay] }));
    setSelectedId(stay.id);
    setShowForm(false);
    setForm(emptyForm());
    setFormError(null);
    const sd = parseISO(stay.start);
    setCursor({ y: sd.getFullYear(), m: sd.getMonth() });
  }

  function remove(id: string) {
    if (!confirm('Usunąć ten pobyt z planu?')) return;
    update((d) => ({ ...d, stays: d.stays.filter((s) => s.id !== id) }));
    setSelectedId(null);
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Kalendarz pobytów</h1>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Anuluj' : '+ Dodaj pobyt'}
        </button>
      </div>

      {showForm && (
        <form className="card form" onSubmit={submit}>
          <h2>Nowy pobyt</h2>
          <div className="form-row">
            <label>
              Przyjazd
              <input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
            </label>
            <label>
              Wyjazd
              <input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
            </label>
            <div className="form-hint">
              Noclegów: <strong>{form.end > form.start ? nightsBetween(form.start, form.end) : '—'}</strong> (od dnia
              przyjazdu do dnia wyjazdu)
            </div>
          </div>
          <label>
            Nazwa kempingu
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Adres
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          <fieldset>
            <legend>Koszt</legend>
            <div className="form-row">
              <label>
                Kwota
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </label>
              <label>
                Waluta
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Kwota dotyczy
                <select value={form.basis} onChange={(e) => setForm({ ...form, basis: e.target.value as CostBasis })}>
                  <option value="">— wybierz —</option>
                  <option value="noc">jednej nocy</option>
                  <option value="pobyt">całego pobytu</option>
                  <option value="nieustalone">nie wiem / do ustalenia</option>
                </select>
              </label>
            </div>
            <p className="form-hint">
              ⚠ Lista walut i sposób rozliczania są robocze (do ustalenia z właścicielem).
            </p>
          </fieldset>
          <div className="form-row">
            <label>
              Telefon
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label>
              Strona WWW
              <input
                type="url"
                placeholder="https://"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </label>
          </div>
          <div>
            <div className="label-text">
              Lokalizacja — kliknij na mapie{' '}
              {form.lat !== null && (
                <span className="ok-text">
                  ✓ {form.lat.toFixed(4)}, {form.lng!.toFixed(4)}
                </span>
              )}
            </div>
            <MapView
              height={280}
              onPick={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
              center={form.lat === null ? [50.0, 19.9] : undefined}
              zoom={7}
              markers={
                form.lat !== null
                  ? [{ id: 'new', lat: form.lat, lng: form.lng!, symbol: '+', className: 'pin-target', title: 'Nowy pobyt' }]
                  : []
              }
            />
          </div>
          {formError && <p className="error-text">✗ {formError}</p>}
          <button className="btn btn-primary" type="submit">
            Zapisz pobyt
          </button>
        </form>
      )}

      <div className="calendar card">
        <div className="calendar-head">
          <button className="btn btn-ghost" onClick={() => shiftMonth(-1)} aria-label="Poprzedni miesiąc">
            ←
          </button>
          <h2>{monthName}</h2>
          <button className="btn btn-ghost" onClick={() => shiftMonth(1)} aria-label="Następny miesiąc">
            →
          </button>
        </div>
        <div className="calendar-grid">
          {WEEKDAYS.map((w) => (
            <div key={w} className="calendar-wd">
              {w}
            </div>
          ))}
          {days.map((d) => {
            const inMonth = Number(d.slice(5, 7)) - 1 === cursor.m;
            const nightStays = stays.filter((s) => s.start <= d && d < s.end);
            const departing = stays.filter((s) => s.end === d);
            return (
              <div key={d} className={`calendar-day${inMonth ? '' : ' muted'}${d === today ? ' today' : ''}`}>
                <div className="calendar-num">
                  {Number(d.slice(8))}
                  {d === today && <span className="today-tag">dziś</span>}
                </div>
                {departing.map((s) => (
                  <button key={`d${s.id}`} className="stay-chip departing" onClick={() => setSelectedId(s.id)}>
                    ↗ {indexOf(s)} wyjazd
                  </button>
                ))}
                {nightStays.map((s) => (
                  <button
                    key={s.id}
                    className={`stay-chip p${indexOf(s) % 4}${s.id === selectedId ? ' selected' : ''}`}
                    onClick={() => setSelectedId(s.id)}
                    title={s.name}
                  >
                    {s.start === d ? '↘ ' : ''}
                    {indexOf(s)} {s.name}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
        <p className="form-hint">
          Każdy pobyt ma numer i własny wzór tła. ↘ — dzień przyjazdu, ↗ — dzień wyjazdu.
        </p>
      </div>

      <div className="two-col">
        <section className="card">
          <h2>Wszystkie pobyty</h2>
          <ol className="stay-list">
            {stays.map((s) => (
              <li key={s.id}>
                <button className={`stay-row${s.id === selectedId ? ' selected' : ''}`} onClick={() => setSelectedId(s.id)}>
                  <span className={`stay-num p${indexOf(s) % 4}`}>{indexOf(s)}</span>
                  <span>
                    <strong>{s.name}</strong>
                    <br />
                    <small>
                      {formatShort(s.start)} – {formatShort(s.end)} · {nightsBetween(s.start, s.end)} noc(y)
                    </small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>

        {selected && (
          <section className="card">
            <h2>
              {indexOf(selected)}. {selected.name} {selected.demo && <DemoBadge />}
            </h2>
            <dl className="details">
              <dt>Termin</dt>
              <dd>
                {formatDate(selected.start)} – {formatDate(selected.end)} ({nightsBetween(selected.start, selected.end)}{' '}
                noc(y))
              </dd>
              <dt>Adres</dt>
              <dd>{selected.address || '—'}</dd>
              <dt>Koszt</dt>
              <dd>
                {describeCost(selected).main}
                <br />
                <small>{describeCost(selected).detail}</small>
              </dd>
              <dt>Telefon</dt>
              <dd>{selected.phone ? <a href={telHref(selected.phone)}>📞 {selected.phone}</a> : '—'}</dd>
              <dt>WWW</dt>
              <dd>
                {selected.website ? (
                  <a href={selected.website} target="_blank" rel="noreferrer">
                    {selected.website} ↗
                  </a>
                ) : (
                  '—'
                )}
              </dd>
            </dl>
            <MapView
              height={240}
              markers={[{ id: selected.id, lat: selected.lat, lng: selected.lng, symbol: String(indexOf(selected)), className: 'pin-target', title: selected.name }]}
            />
            {selected.demo && <Notice kind="demo">Nazwa, adres, telefon i strona tego kempingu są fikcyjne.</Notice>}
            <button className="btn btn-danger" onClick={() => remove(selected.id)}>
              Usuń pobyt
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
