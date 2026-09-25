import { isToolAvailable, type ToolDefinition } from '@omnikit/core';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAppState } from '../state/AppState';
import { RegistryIcon } from './Icon';

/** A cell in the catalog grid. */
export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const { isFavorite, toggleFavorite } = useAppState();
  const fav = isFavorite(tool.id);
  const webOnly = !isToolAvailable(tool, 'mobile');

  return (
    <div className="entry" data-cat={tool.category}>
      <span className="entry-icon" aria-hidden>
        <RegistryIcon name={tool.icon} />
      </span>
      {/* The name is the link; its ::after stretches over the whole cell so the card stays clickable. */}
      <Link to={`/tools/${tool.id}`} className="entry-name">
        {tool.name}
      </Link>
      <span className="entry-desc">{tool.description}</span>
      <span className="entry-tags">
        {tool.isNew && <span className="tag tag-accent">New</span>}
        {webOnly && <span className="tag" title="Not available in the mobile app">Web only</span>}
      </span>
      <button
        type="button"
        className={`star ${fav ? 'active' : ''}`}
        aria-label={fav ? `Unstar ${tool.name}` : `Star ${tool.name}`}
        aria-pressed={fav}
        title={fav ? 'Starred' : 'Star'}
        onClick={() => toggleFavorite(tool.id)}
      >
        <Star size={16} strokeWidth={1.75} fill={fav ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}

/** Compact link used for recent / starred shelves. */
export function ToolPill({ tool }: { tool: ToolDefinition }) {
  return (
    <Link to={`/tools/${tool.id}`} className="pill" data-cat={tool.category}>
      <RegistryIcon name={tool.icon} size={16} />
      {tool.name}
    </Link>
  );
}
