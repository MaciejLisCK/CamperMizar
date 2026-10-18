import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../data/auth';
import { useStore } from '../data/store';

const PUBLIC_LINKS = [{ to: '/', label: 'Dziennik podróży', icon: '📖' }];

const PRIVATE_LINKS = [
  { to: '/dzisiaj', label: 'Dzisiaj', icon: '☀' },
  { to: '/kalendarz', label: 'Kalendarz', icon: '📅' },
  { to: '/trasa', label: 'Trasa', icon: '🗺' },
  { to: '/zasieg', label: 'Zasięg', icon: '📶' },
  { to: '/kamper', label: 'Kamper', icon: '🚐' },
  { to: '/instrukcje', label: 'Instrukcje', icon: '🔧' },
  { to: '/zapasy', label: 'Zapasy', icon: '⛽' },
  { to: '/miejsca', label: 'Miejsca', icon: '📍' },
  { to: '/dziennik/nowy', label: 'Nowy wpis', icon: '✎' },
];

export default function Layout() {
  const { unlocked, lock } = useAuth();
  const { reset, saveError } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const links = (
    <>
      <div className="nav-group-label">Publiczne</div>
      {PUBLIC_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to} end onClick={() => setMenuOpen(false)}>
          <span aria-hidden>{l.icon}</span> {l.label}
        </NavLink>
      ))}
      <div className="nav-group-label">
        Prywatne {unlocked ? <span aria-label="odblokowane">🔓</span> : <span aria-label="zablokowane">🔒</span>}
      </div>
      {PRIVATE_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to} onClick={() => setMenuOpen(false)}>
          <span aria-hidden>{l.icon}</span> {l.label}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="app">
      <header className="topbar">
        <button className="menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-label="Menu">
          ☰
        </button>
        <div className="brand">
          <span aria-hidden>🚐</span> CI Mizar 140 <span className="brand-sub">prototyp</span>
        </div>
        <div className="topbar-actions">
          {unlocked && (
            <button className="btn btn-ghost" onClick={lock}>
              Wyloguj
            </button>
          )}
        </div>
      </header>
      <div className="proto-banner" role="note">
        ◇ PROTOTYP — wszystkie dane są przykładowe, a wyniki usług zewnętrznych (trasy, zasięg) są symulowane. Zmiany
        zapisują się tylko w tej przeglądarce.{' '}
        <button
          className="link-btn"
          onClick={() => {
            if (confirm('Przywrócić dane przykładowe? Twoje zmiany w prototypie zostaną usunięte.')) reset();
          }}
        >
          Przywróć dane przykładowe
        </button>
      </div>
      {saveError && <div className="error-banner">⚠ {saveError}</div>}
      <div className="body">
        <nav className={`sidebar${menuOpen ? ' open' : ''}`} aria-label="Nawigacja">
          {links}
        </nav>
        <main className="content" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
