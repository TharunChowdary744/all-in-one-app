import { marked } from 'marked';

/** Convert Markdown (GFM) to an HTML fragment. Sanitize before injecting into a live DOM. */
export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false, gfm: true, breaks: false });
}

/** Wrap an HTML fragment in a standalone, lightly styled document for download. */
export function htmlDocument(bodyHtml: string, title = 'Document'): string {
  const safeTitle = title.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]!);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle}</title>
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 16px; line-height: 1.6; color: #1f2937; }
  pre, code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #f3f4f6; border-radius: 4px; }
  pre { padding: 12px; overflow-x: auto; }
  code { padding: 2px 4px; }
  pre code { padding: 0; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid #d1d5db; padding: 6px 10px; }
  blockquote { border-left: 4px solid #d1d5db; margin: 0; padding-left: 16px; color: #4b5563; }
  img { max-width: 100%; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>
`;
}
