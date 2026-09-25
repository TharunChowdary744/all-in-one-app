import type { Category, CategoryId } from './types';

export const categories: Category[] = [
  {
    id: 'image',
    name: 'Image Tools',
    description: 'Convert, resize and compress images',
    icon: '🖼️',
    color: '#8b5cf6',
  },
  {
    id: 'pdf',
    name: 'PDF Tools',
    description: 'Merge, split and convert PDF files',
    icon: '📕',
    color: '#ef4444',
  },
  {
    id: 'document',
    name: 'Documents',
    description: 'Convert between document formats',
    icon: '📄',
    color: '#3b82f6',
  },
  {
    id: 'text',
    name: 'Text Tools',
    description: 'Count, transform and clean up text',
    icon: '✍️',
    color: '#f59e0b',
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Formatters, encoders and generators',
    icon: '🧑‍💻',
    color: '#10b981',
  },
  {
    id: 'converter',
    name: 'Converters',
    description: 'Units, colors, time and more',
    icon: '🔁',
    color: '#06b6d4',
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Passwords and hashing',
    icon: '🔐',
    color: '#ec4899',
  },
];

const byId = new Map(categories.map((c) => [c.id, c]));

export function getCategory(id: CategoryId): Category {
  const category = byId.get(id);
  if (!category) throw new Error(`Unknown category: ${id}`);
  return category;
}
