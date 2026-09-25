import { categories, getToolsByCategory } from '@omnikit/core';
import { useParams } from 'react-router-dom';

import { Breadcrumb } from '../components/Breadcrumb';
import { RegistryIcon } from '../components/Icon';
import { ToolCard } from '../components/ToolCard';
import { NotFound } from './NotFound';

export function CategoryPage() {
  const { id } = useParams();
  const category = categories.find((c) => c.id === id);
  if (!category) return <NotFound />;
  const list = getToolsByCategory(category.id);
  return (
    <div data-cat={category.id}>
      <Breadcrumb items={[{ label: 'All tools', to: '/' }, { label: category.name }]} />
      <header className="page-header">
        <div className="page-icon">
          <RegistryIcon name={category.icon} size={24} strokeWidth={1.75} />
        </div>
        <div className="page-header-text">
          <h1>{category.name}</h1>
          <p>{category.description}</p>
        </div>
        <span className="count">{list.length} tools</span>
      </header>
      <div className="catalog">{list.map((t) => <ToolCard key={t.id} tool={t} />)}</div>
    </div>
  );
}
