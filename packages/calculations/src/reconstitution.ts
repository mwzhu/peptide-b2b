/**
 * Reconstitution engine — Beacon's most important correctness boundary.
 *
 * Pure, no-I/O. Given a vial of lyophilized peptide, the diluent volume, the
 * prescribed dose, and a syringe type, it returns exactly how far to draw the
 * plunger. See TECHNICAL_ARCHITECTURE.md §7.1.
 */
import Decimal from 'decimal.js';
import type { DoseAmount, SyringeType } from '@beacon/domain';
import { syringeCapacityMl, syringeUnitsPerMl, toMcg } from './units';

export type RoundingPolicy = 'nearest_whole_unit' | 'nearest_half_unit' | 'exact';

export interface ReconstitutionInput {
  /** Lyophilized peptide mass in the vial. */
  vialAmount: DoseAmount;
  /** Bacteriostatic water added, in millilitres. */
  diluentMl: number;
  /** Dose the provider prescribed per administration. */
  prescribedDose: DoseAmount;
  syringeType: SyringeType;
  roundingPolicy?: RoundingPolicy;
}

export interface ReconstitutionResult {
  vialAmountMcg: number;
  diluentMl: number;
  prescribedDoseMcg: number;
  /** Resulting solution strength. */
  concentrationMcgPerMl: number;
  /** Exact volume to draw, in millilitres. */
  drawVolumeMl: number;
  /** Exact syringe graduations to draw. */
  syringeUnits: number;
  /** Graduations to draw after applying the rounding policy. */
  displayUnits: number;
  syringeType: SyringeType;
  roundingPolicy: RoundingPolicy;
  /** Plain-language note on any rounding applied. */
  roundingDisclosure: string;
  /** Whole doses obtainable from the vial at this dose. */
  estimatedDosesPerVial: number;
}

const DECIMALS = 4;

function roundUnits(units: Decimal, policy: RoundingPolicy): Decimal {
  switch (policy) {
    case 'nearest_whole_unit':
      return units.toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
    case 'nearest_half_unit':
      return units.times(2).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).dividedBy(2);
    case 'exact':
      return units.toDecimalPlaces(DECIMALS);
  }
}

/**
 * Compute reconstitution guidance.
 *
 * concentration = vialMcg / diluentMl
 * drawVolume    = doseMcg / concentration
 * syringeUnits  = drawVolume * unitsPerMl
 *
 * Throws on structurally invalid input (non-positive vial, diluent, or dose);
 * use {@link validateReconstitution} for user-facing, non-throwing checks.
 */
export function computeReconstitution(input: ReconstitutionInput): ReconstitutionResult {
  const policy = input.roundingPolicy ?? 'nearest_whole_unit';
  const vialMcg = toMcg(input.vialAmount);
  const doseMcg = toMcg(input.prescribedDose);
  const diluent = new Decimal(input.diluentMl);

  if (vialMcg.lte(0)) throw new Error('computeReconstitution: vial amount must be positive');
  if (diluent.lte(0)) throw new Error('computeReconstitution: diluent volume must be positive');
  if (doseMcg.lte(0)) throw new Error('computeReconstitution: prescribed dose must be positive');

  const concentration = vialMcg.dividedBy(diluent);
  const drawVolumeMl = doseMcg.dividedBy(concentration);
  const unitsPerMl = syringeUnitsPerMl(input.syringeType);
  const syringeUnits = drawVolumeMl.times(unitsPerMl);
  const displayUnits = roundUnits(syringeUnits, policy);
  const estimatedDosesPerVial = vialMcg.dividedBy(doseMcg).floor();

  const delta = displayUnits.minus(syringeUnits).abs();
  let roundingDisclosure: string;
  if (policy === 'exact' || delta.lte(new Decimal(10).pow(-DECIMALS))) {
    roundingDisclosure = `Draw to exactly ${displayUnits.toString()} units on a ${unitsPerMl}-unit syringe.`;
  } else {
    roundingDisclosure =
      `Exact draw is ${syringeUnits.toDecimalPlaces(2).toString()} units; ` +
      `rounded to ${displayUnits.toString()} units (nearest ` +
      `${policy === 'nearest_half_unit' ? 'half unit' : 'whole unit'}).`;
  }

  return {
    vialAmountMcg: vialMcg.toNumber(),
    diluentMl: diluent.toNumber(),
    prescribedDoseMcg: doseMcg.toNumber(),
    concentrationMcgPerMl: concentration.toDecimalPlaces(DECIMALS).toNumber(),
    drawVolumeMl: drawVolumeMl.toDecimalPlaces(DECIMALS).toNumber(),
    syringeUnits: syringeUnits.toDecimalPlaces(DECIMALS).toNumber(),
    displayUnits: displayUnits.toNumber(),
    syringeType: input.syringeType,
    roundingPolicy: policy,
    roundingDisclosure,
    estimatedDosesPerVial: estimatedDosesPerVial.toNumber(),
  };
}

/** Whole doses obtainable from a vial at a given dose. */
export function dosesPerVial(vialAmount: DoseAmount, prescribedDose: DoseAmount): number {
  return toMcg(vialAmount).dividedBy(toMcg(prescribedDose)).floor().toNumber();
}

export type IssueLevel = 'error' | 'warning';

export interface ValidationIssue {
  level: IssueLevel;
  code: string;
  message: string;
}

/**
 * Non-throwing validation surfacing impossible or suspicious configurations,
 * for inline display in the calculator and the provider's protocol builder.
 */
export function validateReconstitution(input: ReconstitutionInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const vialMcg = toMcg(input.vialAmount);
  const doseMcg = toMcg(input.prescribedDose);
  const diluent = new Decimal(input.diluentMl);

  if (diluent.lte(0)) {
    issues.push({
      level: 'error',
      code: 'diluent_non_positive',
      message: 'Diluent volume must be greater than zero.',
    });
  }
  if (vialMcg.lte(0)) {
    issues.push({
      level: 'error',
      code: 'vial_non_positive',
      message: 'Vial peptide amount must be greater than zero.',
    });
  }
  if (doseMcg.lte(0)) {
    issues.push({
      level: 'error',
      code: 'dose_non_positive',
      message: 'Prescribed dose must be greater than zero.',
    });
  }
  if (issues.some((i) => i.level === 'error')) return issues;

  if (doseMcg.gt(vialMcg)) {
    issues.push({
      level: 'error',
      code: 'dose_exceeds_vial',
      message: 'A single dose is larger than the whole vial — check the units.',
    });
    return issues;
  }

  const result = computeReconstitution(input);
  const capacity = syringeCapacityMl(input.syringeType);
  if (result.drawVolumeMl > capacity) {
    issues.push({
      level: 'error',
      code: 'exceeds_syringe',
      message: `Draw volume (${result.drawVolumeMl} mL) exceeds the ${capacity} mL syringe — use less diluent or a larger syringe.`,
    });
  }
  if (result.displayUnits < 2) {
    issues.push({
      level: 'warning',
      code: 'draw_very_small',
      message: 'Draw is under 2 units — small measurement errors have a large effect. Consider more diluent.',
    });
  }
  if (
    input.roundingPolicy !== 'exact' &&
    Math.abs(result.displayUnits - result.syringeUnits) > 0.5
  ) {
    issues.push({
      level: 'warning',
      code: 'rounding_drift',
      message: 'Rounded units differ noticeably from the exact draw — confirm the dose with the clinic.',
    });
  }
  return issues;
}
