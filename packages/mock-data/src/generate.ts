/**
 * Deterministic helpers for building the mock dataset — date math, a seeded
 * PRNG (stable data across reloads), and metric-series generation.
 */
import type { ISODate, ISODateTime, MetricPoint } from '@beacon/domain';

/** Anchor "now" once at module load so the dataset is internally consistent. */
export const NOW = new Date();

export function iso(d: Date): ISODateTime {
  return d.toISOString();
}

export function isoDate(d: Date): ISODate {
  return d.toISOString().slice(0, 10);
}

export function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

export function daysFromNow(n: number, hour = 9, minute = 0): ISODateTime {
  const d = addDays(NOW, n);
  d.setHours(hour, minute, 0, 0);
  return iso(d);
}

export function dateFromNow(n: number): ISODate {
  return isoDate(addDays(NOW, n));
}

/** Mulberry32 — small, fast, seeded PRNG for reproducible fixtures. */
export function createRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = createRng(20260519);

export function rand(min: number, max: number): number {
  return min + rng() * (max - min);
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

export function round(value: number, dp = 1): number {
  const f = 10 ** dp;
  return Math.round(value * f) / f;
}

/**
 * Build a trend series from `start` to `end` over `days`, walking backward
 * from today, with light noise so charts read naturally.
 */
export function trend(
  start: number,
  end: number,
  days: number,
  step: number,
  noise: number,
  dp = 1,
): MetricPoint[] {
  const points: MetricPoint[] = [];
  const samples = Math.floor(days / step);
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const value = start + (end - start) * t + (rng() - 0.5) * noise;
    points.push({ date: dateFromNow(-days + i * step), value: round(value, dp) });
  }
  return points;
}

let counter = 1000;
/** Stable-ish unique id for generated rows. */
export function uid(prefix: string): string {
  counter += 1;
  return `${prefix}_${counter}`;
}
