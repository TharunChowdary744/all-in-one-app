import DOMPurify from 'dompurify';

/** Sanitize untrusted HTML (converted documents, Markdown) before rendering it in the page. */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
