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
  /** Emoji icon — renders identically on web and native without an icon font. */
  icon: string;
  /** Accent color used for cards and badges. */
  color: string;
}

export interface ToolDefinition {
  /** Stable id, used in routes (`/tools/:id`) and for favorites/recents storage. */
  id: string;
  name: string;
  /** One-line summary shown on dashboard cards. */
  description: string;
  category: CategoryId;
  icon: string;
  /** Extra search terms (formats, synonyms). */
  keywords: string[];
  /** Platforms that ship an implementation of this tool. */
  platforms: Platform[];
  /** Highlight on the dashboard. */
  featured?: boolean;
  isNew?: boolean;
}
