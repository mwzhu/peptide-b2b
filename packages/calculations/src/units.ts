/**
 * Unit conversion for clinical math.
 *
 * Peptide mass is normalized to micrograms; volume to milliliters. Conversions
 * use exact integer/decimal arithmetic — never JavaScript floating point for a
 * value that drives patient-facing dosing guidance.
 */
import Decimal from 'decimal.js';
import type { DoseAmount, SyringeType } from '@beacon/domain';

export const MCG_PER_MG = 1000;

/**
 * Normalize a provider-entered dose to micrograms.
 *
 * `iu` is intentionally unsupported here: international units convert to mass
 * only with a peptide-specific factor, so an `iu` amount must be resolved to
 * mg/mcg upstream against its product before it reaches the engine.
 */
export function toMcg(amount: DoseAmount): Decimal {
  switch (amount.unit) {
    case 'mg':
      return new Decimal(amount.value).times(MCG_PER_MG);
    case 'mcg':
      return new Decimal(amount.value);
    case 'iu':
      throw new Error('toMcg: `iu` must be converted to a mass unit before reaching the engine');
  }
}

/** Insulin-syringe graduations per millilitre. */
export function syringeUnitsPerMl(type: SyringeType): number {
  switch (type) {
    case 'u100':
      return 100;
    case 'u50':
      return 50;
    case 'u40':
      return 40;
  }
}

/** Usable capacity of an insulin syringe, in millilitres (1.0 mL barrels). */
export function syringeCapacityMl(_type: SyringeType): number {
  return 1;
}

/** Format a microgram value the way patients read it (mcg under 1 mg, else mg). */
export function formatMass(mcg: number): string {
  if (mcg >= MCG_PER_MG) {
    const mg = new Decimal(mcg).dividedBy(MCG_PER_MG);
    return `${mg.toDecimalPlaces(2).toString()} mg`;
  }
  return `${new Decimal(mcg).toDecimalPlaces(1).toString()} mcg`;
}
