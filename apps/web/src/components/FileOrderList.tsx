import { formatBytes } from '@omnikit/core';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import type { ReactNode } from 'react';

/** Reorderable list of files (used by merge / images-to-pdf). */
export function FileOrderList<T extends { file: File }>({
  items,
  onChange,
  renderThumb,
  getKey,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderThumb?: (item: T) => ReactNode;
  getKey: (item: T) => string;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    onChange(next);
  };
  return (
    <ul className="file-list">
      {items.map((item, i) => (
        <li key={getKey(item)} className="file-row">
          <span className="order">{String(i + 1).padStart(2, '0')}</span>
          {renderThumb?.(item)}
          <div className="file-info">
            <div className="file-name">{item.file.name}</div>
            <div className="file-meta">{formatBytes(item.file.size)}</div>
          </div>
          <button type="button" className="icon-btn plain" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)}>
            <ArrowUp size={15} />
          </button>
          <button type="button" className="icon-btn plain" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, i + 1)}>
            <ArrowDown size={15} />
          </button>
          <button type="button" className="icon-btn plain" aria-label="Remove" onClick={() => onChange(items.filter((_, k) => k !== i))}>
            <X size={15} />
          </button>
        </li>
      ))}
    </ul>
  );
}
