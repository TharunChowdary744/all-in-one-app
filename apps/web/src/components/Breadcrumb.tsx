import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';

/** "All tools › Documents › PDF to Word" — the last item is the current page. */
export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && <ChevronRight size={14} aria-hidden />}
          {item.to ? (
            <Link to={item.to}>{item.label}</Link>
          ) : (
            <span className="current" aria-current="page">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
