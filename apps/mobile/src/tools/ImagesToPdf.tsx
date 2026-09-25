import { ArrowUp, ArrowDown, X } from 'lucide-react-native';
import * as Print from 'expo-print';
import { Image } from 'expo-image';
import { SaveFormat } from 'expo-image-manipulator';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, Muted, Notice, Screen, Segmented } from '@/components/ui';
import { errorMessage, shareUri } from '@/lib/files';
import { pickImages, processImage, type PickedImage } from '@/lib/images';
import { useAppState } from '@/state/AppState';
import { radius, useColors } from '@/theme/colors';
import { Text } from '@/components/Text';

type PageSize = 'a4' | 'letter';
const SIZES: Record<PageSize, { width: number; height: number }> = { a4: { width: 595, height: 842 }, letter: { width: 612, height: 792 } };

export default function ImagesToPdf() {
  const c = useColors();
  const [images, setImages] = useState<PickedImage[]>([]);
  const [size, setSize] = useState<PageSize>('a4');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { recordFiles } = useAppState();

  const add = async () => {
    const picked = await pickImages(true);
    setImages((prev) => [...prev, ...picked]);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m!);
    setImages(next);
  };

  const build = async () => {
    setBusy(true);
    setError('');
    try {
      // Downscale + JPEG-encode each photo so the generated PDF stays a reasonable size.
      const pages: string[] = [];
      for (const img of images) {
        const out = await processImage(img.uri, { format: SaveFormat.JPEG, quality: 0.85, width: img.width > 1600 ? 1600 : undefined, base64: true });
        pages.push(`<div class="page"><img src="data:image/jpeg;base64,${out.base64}" /></div>`);
      }
      const html = `<!doctype html><html><head><meta charset="utf-8"><style>
        @page { margin: 0; }
        html, body { margin: 0; padding: 0; }
        .page { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; page-break-after: always; box-sizing: border-box; padding: 24px; }
        .page:last-child { page-break-after: auto; }
        img { max-width: 100%; max-height: 100%; object-fit: contain; }
      </style></head><body>${pages.join('')}</body></html>`;
      const { uri } = await Print.printToFileAsync({ html, ...SIZES[size] });
      recordFiles(images.length);
      await shareUri(uri, 'application/pdf');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Button label="Add images" kind={images.length ? 'outline' : 'primary'} onPress={() => add().catch(() => undefined)} />
      <Segmented value={size} onChange={setSize} options={[{ value: 'a4', label: 'A4' }, { value: 'letter', label: 'US Letter' }]} />
      {images.length === 0 && <Muted>Each image becomes one page. You can reorder them before creating the PDF.</Muted>}
      {images.map((img, i) => (
        <Card key={`${img.uri}-${i}`}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ color: c.muted, fontWeight: '800', width: 20 }}>{i + 1}</Text>
            <Image source={{ uri: img.uri }} style={{ width: 52, height: 52, borderRadius: radius.sm }} contentFit="cover" />
            <Text numberOfLines={1} style={{ color: c.ink, flex: 1 }}>{img.name}</Text>
            <Pressable hitSlop={8} onPress={() => move(i, i - 1)}><ArrowUp size={18} color={c.ink2} /></Pressable>
            <Pressable hitSlop={8} onPress={() => move(i, i + 1)}><ArrowDown size={18} color={c.ink2} /></Pressable>
            <Pressable hitSlop={8} onPress={() => setImages(images.filter((_, k) => k !== i))}><X size={18} color={c.bad} /></Pressable>
          </View>
        </Card>
      ))}
      <Notice>{error}</Notice>
      <Button label={`Create PDF (${images.length} page${images.length === 1 ? '' : 's'})`} onPress={build} loading={busy} disabled={!images.length} />
    </Screen>
  );
}
