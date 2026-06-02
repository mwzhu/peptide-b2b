import { Pressable, View } from 'react-native';
import Svg, { Circle, G, Rect } from 'react-native-svg';
import type { InjectionSite } from '@beacon/domain';
import { color, palette } from '../theme';
import { Text } from './ui';

interface SiteSpot {
  site: InjectionSite;
  x: number;
  y: number;
}

/** Tappable injection sites laid over a stylized front-facing body. */
const SPOTS: SiteSpot[] = [
  { site: 'arm_left', x: 60, y: 104 },
  { site: 'arm_right', x: 160, y: 104 },
  { site: 'abdomen_left', x: 98, y: 138 },
  { site: 'abdomen_right', x: 122, y: 138 },
  { site: 'thigh_left', x: 96, y: 212 },
  { site: 'thigh_right', x: 124, y: 212 },
];

export function BodyMap({
  value,
  suggested,
  onChange,
}: {
  value?: InjectionSite;
  suggested?: InjectionSite;
  onChange: (site: InjectionSite) => void;
}) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: 220, height: 300 }}>
        <Svg width={220} height={300} viewBox="0 0 220 300">
          {/* Silhouette */}
          <G fill={palette.sand[200]}>
            <Circle cx={110} cy={36} r={23} />
            <Rect x={100} y={55} width={20} height={14} rx={6} />
            <Rect x={76} y={66} width={68} height={110} rx={24} />
            <Rect x={48} y={72} width={22} height={96} rx={11} />
            <Rect x={150} y={72} width={22} height={96} rx={11} />
            <Rect x={80} y={172} width={28} height={116} rx={14} />
            <Rect x={112} y={172} width={28} height={116} rx={14} />
          </G>
        </Svg>
        {/* Site hotspots — Pressables positioned over the SVG */}
        {SPOTS.map((spot) => {
          const selected = value === spot.site;
          const isSuggested = suggested === spot.site && !selected;
          return (
            <Pressable
              key={spot.site}
              onPress={() => onChange(spot.site)}
              style={{
                position: 'absolute',
                left: spot.x - 16,
                top: spot.y - 16,
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? color.primary : color.surface,
                borderWidth: 2,
                borderColor: selected
                  ? color.primary
                  : isSuggested
                    ? color.accent
                    : color.borderStrong,
                borderStyle: isSuggested ? 'dashed' : 'solid',
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: selected ? color.onPrimary : isSuggested ? color.accent : color.textMuted,
                }}
              />
            </Pressable>
          );
        })}
      </View>
      {suggested && suggested !== value ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginTop: 4,
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              borderWidth: 2,
              borderColor: color.accent,
              borderStyle: 'dashed',
            }}
          />
          <Text variant="caption" tone="muted">
            Rotation suggests a fresh site
          </Text>
        </View>
      ) : null}
    </View>
  );
}
