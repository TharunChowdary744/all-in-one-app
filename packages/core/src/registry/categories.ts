import type { Category, CategoryId } from './types';

export const categories: Category[] = [
  { id: 'image', code: 'IMG', name: 'Images', description: 'Convert, resize and compress images', icon: 'Image' },
  { id: 'pdf', code: 'PDF', name: 'PDF', description: 'Merge, split and convert PDF files', icon: 'FileStack' },
  { id: 'document', code: 'DOC', name: 'Documents', description: 'Convert between document formats', icon: 'FileType' },
  { id: 'text', code: 'TXT', name: 'Text', description: 'Count, transform and clean up text', icon: 'Type' },
  { id: 'developer', code: 'DEV', name: 'Developer', description: 'Formatters, encoders and generators', icon: 'Braces' },
  { id: 'converter', code: 'CNV', name: 'Converters', description: 'Units, colors and time', icon: 'ArrowLeftRight' },
  { id: 'security', code: 'SEC', name: 'Security', description: 'Passwords and checksums', icon: 'ShieldCheck' },
  { id: 'finance', code: 'FIN', name: 'Finance', description: 'SIP, loans, interest and tax calculators', icon: 'Landmark' },
  { id: 'calculator', code: 'CAL', name: 'Calculators', description: 'Scientific, percentage, BMI, dates and bill splitting', icon: 'Calculator' },
];

const byId = new Map(categories.map((c) => [c.id, c]));

export function getCategory(id: CategoryId): Category {
  const category = byId.get(id);
  if (!category) throw new Error(`Unknown category: ${id}`);
  return category;
}
