import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { palette } from '@beacon/theme';

const TOOLTIP_STYLE = {
  background: '#FFFDF8',
  border: `1px solid ${palette.sand[300]}`,
  borderRadius: 12,
  fontSize: 12,
  fontFamily: 'Inter, system-ui, sans-serif',
  color: palette.ink[800],
  padding: '8px 12px',
};

export function TrendChart({
  data,
  unit = '',
  height = 200,
  color = palette.sage[500],
}: {
  data: { x: string; y: number }[];
  unit?: string;
  height?: number;
  color?: string;
}) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 6, right: 6, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="areaTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={palette.sand[200]} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="x"
            tick={{ fontSize: 10, fill: palette.ink[500] }}
            tickFormatter={(v: string) => v.slice(5)}
            axisLine={false}
            tickLine={false}
            minTickGap={20}
          />
          <YAxis tick={{ fontSize: 10, fill: palette.ink[500] }} axisLine={false} tickLine={false} width={32} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}${unit}`, '']} labelStyle={{ color: palette.ink[600] }} />
          <Area type="monotone" dataKey="y" stroke={color} strokeWidth={2.5} fill="url(#areaTrend)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarsChart({
  data,
  height = 200,
  color = palette.sage[500],
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 6, right: 6, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={palette.sand[200]} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: palette.ink[500] }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: palette.ink[500] }} axisLine={false} tickLine={false} width={32} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const PIE_PALETTE = [palette.sage[500], palette.clay[400], palette.blue[400], palette.gold[400], palette.sage[300], palette.clay[300]];

export function DonutChart({
  data,
  height = 200,
}: {
  data: { name: string; value: number }[];
  height?: number;
}) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
