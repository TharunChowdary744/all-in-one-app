import { APP_TAGLINE, categories, getFeaturedTools, getTool, getToolsByCategory, searchTools, tools, type CategoryId } from '@omnikit/core';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ToolCard } from '../components/ToolCard';
import { Stat } from '../components/ui';
import { useAppState } from '../state/AppState';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Dashboard() {
  const { favorites, recents, usage, filesProcessed, clearHistory } = useAppState();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CategoryId | 'all'>('all');

  const favoriteTools = favorites.map(getTool).filter((t) => t !== undefined);
  const recentTools = recents.map((r) => getTool(r.id)).filter((t) => t !== undefined);
  const totalUses = Object.values(usage).reduce((a, b) => a + b, 0);
  const results = useMemo(
    () => searchTools(query, filter === 'all' ? tools : getToolsByCategory(filter)),
    [query, filter],
  );
  const searching = query.trim() !== '' || filter !== 'all';

  return (
    <div className="dashboard">
      <section className="hero">
        <div>
          <h1>{greeting()} 👋</h1>
          <p>{APP_TAGLINE} Convert images, documents and PDFs, format code, generate passwords and more — privately, right in your browser.</p>
        </div>
        <div className="hero-search">
          <span aria-hidden>🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${tools.length} tools…`}
            aria-label="Search tools"
          />
        </div>
      </section>

      <section className="stats">
        <Stat label="Tools available" value={tools.length} />
        <Stat label="Categories" value={categories.length} />
        <Stat label="Favorites" value={favorites.length} />
        <Stat label="Tool launches" value={totalUses} />
        <Stat label="Files processed" value={filesProcessed} />
      </section>

      <div className="chips-row" role="tablist" aria-label="Filter by category">
        <button type="button" role="tab" aria-selected={filter === 'all'} className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={filter === c.id}
            className={`filter-chip ${filter === c.id ? 'active' : ''}`}
            onClick={() => setFilter(c.id)}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {searching ? (
        <section>
          <h2 className="section-title">
            {results.length} result{results.length === 1 ? '' : 's'}
          </h2>
          {results.length === 0 ? (
            <div className="empty">No tools match your search.</div>
          ) : (
            <div className="grid">{results.map((t) => <ToolCard key={t.id} tool={t} />)}</div>
          )}
        </section>
      ) : (
        <>
          {recentTools.length > 0 && (
            <section>
              <div className="section-head">
                <h2 className="section-title">🕘 Recently used</h2>
                <button type="button" className="btn btn-ghost btn-sm" onClick={clearHistory}>
                  Clear history
                </button>
              </div>
              <div className="grid grid-compact">{recentTools.map((t) => <ToolCard key={t.id} tool={t} compact />)}</div>
            </section>
          )}

          {favoriteTools.length > 0 && (
            <section>
              <div className="section-head">
                <h2 className="section-title">⭐ Favorites</h2>
                <Link to="/favorites" className="link">View all</Link>
              </div>
              <div className="grid">{favoriteTools.slice(0, 6).map((t) => <ToolCard key={t.id} tool={t} />)}</div>
            </section>
          )}

          <section>
            <h2 className="section-title">✨ Popular tools</h2>
            <div className="grid">{getFeaturedTools().map((t) => <ToolCard key={t.id} tool={t} />)}</div>
          </section>

          <section>
            <h2 className="section-title">🗂️ Browse by category</h2>
            <div className="category-grid">
              {categories.map((c) => {
                const list = getToolsByCategory(c.id);
                return (
                  <Link key={c.id} to={`/category/${c.id}`} className="category-card" style={{ '--accent': c.color } as React.CSSProperties}>
                    <div className="category-icon">{c.icon}</div>
                    <div>
                      <div className="category-name">{c.name}</div>
                      <div className="category-desc">{c.description}</div>
                      <div className="category-tools">{list.map((t) => t.icon).join(' ')}</div>
                    </div>
                    <span className="category-count">{list.length}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
