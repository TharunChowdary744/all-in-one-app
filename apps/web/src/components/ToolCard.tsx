import { getCategory, type ToolDefinition } from '@omnikit/core';
import { Link } from 'react-router-dom';

import { useAppState } from '../state/AppState';

export function ToolCard({ tool, compact = false }: { tool: ToolDefinition; compact?: boolean }) {
  const { isFavorite, toggleFavorite } = useAppState();
  const category = getCategory(tool.category);
  const fav = isFavorite(tool.id);
  const webOnly = !tool.platforms.includes('mobile');

  return (
    <Link to={`/tools/${tool.id}`} className={`tool-card ${compact ? 'compact' : ''}`} style={{ '--accent': category.color } as React.CSSProperties}>
      <div className="tool-card-icon" aria-hidden>
        {tool.icon}
      </div>
      <div className="tool-card-body">
        <div className="tool-card-title">
          {tool.name}
          {tool.isNew && <span className="badge badge-new">New</span>}
        </div>
        {!compact && <p className="tool-card-desc">{tool.description}</p>}
        {!compact && (
          <div className="tool-card-meta">
            <span className="chip" style={{ color: category.color }}>
              {category.name}
            </span>
            {webOnly && <span className="chip chip-muted">Web only</span>}
          </div>
        )}
      </div>
      <button
        type="button"
        className={`fav-btn ${fav ? 'active' : ''}`}
        aria-label={fav ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
        aria-pressed={fav}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(tool.id);
        }}
      >
        {fav ? '★' : '☆'}
      </button>
    </Link>
  );
}
