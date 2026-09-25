import { getTool } from '@omnikit/core';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ToolCard } from '../components/ToolCard';
import { useAppState } from '../state/AppState';

export function FavoritesPage() {
  const { favorites } = useAppState();
  const list = favorites.map(getTool).filter((t) => t !== undefined);
  return (
    <div>
      <nav className="breadcrumb">
        <Link to="/">Index</Link> / <span className="current">Starred</span>
      </nav>
      <header className="page-header">
        <div className="page-icon">
          <Star size={26} strokeWidth={1.6} />
        </div>
        <div className="page-header-text">
          <h1>Starred</h1>
          <p>The tools you reach for most, one click away.</p>
        </div>
      </header>
      {list.length === 0 ? (
        <div className="empty">
          <p>Nothing starred yet. Use the star on any tool to keep it here.</p>
          <Link to="/" className="btn btn-outline">Browse all tools</Link>
        </div>
      ) : (
        <div className="catalog">{list.map((t) => <ToolCard key={t.id} tool={t} />)}</div>
      )}
    </div>
  );
}
