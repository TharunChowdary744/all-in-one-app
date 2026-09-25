import Svg, { Circle, Rect } from 'react-native-svg';

import { useColors } from '@/theme/colors';

/** OmniKit mark: a 2×2 tool grid on ink, one cell picked out in signal orange. */
export function LogoMark({ size = 26 }: { size?: number }) {
  const c = useColors();
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width={32} height={32} rx={7} fill={c.ink} />
      <Rect x={7} y={7} width={8} height={8} rx={1.5} fill={c.background} />
      <Rect x={17} y={7} width={8} height={8} rx={1.5} fill={c.background} />
      <Rect x={7} y={17} width={8} height={8} rx={1.5} fill={c.background} />
      <Circle cx={21} cy={21} r={4.5} fill={c.accent} />
    </Svg>
  );
}
