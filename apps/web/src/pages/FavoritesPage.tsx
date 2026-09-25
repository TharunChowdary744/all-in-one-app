import { getTool } from '@omnikit/core';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Breadcrumb } from '../components/Breadcrumb';
import { ToolCard } from '../components/ToolCard';
import { useAppState } from '../state/AppState';

export function FavoritesPage() {
  const { favorites } = useAppState();
  const list = favorites.map(getTool).filter((t) => t !== undefined);
  return (
    <div>
      <Breadcrumb items={[{ label: 'All tools', to: '/' }, { label: 'Starred' }]} />
      <header className="page-header">
        <div className="page-icon">
          <Star size={24} strokeWidth={1.75} />
        </div>
        <div className="page-header-text">
          <h1>Starred</h1>
          <p>Keep the tools you use most one click away.</p>
        </div>
      </header>
      {list.length === 0 ? (
        <div className="empty-inline">
          <strong>You haven’t starred any tools yet.</strong>
          <span>Select the star on any tool to pin it here and to the top of All tools.</span>
          <Link to="/" className="btn btn-outline btn-sm">
            Browse all tools
          </Link>
        </div>
      ) : (
        <div className="catalog">{list.map((t) => <ToolCard key={t.id} tool={t} />)}</div>
      )}
    </div>
  );
}
