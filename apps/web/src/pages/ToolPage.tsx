import { getCategory, getTool, getToolCode } from '@omnikit/core';
import { Star } from 'lucide-react';
import { Suspense, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

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
    <div className="tool-page">
      <nav className="breadcrumb">
        <Link to="/">Index</Link> / <Link to={`/category/${category.id}`}>{category.name}</Link> / <span className="current">{getToolCode(tool)}</span>
      </nav>
      <header className="page-header">
        <div className="page-icon">
          <RegistryIcon name={tool.icon} size={26} />
        </div>
        <div className="page-header-text">
          <h1>{tool.name}</h1>
          <p>{tool.description}</p>
        </div>
        <button type="button" className={`btn ${fav ? 'btn-primary' : 'btn-outline'}`} onClick={() => toggleFavorite(tool.id)} aria-pressed={fav}>
          <Star size={15} strokeWidth={1.6} fill={fav ? 'currentColor' : 'none'} /> {fav ? 'Starred' : 'Star'}
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
