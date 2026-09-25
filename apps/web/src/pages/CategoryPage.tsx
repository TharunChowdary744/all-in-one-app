import { categories, getToolsByCategory } from '@omnikit/core';
import { Link, useParams } from 'react-router-dom';

import { ToolCard } from '../components/ToolCard';
import { NotFound } from './NotFound';

export function CategoryPage() {
  const { id } = useParams();
  const category = categories.find((c) => c.id === id);
  if (!category) return <NotFound />;
  const list = getToolsByCategory(category.id);
  return (
    <div>
      <nav className="breadcrumb">
        <Link to="/">Dashboard</Link> / <span>{category.name}</span>
      </nav>
      <header className="page-header" style={{ '--accent': category.color } as React.CSSProperties}>
        <div className="page-icon">{category.icon}</div>
        <div>
          <h1>{category.name}</h1>
          <p>{category.description}</p>
        </div>
      </header>
      <div className="grid">{list.map((t) => <ToolCard key={t.id} tool={t} />)}</div>
    </div>
  );
}
