import { Link, useParams } from 'react-router-dom';
import { Notice, TodoBadge } from '../components/Badges';
import { INSTRUCTIONS, PLAN } from '../data/camper';

/** Miejsce na zdjęcie panelu z ponumerowanymi i podpisanymi elementami sterującymi. */
function PanelPhotoPlaceholder() {
  const markers = [
    { n: 1, x: 90, y: 110 },
    { n: 2, x: 200, y: 110 },
    { n: 3, x: 310, y: 150 },
  ];
  return (
    <figure className="panel-photo">
      <svg viewBox="0 0 400 240" role="img" aria-label="Miejsce na zdjęcie panelu — zdjęcie nie zostało jeszcze dodane">
        <rect x="1" y="1" width="398" height="238" rx="10" className="panel-bg" />
        <text x="200" y="40" textAnchor="middle" className="panel-title">
          MIEJSCE NA ZDJĘCIE PANELU
        </text>
        <text x="200" y="215" textAnchor="middle" className="panel-sub">
          zdjęcie do dodania przez właściciela
        </text>
        <rect x="60" y="80" width="280" height="110" rx="6" className="panel-device" />
        {markers.map((m) => (
          <g key={m.n}>
            <circle cx={m.x} cy={m.y} r="16" className="panel-marker" />
            <text x={m.x} y={m.y + 5} textAnchor="middle" className="panel-marker-num">
              {m.n}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        <ol className="panel-legend">
          {markers.map((m) => (
            <li key={m.n}>
              <strong>{m.n}</strong> — element sterujący: <em>nazwa i funkcja do uzupełnienia</em>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}

export default function InstructionsPage() {
  const { id } = useParams();
  const selected = INSTRUCTIONS.find((i) => i.id === id);

  return (
    <div className="page">
      <h1>Instrukcje obsługi</h1>
      <Notice kind="warn">
        <strong>Żadna procedura nie jest jeszcze sprawdzona.</strong> Prototyp pokazuje tylko strukturę instrukcji.
        Modele urządzeń, zdjęcia paneli i kroki zostaną uzupełnione na podstawie dokumentacji urządzeń i informacji
        właściciela. Nie wykonuj czynności na podstawie tego ekranu.
      </Notice>

      <div className="instr-layout">
        <nav className="card instr-nav" aria-label="Lista instrukcji">
          <ul>
            {INSTRUCTIONS.map((i) => (
              <li key={i.id}>
                <Link to={`/instrukcje/${i.id}`} className={i.id === id ? 'active' : ''}>
                  <span aria-hidden>{i.icon}</span> {i.title}
                  <span className="instr-status">✎ do uzupełnienia</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {selected ? (
          <article className="card instr-detail">
            <h2>
              <span aria-hidden>{selected.icon}</span> {selected.title}
            </h2>
            <TodoBadge>PROCEDURA DO UZUPEŁNIENIA — NIESPRAWDZONA</TodoBadge>

            <dl className="details">
              <dt>Urządzenie / model</dt>
              <dd>
                <TodoBadge />
              </dd>
              <dt>Miejsce w kamperze</dt>
              <dd>
                {selected.elementIds.length ? (
                  selected.elementIds.map((eid) => {
                    const el = PLAN.find((p) => p.id === eid);
                    return el ? (
                      <span key={eid} className="chip">
                        <Link to="/kamper">{el.label}</Link>
                      </span>
                    ) : null;
                  })
                ) : (
                  <TodoBadge>POŁOŻENIE NIEZNANE</TodoBadge>
                )}
              </dd>
              <dt>Źródło procedury</dt>
              <dd>
                <TodoBadge>BRAK — dokumentacja do zebrania</TodoBadge>
              </dd>
            </dl>

            <h3>Panel sterowania</h3>
            <PanelPhotoPlaceholder />

            <h3>Kroki</h3>
            <ol className="steps">
              {[1, 2, 3].map((n) => (
                <li key={n} className="step-todo">
                  <span className="step-num">Krok {n}</span>
                  <span>
                    <em>Treść kroku do uzupełnienia.</em> Krok będzie wskazywał numer elementu ze zdjęcia panelu (np.
                    „naciśnij element nr {n}”).
                  </span>
                </li>
              ))}
            </ol>

            <h3>Uwagi bezpieczeństwa</h3>
            <p>
              <TodoBadge />
            </p>
          </article>
        ) : (
          <div className="card">
            <p>Wybierz instrukcję z listy. Instrukcje są też dostępne z poziomu elementów na rzucie kampera.</p>
          </div>
        )}
      </div>
    </div>
  );
}
