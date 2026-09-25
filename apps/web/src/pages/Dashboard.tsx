import { categories, getCategory, getTool, getToolsByCategory, searchTools, tools, type CategoryId } from '@omnikit/core';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { RegistryIcon } from '../components/Icon';
import { ToolCard, ToolPill } from '../components/ToolCard';
import { useAppState } from '../state/AppState';

export function Dashboard() {
  const { favorites, recents, clearHistory } = useAppState();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CategoryId | 'all'>('all');

  const favoriteTools = favorites.map(getTool).filter((t) => t !== undefined);
  const recentTools = recents.map((r) => getTool(r.id)).filter((t) => t !== undefined);
  const results = useMemo(() => searchTools(query, filter === 'all' ? tools : getToolsByCategory(filter)), [query, filter]);
  const searching = query.trim() !== '';
  const visibleCategories = filter === 'all' ? categories : [getCategory(filter)];

  return (
    <div>
      <section className="intro" aria-labelledby="intro-title">
        <h1 id="intro-title">All tools</h1>
        <p>
          {tools.length} tools for files, text, code, money and everyday maths. Everything runs in your browser, and your files are never uploaded.
        </p>
        <div className="finder-input">
          <Search size={18} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by tool or file format, e.g. “webp” or “pdf to word”"
            aria-label="Search tools"
          />
        </div>
        <div className="tabs" role="group" aria-label="Filter by category">
          <button type="button" aria-pressed={filter === 'all'} className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All
          </button>
          {categories.map((c) => (
            <button key={c.id} type="button" data-cat={c.id} aria-pressed={filter === c.id} className={`tab ${filter === c.id ? 'active' : ''}`} onClick={() => setFilter(c.id)}>
              <RegistryIcon name={c.icon} size={15} strokeWidth={1.75} />
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {!searching && filter === 'all' && (recentTools.length > 0 || favoriteTools.length > 0) && (
        <div className="shelf">
          {recentTools.length > 0 && (
            <section aria-labelledby="recent-title">
              <div className="shelf-head">
                <h2 id="recent-title">Recently used</h2>
                <button type="button" className="btn btn-ghost btn-sm" onClick={clearHistory}>
                  Clear history
                </button>
              </div>
              <div className="shelf-links">{recentTools.map((t) => <ToolPill key={t.id} tool={t} />)}</div>
            </section>
          )}
          {favoriteTools.length > 0 && (
            <section aria-labelledby="starred-title">
              <div className="shelf-head">
                <h2 id="starred-title">Starred</h2>
              </div>
              <div className="shelf-links">{favoriteTools.map((t) => <ToolPill key={t.id} tool={t} />)}</div>
            </section>
          )}
        </div>
      )}

      {searching ? (
        <section className="section" aria-live="polite">
          <div className="section-head">
            <h2>
              {results.length} {results.length === 1 ? 'result' : 'results'} for “{query.trim()}”
            </h2>
          </div>
          {results.length === 0 ? (
            <div className="empty-inline">
              <strong>No tools match that search.</strong>
              <span>Try a file format such as “png”, “docx” or “csv”, or browse every category.</span>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setQuery(''); setFilter('all'); }}>
                Clear search
              </button>
            </div>
          ) : (
            <div className="catalog">{results.map((t) => <ToolCard key={t.id} tool={t} />)}</div>
          )}
        </section>
      ) : (
        visibleCategories.map((c) => {
          const list = getToolsByCategory(c.id);
          return (
            <section key={c.id} className="section" id={c.id} aria-labelledby={`${c.id}-title`}>
              <div className="section-head">
                <h2 id={`${c.id}-title`}>{c.name}</h2>
                <p>{c.description}</p>
                <span className="count">{list.length} tools</span>
              </div>
              <div className="catalog">{list.map((t) => <ToolCard key={t.id} tool={t} />)}</div>
            </section>
          );
        })
      )}
    </div>
  );
}
