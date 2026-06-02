import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import type { MetricPoint } from '@beacon/domain';
import { color, palette } from '../theme';
import { Text } from './ui';

/** A soft area-line chart for outcome trends. */
export function LineChart({
  points,
  width,
  height = 150,
  tone = palette.sage[500],
}: {
  points: MetricPoint[];
  width: number;
  height?: number;
  tone?: string;
}) {
  if (points.length < 2) {
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="bodySm" tone="muted">
          Not enough data yet
        </Text>
      </View>
    );
  }

  const padX = 6;
  const padY = 14;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const coord = (p: MetricPoint, i: number) => {
    const x = padX + (innerW * i) / (points.length - 1);
    const y = padY + innerH * (1 - (p.value - min) / range);
    return { x, y };
  };

  const pts = points.map(coord);
  const line = pts.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const area = `${line} L ${pts[pts.length - 1]!.x} ${height} L ${pts[0]!.x} ${height} Z`;
  const last = pts[pts.length - 1]!;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tone} stopOpacity={0.22} />
          <Stop offset="1" stopColor={tone} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill="url(#areaFill)" />
      <Path d={line} stroke={tone} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last.x} cy={last.y} r={5.5} fill={tone} />
      <Circle cx={last.x} cy={last.y} r={2.5} fill={color.surface} />
    </Svg>
  );
}

/** Compact inline sparkline. */
export function Sparkline({
  points,
  width = 76,
  height = 30,
  tone = palette.sage[500],
}: {
  points: MetricPoint[];
  width?: number;
  height?: number;
  tone?: string;
}) {
  if (points.length < 2) return <View style={{ width, height }} />;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const line = points
    .map((p, i) => {
      const x = (width * i) / (points.length - 1);
      const y = 3 + (height - 6) * (1 - (p.value - min) / range);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  return (
    <Svg width={width} height={height}>
      <Path d={line} stroke={tone} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
