import { getTool } from '@omnikit/core';
import { Link } from 'react-router-dom';

import { ToolCard } from '../components/ToolCard';
import { useAppState } from '../state/AppState';

export function FavoritesPage() {
  const { favorites } = useAppState();
  const list = favorites.map(getTool).filter((t) => t !== undefined);
  return (
    <div>
      <header className="page-header">
        <div className="page-icon">⭐</div>
        <div>
          <h1>Favorites</h1>
          <p>Tools you've starred for quick access.</p>
        </div>
      </header>
      {list.length === 0 ? (
        <div className="empty">
          No favorites yet. Tap the ☆ on any tool card to pin it here. <Link to="/" className="link">Browse tools</Link>
        </div>
      ) : (
        <div className="grid">{list.map((t) => <ToolCard key={t.id} tool={t} />)}</div>
      )}
    </div>
  );
}
