import { getCategory, getTool } from '@omnikit/core';
import { Star } from 'lucide-react';
import { Suspense, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Breadcrumb } from '../components/Breadcrumb';
import { RegistryIcon } from '../components/Icon';
import { Spinner } from '../components/ui';
import { useAppState } from '../state/AppState';
import { toolComponents } from '../tools';
import { NotFound } from './NotFound';

export function ToolPage() {
  const { id = '' } = useParams();
  const tool = getTool(id);
  const { isFavorite, toggleFavorite, recordVisit } = useAppState();

  useEffect(() => {
    if (tool) {
      recordVisit(tool.id);
      document.title = `${tool.name} · OmniKit`;
    }
    return () => {
      document.title = 'OmniKit';
    };
  }, [tool, recordVisit]);

  const Component = toolComponents[id];
  if (!tool || !Component) return <NotFound />;
  const category = getCategory(tool.category);
  const fav = isFavorite(tool.id);

  return (
    <div className="tool-page" data-cat={tool.category}>
      <Breadcrumb items={[{ label: 'All tools', to: '/' }, { label: category.name, to: `/category/${category.id}` }, { label: tool.name }]} />
      <header className="page-header">
        <div className="page-icon">
          <RegistryIcon name={tool.icon} size={24} strokeWidth={1.75} />
        </div>
        <div className="page-header-text">
          <h1>{tool.name}</h1>
          <p>{tool.description}</p>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => toggleFavorite(tool.id)} aria-pressed={fav} title={fav ? 'Starred' : 'Star tool'}>
          <Star size={16} strokeWidth={1.75} fill={fav ? 'var(--accent)' : 'none'} color={fav ? 'var(--accent)' : 'currentColor'} />
          <span className="btn-label">{fav ? 'Starred' : 'Star tool'}</span>
        </button>
      </header>
      <Suspense
        fallback={
          <div className="loading">
            <Spinner /> Loading tool…
          </div>
        }
      >
        <Component />
      </Suspense>
    </div>
  );
}
