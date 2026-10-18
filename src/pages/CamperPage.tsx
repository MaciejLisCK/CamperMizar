import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmedBadge, Notice, UnconfirmedBadge } from '../components/Badges';
import { INSTRUCTIONS, PLAN, UNPLACED_DEVICES, VEHICLE, type Layer, type PlanElement } from '../data/camper';

const Camper3D = lazy(() => import('../components/Camper3D'));

function ElementShape({ el, selected, onSelect, faded }: { el: PlanElement; selected: boolean; onSelect: () => void; faded?: boolean }) {
  const small = el.w < 30 || el.h < 30;
  return (
    <g
      className={`plan-el kind-${el.kind}${el.confirmed ? '' : ' unconfirmed'}${selected ? ' selected' : ''}${faded ? ' faded' : ''}`}
      role={faded ? undefined : 'button'}
      tabIndex={faded ? -1 : 0}
      aria-label={`${el.label}${el.confirmed ? '' : ' (niepotwierdzone)'}`}
      aria-pressed={faded ? undefined : selected}
      onClick={faded ? undefined : onSelect}
      onKeyDown={(e) => {
        if (!faded && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={4} />
      {!el.confirmed && <rect x={el.x} y={el.y} width={el.w} height={el.h} rx={4} className="hatch" />}
      {!small && (
        <foreignObject x={el.x + 2} y={el.y + 2} width={el.w - 4} height={el.h - 4}>
          <div className="plan-label">
            {el.label}
            {!el.confirmed && <span className="plan-q"> (?)</span>}
          </div>
        </foreignObject>
      )}
      {small && !el.confirmed && (
        <text x={el.x + el.w / 2} y={el.y + el.h / 2 + 4} textAnchor="middle" className="plan-q-small">
          ?
        </text>
      )}
    </g>
  );
}

export default function CamperPage() {
  const [view, setView] = useState<'3d' | '2d'>('3d');
  const [layer, setLayer] = useState<Layer>('dol');
  const [selectedId, setSelectedId] = useState<string>('dinette-front');
  const selected = PLAN.find((p) => p.id === selectedId);
  const current = PLAN.filter((p) => p.layer === layer);
  const other = PLAN.filter((p) => p.layer !== layer && p.kind !== 'door' && p.kind !== 'window' && p.kind !== 'exterior');

  return (
    <div className="page">
      <h1>
        Kamper: {VEHICLE.name} ({VEHICLE.year}, {VEHICLE.base})
      </h1>
      <div className="seg-control" role="group" aria-label="Forma wizualizacji">
        <button className={view === '3d' ? 'active' : ''} aria-pressed={view === '3d'} onClick={() => setView('3d')}>
          Model 3D
        </button>
        <button className={view === '2d' ? 'active' : ''} aria-pressed={view === '2d'} onClick={() => setView('2d')}>
          Rzut z góry 2D
        </button>
      </div>

      {view === '3d' ? (
        <Notice kind="warn">
          Model 3D: <strong>układ wnętrza wg opisu właściciela</strong>, wygląd zewnętrzny (kolory, okna, oklejenie)
          wzorowany na zdjęciach egzemplarza z ogłoszenia — może różnić się od pojazdu właściciela. Wymiary i proporcje są
          poglądowe. Elementy niepotwierdzone mają znacznik <strong>?</strong>. Film referencyjny nie został jeszcze
          przeanalizowany.
        </Notice>
      ) : (
        <Notice kind="warn">
          Rzut z góry przygotowany na podstawie <strong>opisu właściciela</strong>. Proporcje są poglądowe (wymiary
          nieznane). Elementy z ukośnym kreskowaniem i znakiem <strong>(?)</strong> są niepotwierdzone. Film
          referencyjny nie został jeszcze przeanalizowany.
        </Notice>
      )}

      <div className={`camper-layout${view === '3d' ? ' wide' : ''}`}>
        {view === '3d' ? (
          <div className="card">
            <Suspense fallback={<p className="muted-text">Ładowanie modelu 3D…</p>}>
              <Camper3D selectedId={selectedId} onSelect={setSelectedId} />
            </Suspense>
          </div>
        ) : (
        <div className="card camper-plan">
          <div className="seg-control" role="group" aria-label="Poziom rzutu">
            <button className={layer === 'dol' ? 'active' : ''} onClick={() => setLayer('dol')} aria-pressed={layer === 'dol'}>
              Poziom podłogi
            </button>
            <button className={layer === 'gora' ? 'active' : ''} onClick={() => setLayer('gora')} aria-pressed={layer === 'gora'}>
              Alkowa, szafki górne, dach
            </button>
          </div>
          <svg viewBox="-20 -20 340 830" className="plan-svg" role="img" aria-label="Rzut kampera z góry, przód u góry">
            <defs>
              <pattern id="hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="8" className="hatch-line" />
              </pattern>
            </defs>
            <text x="150" y="-6" textAnchor="middle" className="plan-dir">
              ▲ KIERUNEK JAZDY (przód)
            </text>
            <text x="-12" y="420" className="plan-side" transform="rotate(-90 -12 420)" textAnchor="middle">
              LEWA STRONA
            </text>
            <text x="312" y="420" className="plan-side" transform="rotate(90 312 420)" textAnchor="middle">
              PRAWA STRONA
            </text>
            {/* koła */}
            {[110, 620].map((y) => (
              <g key={y} className="plan-wheel">
                <rect x={8} y={y} width={12} height={55} rx={3} />
                <rect x={280} y={y} width={12} height={55} rx={3} />
              </g>
            ))}
            {/* nadwozie */}
            <path d="M20 80 Q22 44 60 40 L240 40 Q278 44 280 80 L280 760 L20 760 Z" className="plan-body" />
            <line x1="20" y1="190" x2="280" y2="190" className="plan-cab-line" />
            <text x="150" y="70" textAnchor="middle" className="plan-zone">
              KABINA
            </text>
            {layer === 'gora' && <path d="M30 20 L270 20 L270 180 L30 180 Z" className="plan-overhang" />}
            {other.map((el) => (
              <ElementShape key={el.id} el={el} selected={false} onSelect={() => {}} faded />
            ))}
            {current.map((el) => (
              <ElementShape key={el.id} el={el} selected={el.id === selectedId} onSelect={() => setSelectedId(el.id)} />
            ))}
            <text x="150" y="800" textAnchor="middle" className="plan-zone">
              TYŁ
            </text>
          </svg>
          <p className="form-hint">
            Kliknij element (lub wybierz go klawiszem Tab i Enter). Strony liczone patrząc w kierunku jazdy.
          </p>
        </div>
        )}

        <aside className="card camper-info" aria-live="polite">
          {selected ? (
            <>
              <h2>{selected.label}</h2>
              {selected.confirmed ? <ConfirmedBadge /> : <UnconfirmedBadge />}
              <p>{selected.description}</p>
              {selected.unconfirmedNote && (
                <p className="unconfirmed-note">
                  <span aria-hidden>?</span> <strong>Niepotwierdzone:</strong> {selected.unconfirmedNote}
                </p>
              )}
              <h3>Powiązane instrukcje</h3>
              {selected.instructions?.length ? (
                <ul className="link-list">
                  {selected.instructions.map((id) => {
                    const ins = INSTRUCTIONS.find((i) => i.id === id)!;
                    return (
                      <li key={id}>
                        <Link to={`/instrukcje/${id}`}>
                          <span aria-hidden>{ins.icon}</span> {ins.title} →
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="muted-text">Brak powiązanych instrukcji.</p>
              )}
            </>
          ) : (
            <p>Wybierz element na rzucie.</p>
          )}

          <h3>Urządzenia o nieustalonym położeniu</h3>
          <ul className="link-list">
            {UNPLACED_DEVICES.map((d) => (
              <li key={d.label}>
                <UnconfirmedBadge>POŁOŻENIE NIEZNANE</UnconfirmedBadge> {d.label} —{' '}
                <Link to={`/instrukcje/${d.instruction}`}>instrukcja →</Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <section className="card">
        <h2>Wszystkie elementy</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Element</th>
                <th>Poziom</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {PLAN.map((el) => (
                <tr key={el.id}>
                  <td>
                    <button
                      className="link-btn"
                      onClick={() => {
                        setLayer(el.layer);
                        setSelectedId(el.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {el.label}
                    </button>
                  </td>
                  <td>{el.layer === 'dol' ? 'podłoga' : 'góra / dach'}</td>
                  <td>{el.confirmed ? <ConfirmedBadge>POTWIERDZONE</ConfirmedBadge> : <UnconfirmedBadge />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Materiały odniesienia</h2>
        <ul className="link-list">
          <li>
            <a href="https://www.caravanmarket.com/CI-MIZAR-140-1996" target="_blank" rel="noreferrer">
              caravanmarket.com — CI Mizar 140, 1996 ↗
            </a>{' '}
            (główna referencja fotograficzna)
          </li>
          <li>
            <a href="https://www.vantastik.it/en/van/camper-mizar-140" target="_blank" rel="noreferrer">
              vantastik.it — materiał dodatkowy ↗
            </a>{' '}
            (nie potwierdza konfiguracji pojazdu właściciela)
          </li>
          <li>
            <a href="https://www.youtube.com/watch?v=Yj8snF-nUFw" target="_blank" rel="noreferrer">
              Film YouTube ↗
            </a>{' '}
            — <strong>analiza filmu do wykonania</strong>
          </li>
        </ul>
        <p className="form-hint">
          Parametry i wyposażenie egzemplarzy z ogłoszeń nie są automatycznie danymi kampera właściciela.
        </p>
      </section>
    </div>
  );
}
