/**
 * Beacon design tokens — "Wellness & premium".
 *
 * Single source of truth for both the patient mobile app (NativeWind) and the
 * provider web app (Tailwind). Warm neutrals, soft contrast, muted sage primary,
 * a clay accent, large radii, airy spacing.
 */

/* ------------------------------------------------------------------ */
/* Color                                                              */
/* ------------------------------------------------------------------ */

export const palette = {
  /** Warm sand / cream neutral ramp — surfaces and structure. */
  sand: {
    50: '#FBF8F2',
    100: '#F5EFE3',
    200: '#EBE2CF',
    300: '#DDD0B4',
    400: '#C7B58F',
    500: '#AD9669',
    600: '#8C764E',
    700: '#6B5A3C',
    800: '#4A3E2B',
    900: '#2E2719',
  },

  /** Warm ink — text and high-contrast elements. */
  ink: {
    900: '#2B2620',
    800: '#3D372E',
    700: '#534A3D',
    600: '#6B6051',
    500: '#867A68',
    400: '#A99C86',
    300: '#C9BEA9',
  },

  /** Muted sage — primary brand color. */
  sage: {
    50: '#EFF2EB',
    100: '#DCE3D2',
    200: '#C2CEB1',
    300: '#A3B58C',
    400: '#869A6C',
    500: '#6B8052',
    600: '#54663F',
    700: '#404E31',
    800: '#2E3824',
  },

  /** Soft clay / terracotta — warm accent. */
  clay: {
    50: '#F8EBE2',
    100: '#F0D7C5',
    200: '#E3B89C',
    300: '#D49872',
    400: '#C57E54',
    500: '#A9663F',
    600: '#854F31',
  },

  /** Gentle gold — sparing highlight (streaks, premium accents). */
  gold: {
    300: '#E2C988',
    400: '#CFAC5A',
    500: '#AE8C3F',
  },

  /** Semantic hues, tuned warm so they sit inside the palette. */
  green: { 100: '#DCEBD9', 400: '#5C9159', 500: '#477544', 700: '#2F4F2E' },
  amber: { 100: '#F6E6C8', 400: '#CC9436', 500: '#A97723', 700: '#6F4E16' },
  red: { 100: '#F1D8D2', 400: '#C25849', 500: '#A2483B', 700: '#6C2F26' },
  blue: { 100: '#D8E3E8', 400: '#5A8196', 500: '#476778', 700: '#2E4854' },

  white: '#FFFFFF',
  black: '#000000',
} as const;

/**
 * Semantic color roles. Components reference these, never raw palette steps,
 * so the look can be retuned in one place.
 */
export const color = {
  /** App background — the warm canvas everything sits on. */
  canvas: palette.sand[100],
  /** Raised surfaces — cards, sheets, inputs. */
  surface: '#FFFDF8',
  /** Recessed surfaces — wells, table headers, secondary panels. */
  surfaceSunken: palette.sand[200],
  /** Hairline borders and dividers. */
  border: palette.sand[300],
  borderStrong: palette.sand[400],

  /** Text. */
  textPrimary: palette.ink[900],
  textSecondary: palette.ink[600],
  textMuted: palette.ink[500],
  textInverse: palette.sand[50],

  /** Primary brand. */
  primary: palette.sage[500],
  primaryHover: palette.sage[600],
  primarySoft: palette.sage[100],
  onPrimary: '#FBFCF8',

  /** Accent. */
  accent: palette.clay[400],
  accentSoft: palette.clay[100],
  onAccent: '#FFFBF7',

  /** Highlight. */
  highlight: palette.gold[400],

  /** Status. */
  success: palette.green[500],
  successSoft: palette.green[100],
  warning: palette.amber[500],
  warningSoft: palette.amber[100],
  danger: palette.red[500],
  dangerSoft: palette.red[100],
  info: palette.blue[500],
  infoSoft: palette.blue[100],

  /** Focus ring. */
  focus: palette.sage[400],
} as const;

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

export const fontFamily = {
  /** Fraunces — warm serif, used for display & headings. */
  display: 'Fraunces',
  /** Inter — humanist sans, used for body & UI. */
  sans: 'Inter',
} as const;

/** Type scale — [fontSize, lineHeight] in px. */
export const fontSize = {
  display: [40, 46],
  h1: [32, 38],
  h2: [25, 32],
  h3: [20, 27],
  title: [17, 24],
  body: [15, 23],
  bodySm: [13, 20],
  caption: [12, 16],
  overline: [11, 14],
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const letterSpacing = {
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  overline: 1.1,
} as const;

/* ------------------------------------------------------------------ */
/* Spacing, radius, shadow                                             */
/* ------------------------------------------------------------------ */

/** 4px base spacing scale. */
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 64,
  11: 80,
  12: 96,
} as const;

/** Generous radii for the soft, boutique feel. */
export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  '2xl': 28,
  '3xl': 36,
  full: 9999,
} as const;

/** Soft, warm-tinted elevation. */
export const shadow = {
  xs: '0 1px 2px rgba(58, 47, 28, 0.06)',
  sm: '0 2px 8px rgba(58, 47, 28, 0.07)',
  md: '0 6px 20px rgba(58, 47, 28, 0.09)',
  lg: '0 14px 38px rgba(58, 47, 28, 0.12)',
  xl: '0 26px 64px rgba(58, 47, 28, 0.16)',
} as const;

/** React Native shadow descriptors (iOS) — parallels `shadow`. */
export const nativeShadow = {
  sm: {
    shadowColor: '#3A2F1C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#3A2F1C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  lg: {
    shadowColor: '#3A2F1C',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
  },
} as const;

export const duration = {
  fast: 150,
  base: 240,
  slow: 380,
} as const;

/* ------------------------------------------------------------------ */
/* Flattened maps for Tailwind / NativeWind config consumption         */
/* ------------------------------------------------------------------ */

/** Flat color map keyed for `tailwind.config` `theme.extend.colors`. */
export const tailwindColors = {
  canvas: color.canvas,
  surface: color.surface,
  'surface-sunken': color.surfaceSunken,
  border: color.border,
  'border-strong': color.borderStrong,
  ink: {
    DEFAULT: color.textPrimary,
    secondary: color.textSecondary,
    muted: color.textMuted,
    inverse: color.textInverse,
  },
  primary: {
    DEFAULT: color.primary,
    hover: color.primaryHover,
    soft: color.primarySoft,
    on: color.onPrimary,
  },
  accent: {
    DEFAULT: color.accent,
    soft: color.accentSoft,
    on: color.onAccent,
  },
  highlight: color.highlight,
  success: { DEFAULT: color.success, soft: color.successSoft },
  warning: { DEFAULT: color.warning, soft: color.warningSoft },
  danger: { DEFAULT: color.danger, soft: color.dangerSoft },
  info: { DEFAULT: color.info, soft: color.infoSoft },
  sand: palette.sand,
  sage: palette.sage,
  clay: palette.clay,
} as const;

export const theme = {
  palette,
  color,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  spacing,
  radius,
  shadow,
  nativeShadow,
  duration,
} as const;

export type Theme = typeof theme;
