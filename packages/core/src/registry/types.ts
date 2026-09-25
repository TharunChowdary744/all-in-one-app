/** Lucide icon names used by the registry. Both apps map every name to a component. */
export type IconName =
  | 'Image' | 'FileStack' | 'FileType' | 'Type' | 'Braces' | 'ArrowLeftRight' | 'ShieldCheck'
  | 'RefreshCcw' | 'Scaling' | 'Images' | 'Merge' | 'Scissors' | 'FileImage' | 'FileText' | 'FileCode'
  | 'Heading' | 'Table' | 'Pilcrow' | 'CaseSensitive' | 'Eraser' | 'Binary' | 'Link' | 'Fingerprint'
  | 'QrCode' | 'Ruler' | 'Palette' | 'Clock' | 'KeyRound' | 'Hash';

export type Platform = 'web' | 'mobile';

export type CategoryId =
  | 'image'
  | 'pdf'
  | 'document'
  | 'text'
  | 'developer'
  | 'converter'
  | 'security';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  /** Short catalog code, e.g. "PDF" — tools are numbered PDF-01, PDF-02… */
  code: string;
  /** Lucide icon name; resolved to a component by each app (lucide-react / lucide-react-native). */
  icon: IconName;
}

export interface ToolDefinition {
  /** Stable id, used in routes (`/tools/:id`) and for favorites/recents storage. */
  id: string;
  name: string;
  /** One-line summary shown on dashboard cards. */
  description: string;
  category: CategoryId;
  /** Lucide icon name. */
  icon: IconName;
  /** Extra search terms (formats, synonyms). */
  keywords: string[];
  /** Platforms that ship an implementation of this tool. */
  platforms: Platform[];
  /** Highlight on the dashboard. */
  featured?: boolean;
  isNew?: boolean;
}
