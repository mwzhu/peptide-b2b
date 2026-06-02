/**
 * Tailwind-shaped view of the design tokens. Both apps spread `tailwindExtend`
 * into their `theme.extend` so the patient app (NativeWind) and provider app
 * (Tailwind) render from one source of truth.
 */
import { fontFamily, fontSize, radius, shadow, tailwindColors } from './tokens';

const px = (n: number) => `${n}px`;

const fontSizeEntries = Object.fromEntries(
  Object.entries(fontSize).map(([key, [size, line]]) => [
    key,
    [px(size), { lineHeight: px(line) }] as [string, { lineHeight: string }],
  ]),
);

const radiusEntries = Object.fromEntries(
  Object.entries(radius).map(([key, value]) => [
    key,
    typeof value === 'number' ? px(value) : String(value),
  ]),
);

export const tailwindExtend = {
  colors: tailwindColors,
  fontFamily: {
    display: [fontFamily.display, 'Georgia', 'serif'],
    sans: [fontFamily.sans, 'system-ui', 'sans-serif'],
  },
  fontSize: fontSizeEntries,
  borderRadius: radiusEntries,
  boxShadow: {
    xs: shadow.xs,
    sm: shadow.sm,
    md: shadow.md,
    lg: shadow.lg,
    xl: shadow.xl,
  },
};
