/**
 * In-memory mutable store. Seeded once from the fixtures; mutations from the
 * mock API write here so the prototype behaves like a live system within a
 * session. Reloading the app resets it.
 */
import type { AnalyticsSnapshot } from '@beacon/domain';
import { clinic, educationArticles, products, protocolTemplates, staff } from './seed-clinic';
import {
  auditEvents,
  clinicalData,
  inventoryLots,
  messageThreads,
  orders,
  patients,
  refillRequests,
  subscriptions,
  triageCases,
} from './seed-patients';
import { dateFromNow, trend } from './generate';

export const db = {
  clinic,
  staff,
  products,
  protocolTemplates,
  educationArticles,
  patients,
  protocols: clinicalData.protocols,
  occurrences: clinicalData.occurrences,
  doseLogs: clinicalData.doseLogs,
  vials: clinicalData.vials,
  checkIns: clinicalData.checkIns,
  sideEffects: clinicalData.sideEffects,
  outcomes: clinicalData.outcomes,
  photos: clinicalData.photos,
  labs: clinicalData.labs,
  documents: clinicalData.documents,
  appointments: clinicalData.appointments,
  notifications: clinicalData.notifications,
  messageThreads,
  triageCases,
  refillRequests,
  orders,
  inventoryLots,
  subscriptions,
  auditEvents,
};

export type Db = typeof db;

/** The signed-in patient for the mobile app. */
export const CURRENT_PATIENT_ID = 'pt_avery';

export function computeAnalytics(): AnalyticsSnapshot {
  const active = db.patients.filter((p) => p.status === 'active' || p.status === 'needs_attention');
  const avgAdherence =
    db.patients.reduce((sum, p) => sum + p.adherence30d, 0) / db.patients.length;
  const mrr = db.subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + (s.interval === 'monthly' ? s.amountUsd : s.amountUsd / 3), 0);

  const popularity = db.protocolTemplates
    .map((t) => ({ name: t.name, count: db.protocols.filter((p) => p.templateId === t.id).length }))
    .sort((a, b) => b.count - a.count);

  const seFreq = Object.entries(
    db.sideEffects.reduce<Record<string, number>>((acc, s) => {
      acc[s.type] = (acc[s.type] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    activePatients: active.length,
    newStarts30d: db.patients.filter((p) => p.enrolledAt >= dateFromNow(-30)).length,
    avgAdherence,
    refillConversion: 0.78,
    mrrUsd: Math.round(mrr),
    avgResponseMinutes: 42,
    adherenceTrend: trend(0.79, avgAdherence, 84, 14, 0.04, 2),
    revenueTrend: trend(18400, Math.round(mrr) + 9200, 168, 28, 1400, 0),
    protocolPopularity: popularity,
    sideEffectFrequency: seFreq,
  };
}
