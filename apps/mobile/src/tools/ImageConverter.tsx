import { formatBytes, replaceExtension } from '@omnikit/core';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, Muted, Notice, Screen, Segmented } from '@/components/ui';
import { errorMessage, shareUri } from '@/lib/files';
import { outputFormats, pickImages, processImage, type PickedImage, type ProcessedImage } from '@/lib/images';
import { useAppState } from '@/state/AppState';
import { radius, useColors } from '@/theme/colors';

interface Item {
  source: PickedImage;
  result?: ProcessedImage;
  error?: string;
}

export default function ImageConverter() {
  const c = useColors();
  const [items, setItems] = useState<Item[]>([]);
  const [fmtIdx, setFmtIdx] = useState(0);
  const [quality, setQuality] = useState(0.85);
  const [busy, setBusy] = useState(false);
  const { recordFiles } = useAppState();
  const target = outputFormats[fmtIdx]!;

  const pick = async () => {
    const picked = await pickImages(true);
    if (picked.length) setItems(picked.map((source) => ({ source })));
  };

  const convert = async () => {
    setBusy(true);
    const next: Item[] = [];
    for (const item of items) {
      try {
        next.push({ source: item.source, result: await processImage(item.source.uri, { format: target.format, quality }) });
      } catch (e) {
        next.push({ source: item.source, error: errorMessage(e) });
      }
    }
    setItems(next);
    recordFiles(next.filter((i) => i.result).length);
    setBusy(false);
  };

  return (
    <Screen>
      <Button label={items.length ? `📷 ${items.length} selected — pick again` : '📷 Choose images'} kind={items.length ? 'outline' : 'primary'} onPress={() => pick().catch(() => undefined)} />
      <Card title="Convert to">
        <Segmented value={fmtIdx} onChange={setFmtIdx} options={outputFormats.map((f, i) => ({ value: i, label: f.label }))} />
        {target.label !== 'PNG' && (
          <>
            <Muted>Quality</Muted>
            <Segmented value={quality} onChange={setQuality} options={[0.5, 0.7, 0.85, 1].map((q) => ({ value: q, label: `${Math.round(q * 100)}%` }))} />
          </>
        )}
        <Button label={`⚡ Convert to ${target.label}`} onPress={convert} disabled={!items.length} loading={busy} />
      </Card>
      {items.map((item, i) => (
        <Card key={`${item.source.uri}-${i}`}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Image source={{ uri: item.result?.uri ?? item.source.uri }} style={{ width: 64, height: 64, borderRadius: radius.sm }} contentFit="cover" />
            <View style={{ flex: 1, gap: 2 }}>
              <Text numberOfLines={1} style={{ color: c.text, fontWeight: '700' }}>
                {item.result ? replaceExtension(item.source.name, target.ext) : item.source.name}
              </Text>
              <Text style={{ color: c.muted, fontSize: 12 }}>
                {formatBytes(item.source.size)}
                {item.result ? ` → ${formatBytes(item.result.size)}` : ''}
              </Text>
            </View>
            {item.result && <Button small label="Share" onPress={() => shareUri(item.result!.uri, target.mime)} />}
          </View>
          <Notice>{item.error}</Notice>
        </Card>
      ))}
    </Screen>
  );
}
