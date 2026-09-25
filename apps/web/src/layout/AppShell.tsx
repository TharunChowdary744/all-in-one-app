import { APP_NAME, categories, getToolsByCategory } from '@omnikit/core';
import { LayoutGrid, Menu, Monitor, Moon, Search, Star, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

import { CommandPalette } from '../components/CommandPalette';
import { LogoMark } from '../components/Logo';
import { useAppState, type ThemePreference } from '../state/AppState';

const themeCycle: Record<ThemePreference, ThemePreference> = { system: 'light', light: 'dark', dark: 'system' };
const ThemeIcon = { system: Monitor, light: Sun, dark: Moon };
/** Set at build time by the deploy workflow; non-prod builds show a badge so environments aren't confused. */
const APP_ENV = import.meta.env.VITE_APP_ENV as string | undefined;

export function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { theme, setTheme, favorites } = useAppState();
  const location = useLocation();
  const Theme = ThemeIcon[theme];

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
        <Link to="/" className="brand">
          <LogoMark />
          <span className="brand-name">{APP_NAME}</span>
        </Link>
        <nav>
          <div className="nav-group">
            <NavLink to="/" end className="nav-link">
              <LayoutGrid size={16} strokeWidth={1.6} /> All tools
            </NavLink>
            <NavLink to="/favorites" className="nav-link">
              <Star size={16} strokeWidth={1.6} /> Starred
              <span className="nav-count">{favorites.length || ''}</span>
            </NavLink>
          </div>
          <div className="nav-group">
            <span className="label">Sections</span>
            {categories.map((c) => (
              <NavLink key={c.id} to={`/category/${c.id}`} className="nav-link">
                <span className="nav-code">{c.code}</span> {c.name}
                <span className="nav-count">{String(getToolsByCategory(c.id).length).padStart(2, '0')}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="sidebar-footer">
          <strong>Runs on your device.</strong>
          Files are processed in the browser and never uploaded.
        </div>
      </aside>
      {navOpen && <div className="sidebar-backdrop" onClick={() => setNavOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button type="button" className="icon-btn plain menu-btn" aria-label="Open menu" onClick={() => setNavOpen(true)}>
            <Menu size={18} />
          </button>
          <Link to="/" className="mobile-brand brand" style={{ padding: 0 }}>
            <LogoMark size={24} />
            <span className="brand-name" style={{ fontSize: 18 }}>{APP_NAME}</span>
          </Link>
          <button type="button" className="search-trigger" onClick={() => setPaletteOpen(true)} aria-label="Search tools">
            <Search size={16} />
            <span className="search-placeholder">Find a tool…</span>
            <kbd>⌘K</kbd>
          </button>
          <span className="topbar-spacer" />
          {APP_ENV && APP_ENV !== 'prod' && (
            <span className="env-badge" title={`This is the ${APP_ENV} environment`}>
              {APP_ENV}
            </span>
          )}
          <button type="button" className="icon-btn plain" aria-label={`Theme: ${theme}. Click to change.`} title={`Theme: ${theme}`} onClick={() => setTheme(themeCycle[theme])}>
            <Theme size={17} strokeWidth={1.6} />
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
