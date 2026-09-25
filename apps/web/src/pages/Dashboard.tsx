import { categories, getTool, getToolsByCategory, searchTools, tools, type CategoryId } from '@omnikit/core';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ToolCard, ToolPill } from '../components/ToolCard';
import { useAppState } from '../state/AppState';

export function Dashboard() {
  const { favorites, recents, usage, filesProcessed, clearHistory } = useAppState();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CategoryId | 'all'>('all');

  const favoriteTools = favorites.map(getTool).filter((t) => t !== undefined);
  const recentTools = recents.map((r) => getTool(r.id)).filter((t) => t !== undefined);
  const launches = Object.values(usage).reduce((a, b) => a + b, 0);
  const results = useMemo(() => searchTools(query, filter === 'all' ? tools : getToolsByCategory(filter)), [query, filter]);
  const filtering = query.trim() !== '' || filter !== 'all';

  return (
    <div>
      <header className="masthead">
        <div>
          <span className="label">Index · {tools.length} tools in {categories.length} sections</span>
          <h1>
            Everyday tools.
            <br />
            <em>No uploads.</em>
          </h1>
          <p>Convert images and documents, work with PDFs, format data and generate secrets. Every tool runs locally in your browser.</p>
        </div>
        <div className="ledger" aria-label="Your activity">
          <div className="ledger-item">
            <div className="ledger-value">{String(tools.length).padStart(2, '0')}</div>
            <span className="label">Tools</span>
          </div>
          <div className="ledger-item">
            <div className="ledger-value">{String(favorites.length).padStart(2, '0')}</div>
            <span className="label">Starred</span>
          </div>
          <div className="ledger-item">
            <div className="ledger-value">{String(launches).padStart(2, '0')}</div>
            <span className="label">Launches</span>
          </div>
          <div className="ledger-item">
            <div className="ledger-value">{String(filesProcessed).padStart(2, '0')}</div>
            <span className="label">Files processed</span>
          </div>
        </div>
      </header>

      <div className="finder">
        <div className="finder-input">
          <Search size={17} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or format — “webp”, “pdf to word”, “sha256”" aria-label="Search tools" />
        </div>
        <div className="tabs" role="tablist" aria-label="Filter by section">
          <button type="button" role="tab" aria-selected={filter === 'all'} className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All
          </button>
          {categories.map((c) => (
            <button key={c.id} type="button" role="tab" aria-selected={filter === c.id} className={`tab ${filter === c.id ? 'active' : ''}`} onClick={() => setFilter(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {!filtering && (recentTools.length > 0 || favoriteTools.length > 0) && (
        <div className="shelf">
          {recentTools.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div className="shelf-head">
                <span className="label">Recently used</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={clearHistory}>
                  Clear
                </button>
              </div>
              <div className="shelf-links">{recentTools.map((t) => <ToolPill key={t.id} tool={t} />)}</div>
            </div>
          )}
          {favoriteTools.length > 0 && (
            <div>
              <div className="shelf-head">
                <span className="label">Starred</span>
              </div>
              <div className="shelf-links">{favoriteTools.map((t) => <ToolPill key={t.id} tool={t} />)}</div>
            </div>
          )}
        </div>
      )}

      {filtering ? (
        <section className="section">
          <div className="section-head">
            <span className="section-index">{String(results.length).padStart(2, '0')}</span>
            <h2>{results.length === 1 ? 'Match' : 'Matches'}</h2>
          </div>
          {results.length === 0 ? <div className="empty">Nothing matches that search. Try a file format like “png” or “docx”.</div> : <div className="catalog">{results.map((t) => <ToolCard key={t.id} tool={t} />)}</div>}
        </section>
      ) : (
        categories.map((c, i) => {
          const list = getToolsByCategory(c.id);
          return (
            <section key={c.id} className="section" id={c.id}>
              <div className="section-head">
                <span className="section-index">{String(i + 1).padStart(2, '0')}</span>
                <h2>{c.name}</h2>
                <p>
                  {c.description} <span className="mono">· {list.length}</span>
                </p>
              </div>
              <div className="catalog">{list.map((t) => <ToolCard key={t.id} tool={t} />)}</div>
            </section>
          );
        })
      )}
    </div>
  );
}
