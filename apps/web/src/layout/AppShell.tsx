import { APP_NAME, categories, getToolsByCategory } from '@omnikit/core';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { CommandPalette } from '../components/CommandPalette';
import { useAppState, type ThemePreference } from '../state/AppState';

const themeCycle: Record<ThemePreference, ThemePreference> = { system: 'light', light: 'dark', dark: 'system' };
const themeIcon: Record<ThemePreference, string> = { system: '🖥️', light: '☀️', dark: '🌙' };

export function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { theme, setTheme, favorites } = useAppState();
  const location = useLocation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setNavOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="shell">
      <aside className={`sidebar ${navOpen ? 'open' : ''}`}>
        <NavLink to="/" className="brand">
          <img src="/logo.svg" alt="" width={32} height={32} />
          <span>{APP_NAME}</span>
        </NavLink>
        <nav>
          <NavLink to="/" end className="nav-link">
            <span className="nav-icon">🏠</span> Dashboard
          </NavLink>
          <NavLink to="/favorites" className="nav-link">
            <span className="nav-icon">⭐</span> Favorites
            {favorites.length > 0 && <span className="nav-count">{favorites.length}</span>}
          </NavLink>
          <div className="nav-section">Categories</div>
          {categories.map((c) => (
            <NavLink key={c.id} to={`/category/${c.id}`} className="nav-link">
              <span className="nav-icon">{c.icon}</span> {c.name}
              <span className="nav-count">{getToolsByCategory(c.id).length}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          🔒 Files never leave your device — everything runs locally in your browser.
        </div>
      </aside>
      {navOpen && <div className="sidebar-backdrop" onClick={() => setNavOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button type="button" className="icon-btn menu-btn" aria-label="Open menu" onClick={() => setNavOpen(true)}>
            ☰
          </button>
          <button type="button" className="search-trigger" onClick={() => setPaletteOpen(true)}>
            <span aria-hidden>🔍</span>
            <span className="search-placeholder">Search tools…</span>
            <kbd>⌘K</kbd>
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={`Theme: ${theme}. Click to change.`}
            title={`Theme: ${theme}`}
            onClick={() => setTheme(themeCycle[theme])}
          >
            {themeIcon[theme]}
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
