export interface Unit {
  id: string;
  name: string;
  symbol: string;
  /** Multiply by this to get the base unit (ignored for temperature). */
  factor: number;
}

export interface UnitGroup {
  id: string;
  name: string;
  icon: string;
  units: Unit[];
}

const u = (id: string, name: string, symbol: string, factor: number): Unit => ({ id, name, symbol, factor });

export const unitGroups: UnitGroup[] = [
  {
    id: 'length',
    name: 'Length',
    icon: '📏',
    units: [
      u('mm', 'Millimeter', 'mm', 0.001),
      u('cm', 'Centimeter', 'cm', 0.01),
      u('m', 'Meter', 'm', 1),
      u('km', 'Kilometer', 'km', 1000),
      u('in', 'Inch', 'in', 0.0254),
      u('ft', 'Foot', 'ft', 0.3048),
      u('yd', 'Yard', 'yd', 0.9144),
      u('mi', 'Mile', 'mi', 1609.344),
      u('nmi', 'Nautical mile', 'nmi', 1852),
    ],
  },
  {
    id: 'mass',
    name: 'Weight',
    icon: '⚖️',
    units: [
      u('mg', 'Milligram', 'mg', 0.000001),
      u('g', 'Gram', 'g', 0.001),
      u('kg', 'Kilogram', 'kg', 1),
      u('t', 'Tonne', 't', 1000),
      u('oz', 'Ounce', 'oz', 0.028349523125),
      u('lb', 'Pound', 'lb', 0.45359237),
      u('st', 'Stone', 'st', 6.35029318),
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    icon: '🌡️',
    units: [u('c', 'Celsius', '°C', 1), u('f', 'Fahrenheit', '°F', 1), u('k', 'Kelvin', 'K', 1)],
  },
  {
    id: 'area',
    name: 'Area',
    icon: '⬛',
    units: [
      u('cm2', 'Square centimeter', 'cm²', 0.0001),
      u('m2', 'Square meter', 'm²', 1),
      u('km2', 'Square kilometer', 'km²', 1e6),
      u('ft2', 'Square foot', 'ft²', 0.09290304),
      u('ac', 'Acre', 'ac', 4046.8564224),
      u('ha', 'Hectare', 'ha', 10000),
      u('mi2', 'Square mile', 'mi²', 2589988.110336),
    ],
  },
  {
    id: 'volume',
    name: 'Volume',
    icon: '🧪',
    units: [
      u('ml', 'Milliliter', 'ml', 0.001),
      u('l', 'Liter', 'L', 1),
      u('m3', 'Cubic meter', 'm³', 1000),
      u('tsp', 'Teaspoon (US)', 'tsp', 0.00492892159375),
      u('tbsp', 'Tablespoon (US)', 'tbsp', 0.01478676478125),
      u('cup', 'Cup (US)', 'cup', 0.2365882365),
      u('floz', 'Fluid ounce (US)', 'fl oz', 0.0295735295625),
      u('gal', 'Gallon (US)', 'gal', 3.785411784),
    ],
  },
  {
    id: 'speed',
    name: 'Speed',
    icon: '🚀',
    units: [
      u('mps', 'Meters per second', 'm/s', 1),
      u('kph', 'Kilometers per hour', 'km/h', 1 / 3.6),
      u('mph', 'Miles per hour', 'mph', 0.44704),
      u('kn', 'Knot', 'kn', 1852 / 3600),
    ],
  },
  {
    id: 'data',
    name: 'Data',
    icon: '💾',
    units: [
      u('b', 'Byte', 'B', 1),
      u('kb', 'Kilobyte', 'KB', 1e3),
      u('mb', 'Megabyte', 'MB', 1e6),
      u('gb', 'Gigabyte', 'GB', 1e9),
      u('tb', 'Terabyte', 'TB', 1e12),
      u('kib', 'Kibibyte', 'KiB', 1024),
      u('mib', 'Mebibyte', 'MiB', 1024 ** 2),
      u('gib', 'Gibibyte', 'GiB', 1024 ** 3),
      u('bit', 'Bit', 'bit', 1 / 8),
    ],
  },
  {
    id: 'time',
    name: 'Time',
    icon: '⏳',
    units: [
      u('ms', 'Millisecond', 'ms', 0.001),
      u('s', 'Second', 's', 1),
      u('min', 'Minute', 'min', 60),
      u('h', 'Hour', 'h', 3600),
      u('d', 'Day', 'd', 86400),
      u('wk', 'Week', 'wk', 604800),
      u('yr', 'Year (365 d)', 'yr', 31536000),
    ],
  },
];

function toCelsius(value: number, from: string): number {
  if (from === 'f') return ((value - 32) * 5) / 9;
  if (from === 'k') return value - 273.15;
  return value;
}

function fromCelsius(value: number, to: string): number {
  if (to === 'f') return (value * 9) / 5 + 32;
  if (to === 'k') return value + 273.15;
  return value;
}

export function convertUnit(value: number, groupId: string, fromId: string, toId: string): number {
  const group = unitGroups.find((g) => g.id === groupId);
  if (!group) throw new Error(`Unknown unit group: ${groupId}`);
  if (groupId === 'temperature') return fromCelsius(toCelsius(value, fromId), toId);
  const from = group.units.find((x) => x.id === fromId);
  const to = group.units.find((x) => x.id === toId);
  if (!from || !to) throw new Error('Unknown unit');
  return (value * from.factor) / to.factor;
}

/** Human-friendly number: up to 10 significant digits, no float noise. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (value !== 0 && (Math.abs(value) >= 1e15 || Math.abs(value) < 1e-6)) return value.toExponential(6);
  return String(Number.parseFloat(value.toPrecision(10)));
}
