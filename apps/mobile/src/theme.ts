/** Re-exports the shared design tokens plus mobile-only helpers. */
import { color, fontSize as fs } from '@beacon/theme';

export * from '@beacon/theme';

/** Font families — must match the names registered in `app/_layout.tsx`. */
export const font = {
  display: 'Fraunces',
  displaySemibold: 'FrauncesSemibold',
  body: 'Inter',
  bodyMedium: 'InterMedium',
  bodySemibold: 'InterSemibold',
  bodyBold: 'InterBold',
} as const;

export type TypeVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'body'
  | 'bodySm'
  | 'caption'
  | 'overline';

interface VariantSpec {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
}

/** Resolved typographic specs for the `<Text>` primitive. */
export const typeScale: Record<TypeVariant, VariantSpec> = {
  display: { fontFamily: font.displaySemibold, fontSize: fs.display[0], lineHeight: fs.display[1], letterSpacing: -0.5 },
  h1: { fontFamily: font.displaySemibold, fontSize: fs.h1[0], lineHeight: fs.h1[1], letterSpacing: -0.4 },
  h2: { fontFamily: font.displaySemibold, fontSize: fs.h2[0], lineHeight: fs.h2[1], letterSpacing: -0.3 },
  h3: { fontFamily: font.displaySemibold, fontSize: fs.h3[0], lineHeight: fs.h3[1] },
  title: { fontFamily: font.bodySemibold, fontSize: fs.title[0], lineHeight: fs.title[1] },
  body: { fontFamily: font.body, fontSize: fs.body[0], lineHeight: fs.body[1] },
  bodySm: { fontFamily: font.body, fontSize: fs.bodySm[0], lineHeight: fs.bodySm[1] },
  caption: { fontFamily: font.bodyMedium, fontSize: fs.caption[0], lineHeight: fs.caption[1] },
  overline: { fontFamily: font.bodySemibold, fontSize: fs.overline[0], lineHeight: fs.overline[1], letterSpacing: 1.1 },
};

export { color };
