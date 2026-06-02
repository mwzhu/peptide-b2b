import { describe, it, expect } from 'vitest';
import type { DoseAmount } from '@beacon/domain';
import {
  computeReconstitution,
  dosesPerVial,
  validateReconstitution,
} from './reconstitution';

const mg = (value: number): DoseAmount => ({ value, unit: 'mg' });
const mcg = (value: number): DoseAmount => ({ value, unit: 'mcg' });

describe('computeReconstitution — golden cases', () => {
  it('5 mg vial, 2 mL diluent, 250 mcg dose, U-100', () => {
    const r = computeReconstitution({
      vialAmount: mg(5),
      diluentMl: 2,
      prescribedDose: mcg(250),
      syringeType: 'u100',
    });
    expect(r.concentrationMcgPerMl).toBe(2500);
    expect(r.drawVolumeMl).toBe(0.1);
    expect(r.syringeUnits).toBe(10);
    expect(r.displayUnits).toBe(10);
    expect(r.estimatedDosesPerVial).toBe(20);
  });

  it('10 mg vial, 1 mL diluent, 0.25 mg dose rounds 2.5 -> 3 units', () => {
    const r = computeReconstitution({
      vialAmount: mg(10),
      diluentMl: 1,
      prescribedDose: mg(0.25),
      syringeType: 'u100',
    });
    expect(r.syringeUnits).toBe(2.5);
    expect(r.displayUnits).toBe(3);
    expect(r.roundingDisclosure).toContain('rounded to 3 units');
    expect(r.estimatedDosesPerVial).toBe(40);
  });

  it('exact rounding policy preserves fractional units', () => {
    const r = computeReconstitution({
      vialAmount: mg(5),
      diluentMl: 3,
      prescribedDose: mcg(250),
      syringeType: 'u100',
      roundingPolicy: 'exact',
    });
    // concentration 1666.6667 mcg/mL -> 0.15 mL -> 15 units
    expect(r.displayUnits).toBeCloseTo(15, 2);
  });

  it('half-unit policy rounds to the nearest 0.5', () => {
    const r = computeReconstitution({
      vialAmount: mg(5),
      diluentMl: 2,
      prescribedDose: mcg(160),
      syringeType: 'u100',
      roundingPolicy: 'nearest_half_unit',
    });
    // conc 2500 mcg/mL; draw 0.064 mL; 6.4 units -> 6.5
    expect(r.syringeUnits).toBe(6.4);
    expect(r.displayUnits).toBe(6.5);
  });
});

describe('computeReconstitution — properties', () => {
  it('more diluent yields more syringe units (volume scales with diluent)', () => {
    const base = { vialAmount: mg(5), prescribedDose: mcg(250), syringeType: 'u100' as const };
    const low = computeReconstitution({ ...base, diluentMl: 1 });
    const high = computeReconstitution({ ...base, diluentMl: 3 });
    expect(high.syringeUnits).toBeGreaterThan(low.syringeUnits);
  });

  it('doubling the dose doubles the draw volume', () => {
    const base = { vialAmount: mg(5), diluentMl: 2, syringeType: 'u100' as const };
    const single = computeReconstitution({ ...base, prescribedDose: mcg(250) });
    const double = computeReconstitution({ ...base, prescribedDose: mcg(500) });
    expect(double.drawVolumeMl).toBeCloseTo(single.drawVolumeMl * 2, 6);
  });

  it('syringe units equal draw volume times graduations per mL', () => {
    const r = computeReconstitution({
      vialAmount: mg(5),
      diluentMl: 2,
      prescribedDose: mcg(300),
      syringeType: 'u100',
      roundingPolicy: 'exact',
    });
    expect(r.syringeUnits).toBeCloseTo(r.drawVolumeMl * 100, 6);
  });

  it('throws on non-positive structural input', () => {
    expect(() =>
      computeReconstitution({
        vialAmount: mg(5),
        diluentMl: 0,
        prescribedDose: mcg(250),
        syringeType: 'u100',
      }),
    ).toThrow();
  });
});

describe('dosesPerVial', () => {
  it('floors partial doses', () => {
    expect(dosesPerVial(mg(5), mcg(300))).toBe(16); // 5000 / 300 = 16.66
  });
});

describe('validateReconstitution', () => {
  it('flags a non-positive diluent as an error', () => {
    const issues = validateReconstitution({
      vialAmount: mg(5),
      diluentMl: 0,
      prescribedDose: mcg(250),
      syringeType: 'u100',
    });
    expect(issues.some((i) => i.code === 'diluent_non_positive' && i.level === 'error')).toBe(true);
  });

  it('flags a dose larger than the vial', () => {
    const issues = validateReconstitution({
      vialAmount: mcg(200),
      diluentMl: 2,
      prescribedDose: mcg(500),
      syringeType: 'u100',
    });
    expect(issues.some((i) => i.code === 'dose_exceeds_vial')).toBe(true);
  });

  it('flags a draw that exceeds the syringe barrel', () => {
    const issues = validateReconstitution({
      vialAmount: mg(2),
      diluentMl: 5,
      prescribedDose: mg(1),
      syringeType: 'u100',
    });
    expect(issues.some((i) => i.code === 'exceeds_syringe')).toBe(true);
  });

  it('warns on a very small draw', () => {
    const issues = validateReconstitution({
      vialAmount: mg(10),
      diluentMl: 1,
      prescribedDose: mcg(100),
      syringeType: 'u100',
    });
    expect(issues.some((i) => i.code === 'draw_very_small' && i.level === 'warning')).toBe(true);
  });

  it('returns no issues for a clean configuration', () => {
    const issues = validateReconstitution({
      vialAmount: mg(5),
      diluentMl: 2,
      prescribedDose: mcg(250),
      syringeType: 'u100',
    });
    expect(issues).toHaveLength(0);
  });
});
