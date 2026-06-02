import { describe, it, expect } from 'vitest';
import { computeBUD, daysUntil, projectSupply } from './supply';

describe('computeBUD', () => {
  it('adds the BUD window to the reconstitution date', () => {
    expect(computeBUD('2026-05-01', 28)).toBe('2026-05-29');
  });
});

describe('daysUntil', () => {
  it('is zero for today', () => {
    const today = new Date();
    expect(daysUntil(today.toISOString(), today)).toBe(0);
  });

  it('is positive for a future date', () => {
    const from = new Date('2026-05-01T00:00:00Z');
    expect(daysUntil('2026-05-10', from)).toBe(9);
  });

  it('is negative for a past date', () => {
    const from = new Date('2026-05-10T00:00:00Z');
    expect(daysUntil('2026-05-01', from)).toBe(-9);
  });
});

describe('projectSupply', () => {
  it('counts remaining doses and finds the run-out date', () => {
    const upcoming = [
      '2026-05-20T09:00:00Z',
      '2026-05-27T09:00:00Z',
      '2026-06-03T09:00:00Z',
      '2026-06-10T09:00:00Z',
    ];
    const p = projectSupply({
      estimatedTotalDoses: 4,
      dosesDrawn: 1,
      upcomingDoseDates: upcoming,
      refillLeadDays: 7,
    });
    expect(p.dosesRemaining).toBe(3);
    expect(p.runOutDate).toBe('2026-06-03');
    expect(p.refillWarningDate).toBe('2026-05-27');
  });

  it('reports a depleted vial as refill-due', () => {
    const p = projectSupply({
      estimatedTotalDoses: 10,
      dosesDrawn: 10,
      upcomingDoseDates: [],
    });
    expect(p.dosesRemaining).toBe(0);
    expect(p.refillDue).toBe(true);
  });
});
