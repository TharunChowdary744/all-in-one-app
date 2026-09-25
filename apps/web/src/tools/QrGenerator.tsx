import { Download } from 'lucide-react';
import { qrToSvg, wifiQrPayload, type QrErrorCorrection } from '@omnikit/core';
import { useMemo, useState } from 'react';

import { Alert, Card, Field, Segmented } from '../components/ui';
import { downloadBlob, downloadText, errorMessage } from '../lib/files';
import { loadImage, renderImage } from '../lib/image';

type Mode = 'text' | 'wifi' | 'email' | 'phone';

export default function QrGenerator() {
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('https://github.com');
  const [ssid, setSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [security, setSecurity] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [phone, setPhone] = useState('');
  const [ecl, setEcl] = useState<QrErrorCorrection>('M');
  const [dark, setDark] = useState('#111827');
  const [light, setLight] = useState('#ffffff');
  const [size, setSize] = useState(512);

  const payload = useMemo(() => {
    switch (mode) {
      case 'text':
        return text;
      case 'wifi':
        return ssid ? wifiQrPayload(ssid, wifiPass, security) : '';
      case 'email':
        return email ? `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}` : '';
      case 'phone':
        return phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : '';
    }
  }, [mode, text, ssid, wifiPass, security, email, subject, phone]);

  const svg = useMemo(() => {
    if (!payload) return { svg: '', error: '' };
    try {
      return { svg: qrToSvg(payload, { ecl, dark, light }), error: '' };
    } catch (e) {
      return { svg: '', error: errorMessage(e) };
    }
  }, [payload, ecl, dark, light]);

  const downloadPng = async () => {
    const img = await loadImage(new Blob([svg.svg], { type: 'image/svg+xml' }));
    downloadBlob(await renderImage(img, { format: 'image/png', quality: 1, width: size, height: size }), 'qr-code.png');
  };

  return (
    <div className="split">
      <Card title="Content">
        <Segmented value={mode} onChange={setMode} options={[{ value: 'text', label: 'URL / Text' }, { value: 'wifi', label: 'Wi-Fi' }, { value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }]} />
        <div className="stack">
          {mode === 'text' && (
            <Field label="URL or text">
              <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
            </Field>
          )}
          {mode === 'wifi' && (
            <>
              <Field label="Network name (SSID)"><input value={ssid} onChange={(e) => setSsid(e.target.value)} /></Field>
              <Field label="Password"><input value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} disabled={security === 'nopass'} /></Field>
              <Field label="Security"><Segmented value={security} onChange={setSecurity} options={[{ value: 'WPA', label: 'WPA/WPA2' }, { value: 'WEP', label: 'WEP' }, { value: 'nopass', label: 'None' }]} /></Field>
            </>
          )}
          {mode === 'email' && (
            <>
              <Field label="Email address"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
              <Field label="Subject (optional)"><input value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
            </>
          )}
          {mode === 'phone' && <Field label="Phone number"><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>}
          <div className="form-row">
            <Field label="Foreground"><input type="color" value={dark} onChange={(e) => setDark(e.target.value)} /></Field>
            <Field label="Background"><input type="color" value={light} onChange={(e) => setLight(e.target.value)} /></Field>
            <Field label="Error correction" hint="Higher survives more damage">
              <Segmented value={ecl} onChange={setEcl} options={(['L', 'M', 'Q', 'H'] as const).map((v) => ({ value: v, label: v }))} />
            </Field>
          </div>
          <Field label={`PNG size: ${size}px`}>
            <input type="range" min={128} max={2048} step={64} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          </Field>
        </div>
      </Card>
      <Card title="QR code">
        <Alert>{svg.error}</Alert>
        {svg.svg ? (
          <>
            <div className="qr-preview" dangerouslySetInnerHTML={{ __html: svg.svg }} />
            <div className="actions center">
              <button type="button" className="btn btn-primary" onClick={downloadPng}><Download size={14} /> PNG</button>
              <button type="button" className="btn btn-outline" onClick={() => downloadText(svg.svg, 'qr-code.svg', 'image/svg+xml')}><Download size={14} /> SVG</button>
            </div>
          </>
        ) : (
          !svg.error && <p className="muted center">Fill in the content to generate a QR code.</p>
        )}
      </Card>
    </div>
  );
}
