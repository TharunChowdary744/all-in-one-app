import { htmlDocument, markdownToHtml } from '@omnikit/core';
import { useMemo, useState } from 'react';

import { Card, CopyButton, Segmented } from '../components/ui';
import { downloadText } from '../lib/files';
import { sanitizeHtml } from '../lib/sanitize';

const SAMPLE = `# Welcome to OmniKit ✨

Write **Markdown** on the left and see the result instantly.

## Features
- [x] GitHub-flavored tables and task lists
- [ ] Your next great README

| Tool | Platform |
| ---- | -------- |
| Markdown to HTML | Web & Mobile |

> Tip: use the buttons above to copy or download the HTML.

\`\`\`js
console.log('Hello from OmniKit');
\`\`\`
`;

export default function MarkdownToHtml() {
  const [md, setMd] = useState(SAMPLE);
  const [view, setView] = useState<'preview' | 'html'>('preview');
  const html = useMemo(() => sanitizeHtml(markdownToHtml(md)), [md]);

  return (
    <div className="split">
      <Card title="Markdown" actions={<button type="button" className="btn btn-ghost btn-sm" onClick={() => setMd('')}>Clear</button>}>
        <textarea className="code editor" value={md} onChange={(e) => setMd(e.target.value)} spellCheck={false} aria-label="Markdown input" />
      </Card>
      <Card
        title={<Segmented value={view} onChange={setView} options={[{ value: 'preview', label: 'Preview' }, { value: 'html', label: 'HTML' }]} />}
        actions={
          <>
            <CopyButton text={html} label="Copy HTML" />
            <button type="button" className="btn btn-primary btn-sm" onClick={() => downloadText(htmlDocument(html), 'document.html', 'text/html')}>
              ⬇️ .html
            </button>
          </>
        }
      >
        {view === 'preview' ? <div className="prose editor" dangerouslySetInnerHTML={{ __html: html }} /> : <textarea className="code editor" readOnly value={html} />}
      </Card>
    </div>
  );
}
