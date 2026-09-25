import { htmlDocument, markdownToHtml } from '@omnikit/core';
import { useMemo, useState } from 'react';

import { Button, Card, CopyButton, Input, Output, Row, Screen } from '@/components/ui';
import { shareText } from '@/lib/files';

const SAMPLE = '# Hello OmniKit\n\nWrite **Markdown** here.\n\n- Lists\n- [Links](https://example.com)\n\n| A | B |\n|---|---|\n| 1 | 2 |';

export default function MarkdownToHtml() {
  const [md, setMd] = useState(SAMPLE);
  const html = useMemo(() => markdownToHtml(md), [md]);
  return (
    <Screen>
      <Input label="Markdown" multiline code value={md} onChangeText={setMd} style={{ minHeight: 200 }} />
      <Card title="HTML" right={<CopyButton text={html} />}>
        <Output value={html} />
      </Card>
      <Row>
        <Button label="Share .html" onPress={() => shareText(htmlDocument(html), 'document.html', 'text/html')} style={{ flex: 1 }} />
        <Button kind="outline" label="Share .md" onPress={() => shareText(md, 'document.md', 'text/markdown')} style={{ flex: 1 }} />
      </Row>
    </Screen>
  );
}
