import { colorScale, contrastRatio, formatHsl, formatRgb, parseColor, readableTextColor, rgbToHex, rgbToHsl } from '@omnikit/core';
import { useState } from 'react';

import { Alert, Card, CopyButton } from '../components/ui';

export default function ColorConverter() {
  const [input, setInput] = useState('#6d5dfc');
  const rgb = parseColor(input);

  const hex = rgb ? rgbToHex(rgb) : '';
  const values = rgb
    ? [
        { label: 'HEX', value: hex },
        { label: 'RGB', value: formatRgb(rgb) },
        { label: 'HSL', value: formatHsl(rgbToHsl(rgb)) },
      ]
    : [];

  return (
    <div className="tool-layout">
      <Card title="Pick or type a color">
        <div className="form-row">
          <input type="color" value={hex || '#000000'} onChange={(e) => setInput(e.target.value)} className="color-big" aria-label="Color picker" />
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="#ff6347, rgb(255, 99, 71) or hsl(9, 100%, 64%)" aria-label="Color value" />
        </div>
        {!rgb && <Alert>Unrecognized color. Try #ff6347, rgb(255, 99, 71) or hsl(9, 100%, 64%).</Alert>}
      </Card>
      {rgb && (
        <>
          <div className="swatch" style={{ background: hex, color: readableTextColor(rgb) }}>
            <strong>{hex.toUpperCase()}</strong>
            <span>
              Contrast vs white {contrastRatio(rgb, { r: 255, g: 255, b: 255 }).toFixed(2)} · vs black {contrastRatio(rgb, { r: 0, g: 0, b: 0 }).toFixed(2)}
            </span>
          </div>
          <Card title="Formats">
            <div className="result-list">
              {values.map((v) => (
                <div key={v.label} className="result-row">
                  <div className="result-label">{v.label}</div>
                  <code className="result-value">{v.value}</code>
                  <CopyButton text={v.value} />
                </div>
              ))}
            </div>
          </Card>
          <Card title="Shades & tints">
            <div className="palette-strip">
              {colorScale(rgb).map((c) => (
                <button key={c} type="button" style={{ background: c, color: readableTextColor(parseColor(c)!) }} onClick={() => setInput(c)} title={`Use ${c}`}>
                  {c}
                </button>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
