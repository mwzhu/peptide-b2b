/**
 * Supply projection and beyond-use-date math.
 *
 * Pure, no-I/O. Connects a reconstituted vial to its run-out date and the
 * refill-warning window. See TECHNICAL_ARCHITECTURE.md §7.5.
 */
import type { ISODate, ISODateTime } from '@beacon/domain';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfUtcDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Whole days from `from` until `date` (negative if `date` is in the past). */
export function daysUntil(date: ISODate | ISODateTime, from: Date = new Date()): number {
  const target = startOfUtcDay(new Date(date));
  const start = startOfUtcDay(from);
  return Math.round((target - start) / MS_PER_DAY);
}

/** Beyond-use date: reconstitution date + the product's BUD window. */
export function computeBUD(reconstitutedAt: ISODate | ISODateTime, budDays: number): ISODate {
  const d = new Date(reconstitutedAt);
  d.setDate(d.getDate() + budDays);
  return d.toISOString().slice(0, 10);
}

export interface SupplyInput {
  estimatedTotalDoses: number;
  dosesDrawn: number;
  /** Upcoming scheduled dose datetimes, ascending. */
  upcomingDoseDates: ISODateTime[];
  /** Lead time before run-out to surface a refill reminder. */
  refillLeadDays?: number;
}

export interface SupplyProjection {
  dosesRemaining: number;
  /** Date the supply is exhausted, if it runs out within the known horizon. */
  runOutDate?: ISODate;
  /** Date a refill reminder should fire. */
  refillWarningDate?: ISODate;
  /** True once the supply is at or past the refill-warning threshold. */
  refillDue: boolean;
}

/**
 * Project remaining doses against the upcoming schedule to find the run-out
 * and refill-warning dates.
 */
export function projectSupply(input: SupplyInput): SupplyProjection {
  const leadDays = input.refillLeadDays ?? 7;
  const dosesRemaining = Math.max(0, input.estimatedTotalDoses - input.dosesDrawn);

  if (dosesRemaining === 0) {
    const today = new Date().toISOString().slice(0, 10);
    return { dosesRemaining: 0, runOutDate: today, refillWarningDate: today, refillDue: true };
  }

  const runOutOccurrence = input.upcomingDoseDates[dosesRemaining - 1];
  if (!runOutOccurrence) {
    return { dosesRemaining, refillDue: false };
  }

  const runOut = new Date(runOutOccurrence);
  const runOutDate = runOut.toISOString().slice(0, 10);
  const warning = new Date(runOut);
  warning.setDate(warning.getDate() - leadDays);
  const refillWarningDate = warning.toISOString().slice(0, 10);

  return {
    dosesRemaining,
    runOutDate,
    refillWarningDate,
    refillDue: daysUntil(refillWarningDate) <= 0,
  };
}
