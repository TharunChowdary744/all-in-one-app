import { formatBytes } from '@omnikit/core';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, Input, Notice, Row, Screen, Segmented, Toggle } from '@/components/ui';
import { errorMessage, shareUri } from '@/lib/files';
import { outputFormats, pickImages, processImage, type PickedImage, type ProcessedImage } from '@/lib/images';
import { useAppState } from '@/state/AppState';
import { radius, useColors } from '@/theme/colors';

export default function ImageResizer() {
  const c = useColors();
  const [src, setSrc] = useState<PickedImage | null>(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [lock, setLock] = useState(true);
  const [fmtIdx, setFmtIdx] = useState(0);
  const [quality, setQuality] = useState(0.8);
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { recordFiles } = useAppState();
  const target = outputFormats[fmtIdx]!;

  const pick = async () => {
    const [img] = await pickImages(false);
    if (!img) return;
    setSrc(img);
    setWidth(String(img.width));
    setHeight(String(img.height));
    setResult(null);
  };

  const ratio = src ? src.width / src.height : 1;
  const onW = (v: string) => {
    setWidth(v);
    if (lock && Number(v)) setHeight(String(Math.round(Number(v) / ratio)));
  };
  const onH = (v: string) => {
    setHeight(v);
    if (lock && Number(v)) setWidth(String(Math.round(Number(v) * ratio)));
  };
  const preset = (pct: number) => {
    if (!src) return;
    setWidth(String(Math.round((src.width * pct) / 100)));
    setHeight(String(Math.round((src.height * pct) / 100)));
  };

  const run = async () => {
    if (!src) return;
    setBusy(true);
    setError('');
    try {
      setResult(await processImage(src.uri, { format: target.format, quality, width: Number(width), height: Number(height) }));
      recordFiles(1);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Button label={src ? '📷 Choose another image' : '📷 Choose an image'} kind={src ? 'outline' : 'primary'} onPress={() => pick().catch(() => undefined)} />
      {src && (
        <>
          <Card title={`Original · ${src.width}×${src.height} · ${formatBytes(src.size)}`}>
            <Row>
              <View style={{ flex: 1 }}><Input label="Width" value={width} onChangeText={onW} keyboardType="number-pad" /></View>
              <View style={{ flex: 1 }}><Input label="Height" value={height} onChangeText={onH} keyboardType="number-pad" /></View>
            </Row>
            <Toggle label="🔒 Keep aspect ratio" value={lock} onChange={setLock} />
            <Row>
              {[25, 50, 75, 100].map((p) => <Button key={p} small kind="outline" label={`${p}%`} onPress={() => preset(p)} />)}
            </Row>
            <Segmented value={fmtIdx} onChange={setFmtIdx} options={outputFormats.map((f, i) => ({ value: i, label: f.label }))} />
            {target.label !== 'PNG' && (
              <Segmented value={quality} onChange={setQuality} options={[0.4, 0.6, 0.8, 1].map((q) => ({ value: q, label: `Quality ${Math.round(q * 100)}%` }))} />
            )}
            <Button label="📐 Resize" onPress={run} loading={busy} disabled={!Number(width) || !Number(height)} />
          </Card>
          <Notice>{error}</Notice>
        </>
      )}
      {result && src && (
        <Card title="Result" right={<Button small label="Share" onPress={() => shareUri(result.uri, target.mime)} />}>
          <Image source={{ uri: result.uri }} style={{ width: '100%', aspectRatio: result.width / result.height, borderRadius: radius.sm }} contentFit="contain" />
          <Text style={{ color: c.text2 }}>
            {result.width}×{result.height} · {formatBytes(result.size)}{' '}
            <Text style={{ color: result.size <= src.size ? c.good : c.bad }}>({Math.round((result.size / Math.max(1, src.size) - 1) * 100)}%)</Text>
          </Text>
        </Card>
      )}
    </Screen>
  );
}
