import { getToolCode, isToolAvailable, type ToolDefinition } from '@omnikit/core';
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
    <Link to={`/tools/${tool.id}`} className="entry">
      <div className="entry-top">
        <span className="entry-code">{getToolCode(tool)}</span>
        <button
          type="button"
          className={`star ${fav ? 'active' : ''}`}
          aria-label={fav ? `Unstar ${tool.name}` : `Star ${tool.name}`}
          aria-pressed={fav}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(tool.id);
          }}
        >
          <Star size={15} strokeWidth={1.6} fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="entry-icon">
        <RegistryIcon name={tool.icon} />
      </div>
      <div className="entry-name">{tool.name}</div>
      <p className="entry-desc">{tool.description}</p>
      <div className="entry-tags">
        {tool.isNew && <span className="tag tag-accent">New</span>}
        {webOnly && <span className="tag">Web only</span>}
      </div>
    </Link>
  );
}

/** Compact link used for recent / starred shelves. */
export function ToolPill({ tool }: { tool: ToolDefinition }) {
  return (
    <Link to={`/tools/${tool.id}`} className="pill">
      <RegistryIcon name={tool.icon} size={16} />
      {tool.name}
    </Link>
  );
}
