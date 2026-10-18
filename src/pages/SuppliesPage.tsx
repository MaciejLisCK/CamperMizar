import { useState, type FormEvent } from 'react';
import { DemoBadge, Notice } from '../components/Badges';
import { useStore } from '../data/store';
import type { Reading, SupplyKind } from '../data/types';
import { formatDateTime, uid } from '../lib/dates';

const KINDS: { kind: SupplyKind; label: string; icon: string; units: string[] }[] = [
  { kind: 'woda', label: 'Woda', icon: '💧', units: ['', 'l'] },
  { kind: 'gaz', label: 'Gaz', icon: '🔥', units: ['', 'kg', 'butle'] },
  { kind: 'akumulator', label: 'Akumulator', icon: '🔋', units: ['', 'V', '%'] },
];

function band(percent: number) {
  if (percent <= 25) return { key: 'low', label: 'Niski', symbol: '▁' };
  if (percent <= 60) return { key: 'mid', label: 'Średni', symbol: '▄' };
  return { key: 'high', label: 'Wysoki', symbol: '█' };
}

function Gauge({ r }: { r: Reading }) {
  const b = band(r.percent);
  return (
    <div className="gauge">
      <div className={`gauge-bar band-${b.key}`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={r.percent} aria-label={`${r.percent}% — ${b.label}`}>
        <div className="gauge-fill" style={{ width: `${r.percent}%` }} />
        {[25, 60].map((t) => (
          <span key={t} className="gauge-tick" style={{ left: `${t}%` }} />
        ))}
      </div>
      <div className="gauge-text">
        <strong>{r.percent}%</strong> <span className={`band-tag band-${b.key}`}>{b.symbol} {b.label}</span>
        {r.rawValue !== null && (
          <span className="muted-text">
            {' '}
            · {r.rawValue} {r.rawUnit}
          </span>
        )}
      </div>
    </div>
  );
}

function SupplyCard({ kind, label, icon, units }: (typeof KINDS)[number]) {
  const { data, update } = useStore();
  const history = data.readings.filter((r) => r.kind === kind).sort((a, b) => b.at.localeCompare(a.at));
  const latest = history[0];
  const [percent, setPercent] = useState(latest?.percent ?? 50);
  const [raw, setRaw] = useState('');
  const [unit, setUnit] = useState(units[1] ?? '');

  function submit(e: FormEvent) {
    e.preventDefault();
    const r: Reading = {
      id: uid(),
      kind,
      percent,
      rawValue: raw === '' ? null : Number(raw),
      rawUnit: raw === '' ? '' : unit,
      at: new Date().toISOString(),
      demo: false,
    };
    update((d) => ({ ...d, readings: [...d.readings, r] }));
    setRaw('');
  }

  return (
    <section className="card supply">
      <h2>
        <span aria-hidden>{icon}</span> {label}
      </h2>
      {latest ? (
        <>
          <Gauge r={latest} />
          <p className="reading-date">
            Odczyt wpisany: <strong>{formatDateTime(latest.at)}</strong> {latest.demo && <DemoBadge>PRZYKŁADOWY ODCZYT</DemoBadge>}
          </p>
        </>
      ) : (
        <p className="muted-text">Brak odczytów.</p>
      )}

      <form className="form compact" onSubmit={submit}>
        <label>
          Nowy poziom: <strong>{percent}%</strong> ({band(percent).label})
          <input type="range" min={0} max={100} step={5} value={percent} onChange={(e) => setPercent(Number(e.target.value))} />
        </label>
        <div className="form-row">
          <label>
            Wartość (opcjonalnie)
            <input type="number" step="0.1" value={raw} onChange={(e) => setRaw(e.target.value)} />
          </label>
          <label>
            Jednostka
            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
              {units.filter(Boolean).map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </label>
        </div>
        <button className="btn btn-primary" type="submit">
          Zapisz odczyt
        </button>
      </form>

      <details>
        <summary>Historia odczytów ({history.length})</summary>
        <ul className="history">
          {history.map((r) => (
            <li key={r.id}>
              <span>{formatDateTime(r.at)}</span>
              <span>
                {r.percent}% {band(r.percent).symbol} {band(r.percent).label}
                {r.rawValue !== null && ` · ${r.rawValue} ${r.rawUnit}`}
              </span>
              {r.demo && <DemoBadge>PRZYKŁAD</DemoBadge>}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

export default function SuppliesPage() {
  return (
    <div className="page">
      <h1>Stan zapasów</h1>
      <Notice kind="warn">
        Odczyty wpisywane <strong>ręcznie</strong> — aplikacja nie odczytuje czujników. Jednostki i sposób wpisywania
        poziomu są robocze (do ustalenia); w prototypie podstawą jest procent, a wartość fizyczna jest opcjonalna.
      </Notice>
      <div className="supply-grid">
        {KINDS.map((k) => (
          <SupplyCard key={k.kind} {...k} />
        ))}
      </div>
      <p className="form-hint">Progi: do 25% — ▁ Niski (pasek kreskowany), do 60% — ▄ Średni, powyżej — █ Wysoki.</p>
    </div>
  );
}
