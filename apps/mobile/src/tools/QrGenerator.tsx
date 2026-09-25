import { createQrMatrix, qrMatrixToPath, qrToSvg, wifiQrPayload, type QrErrorCorrection } from '@omnikit/core';
import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { Button, Card, Input, Muted, Notice, Row, Screen, Segmented } from '@/components/ui';
import { errorMessage, shareBase64, shareText } from '@/lib/files';

type Mode = 'text' | 'wifi' | 'phone';
const MARGIN = 2;

export default function QrGenerator() {
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('https://github.com');
  const [ssid, setSsid] = useState('');
  const [pass, setPass] = useState('');
  const [phone, setPhone] = useState('');
  const [ecl, setEcl] = useState<QrErrorCorrection>('M');
  const svgRef = useRef<Svg>(null);

  const payload = mode === 'text' ? text : mode === 'wifi' ? (ssid ? wifiQrPayload(ssid, pass, pass ? 'WPA' : 'nopass') : '') : phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : '';

  const qr = useMemo(() => {
    if (!payload) return null;
    try {
      const matrix = createQrMatrix(payload, ecl);
      return { path: qrMatrixToPath(matrix, MARGIN), size: matrix.length + MARGIN * 2, error: '' };
    } catch (e) {
      return { path: '', size: 0, error: errorMessage(e) };
    }
  }, [payload, ecl]);

  const sharePng = () =>
    svgRef.current?.toDataURL((base64) => {
      shareBase64(base64, 'qr-code.png', 'image/png').catch(() => undefined);
    }, { width: 1024, height: 1024 });

  return (
    <Screen>
      <Segmented value={mode} onChange={setMode} options={[{ value: 'text', label: 'URL / Text' }, { value: 'wifi', label: 'Wi-Fi' }, { value: 'phone', label: 'Phone' }]} />
      {mode === 'text' && <Input label="URL or text" multiline value={text} onChangeText={setText} autoCapitalize="none" style={{ minHeight: 80 }} />}
      {mode === 'wifi' && (
        <>
          <Input label="Network name (SSID)" value={ssid} onChangeText={setSsid} autoCapitalize="none" />
          <Input label="Password (leave empty for open network)" value={pass} onChangeText={setPass} autoCapitalize="none" />
        </>
      )}
      {mode === 'phone' && <Input label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />}
      <Muted>Error correction (higher survives more damage)</Muted>
      <Segmented value={ecl} onChange={setEcl} options={(['L', 'M', 'Q', 'H'] as const).map((v) => ({ value: v, label: v }))} />
      <Notice>{qr?.error}</Notice>
      {qr && !qr.error && (
        <Card>
          <View style={{ alignItems: 'center' }}>
            <Svg ref={svgRef} width={260} height={260} viewBox={`0 0 ${qr.size} ${qr.size}`}>
              <Rect width={qr.size} height={qr.size} fill="#ffffff" />
              <Path d={qr.path} fill="#111827" />
            </Svg>
          </View>
          <Row>
            <Button label="Share PNG" onPress={sharePng} style={{ flex: 1 }} />
            <Button kind="outline" label="Share SVG" onPress={() => shareText(qrToSvg(payload, { ecl, dark: '#111827' }), 'qr-code.svg', 'image/svg+xml')} style={{ flex: 1 }} />
          </Row>
        </Card>
      )}
    </Screen>
  );
}
