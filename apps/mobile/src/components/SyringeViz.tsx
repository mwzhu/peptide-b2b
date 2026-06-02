import { View } from 'react-native';
import Svg, { Circle, G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { color, palette } from '../theme';

/**
 * A horizontal insulin-syringe diagram. The plunger and fill render to the
 * exact unit mark computed by the reconstitution engine — this is the visual
 * the patient draws against.
 */
export function SyringeViz({
  units,
  maxUnits = 100,
}: {
  units: number;
  maxUnits?: number;
}) {
  const W = 320;
  const H = 116;
  const barrelX = 30;
  const barrelW = 232;
  const barrelY = 40;
  const barrelH = 40;
  const ratio = Math.min(1, Math.max(0, units / maxUnits));
  const fillW = barrelW * ratio;
  const plungerX = barrelX + fillW;

  const ticks = Array.from({ length: maxUnits / 10 + 1 }, (_, i) => i * 10);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={W} height={H}>
        {/* Needle */}
        <Line
          x1={barrelX + barrelW}
          y1={barrelY + barrelH / 2}
          x2={W - 6}
          y2={barrelY + barrelH / 2}
          stroke={palette.sand[400]}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {/* Needle hub */}
        <Rect
          x={barrelX + barrelW}
          y={barrelY + barrelH / 2 - 6}
          width={12}
          height={12}
          rx={2}
          fill={palette.sand[300]}
        />
        {/* Barrel */}
        <Rect
          x={barrelX}
          y={barrelY}
          width={barrelW}
          height={barrelH}
          rx={9}
          fill={color.surface}
          stroke={palette.sand[300]}
          strokeWidth={1.5}
        />
        {/* Solution fill */}
        {fillW > 0 && (
          <Rect
            x={barrelX}
            y={barrelY}
            width={fillW}
            height={barrelH}
            rx={9}
            fill={palette.sage[300]}
            opacity={0.55}
          />
        )}
        {/* Graduations */}
        <G>
          {ticks.map((t) => {
            const x = barrelX + (barrelW * t) / maxUnits;
            const major = t % 50 === 0;
            return (
              <G key={t}>
                <Line
                  x1={x}
                  y1={barrelY}
                  x2={x}
                  y2={barrelY + (major ? 16 : 10)}
                  stroke={palette.sand[400]}
                  strokeWidth={major ? 1.6 : 1}
                />
                {t % 20 === 0 && (
                  <SvgText
                    x={x}
                    y={barrelY - 7}
                    fontSize={9}
                    fill={color.textMuted}
                    fontFamily="InterMedium"
                    textAnchor="middle"
                  >
                    {t}
                  </SvgText>
                )}
              </G>
            );
          })}
        </G>
        {/* Plunger shaft + head */}
        <Line
          x1={plungerX}
          y1={barrelY - 4}
          x2={plungerX}
          y2={barrelY + barrelH + 4}
          stroke={palette.sage[600]}
          strokeWidth={3}
        />
        <Circle cx={plungerX} cy={barrelY + barrelH / 2} r={7} fill={palette.sage[600]} />
        {/* Flange */}
        <Rect
          x={barrelX - 8}
          y={barrelY - 6}
          width={8}
          height={barrelH + 12}
          rx={3}
          fill={palette.sand[300]}
        />
        {/* Unit callout */}
        <SvgText
          x={plungerX}
          y={H - 6}
          fontSize={12}
          fill={palette.sage[600]}
          fontFamily="InterSemibold"
          textAnchor="middle"
        >
          {units} units
        </SvgText>
      </Svg>
    </View>
  );
}
