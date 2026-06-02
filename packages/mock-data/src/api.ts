/**
 * Mock API. Async functions over the in-memory store with simulated network
 * latency. Shaped so the apps' TanStack Query `queryFn`s drop onto a real REST
 * client later with no call-site changes.
 */
import type {
  CheckIn,
  DoseLog,
  InjectionSite,
  Message,
  MessageCategory,
  RefillRequest,
  SideEffectEvent,
  SymptomSeverity,
  TriageStatus,
} from '@beacon/domain';
import { computeAnalytics, CURRENT_PATIENT_ID, db } from './store';

const BASE_LATENCY = 180;

function delay<T>(produce: () => T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(produce()), BASE_LATENCY + Math.random() * 220);
  });
}

function nextId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const nowIso = () => new Date().toISOString();
const byId = <T extends { id: string }>(rows: T[], id: string) => rows.find((r) => r.id === id);

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

export const api = {
  currentPatientId: CURRENT_PATIENT_ID,

  getClinic: () => delay(() => db.clinic),
  getStaff: () => delay(() => db.staff),
  getProducts: () => delay(() => db.products),
  getProduct: (id: string) => delay(() => byId(db.products, id)),
  getProtocolTemplates: () => delay(() => db.protocolTemplates),
  getEducation: () => delay(() => db.educationArticles),
  getInventory: () => delay(() => db.inventoryLots),
  getOrders: () => delay(() => db.orders),
  getTriageCases: () => delay(() => db.triageCases),
  getAuditEvents: () => delay(() => db.auditEvents),
  getSubscriptions: () => delay(() => db.subscriptions),
  getAnalytics: () => delay(() => computeAnalytics()),

  getPatients: () => delay(() => db.patients),
  getPatient: (id: string) => delay(() => byId(db.patients, id)),

  getProtocol: (patientId: string) =>
    delay(() => db.protocols.find((p) => p.patientId === patientId)),
  getOccurrences: (patientId: string) =>
    delay(() => db.occurrences.filter((o) => o.patientId === patientId)),
  getDoseLogs: (patientId: string) =>
    delay(() => db.doseLogs.filter((l) => l.patientId === patientId)),
  getVials: (patientId: string) =>
    delay(() => db.vials.filter((v) => v.patientId === patientId)),
  getCheckIns: (patientId: string) =>
    delay(() => db.checkIns.filter((c) => c.patientId === patientId)),
  getSideEffects: (patientId: string) =>
    delay(() => db.sideEffects.filter((s) => s.patientId === patientId)),
  getOutcomes: (patientId: string) => delay(() => db.outcomes[patientId] ?? []),
  getPhotos: (patientId: string) =>
    delay(() => db.photos.filter((p) => p.patientId === patientId)),
  getLabs: (patientId: string) =>
    delay(() => db.labs.filter((l) => l.patientId === patientId)),
  getDocuments: (patientId: string) =>
    delay(() => db.documents.filter((d) => d.patientId === patientId)),
  getAppointments: (patientId: string) =>
    delay(() => db.appointments.filter((a) => a.patientId === patientId)),
  getNotifications: (patientId: string) =>
    delay(() => db.notifications.filter((n) => n.patientId === patientId)),
  getThreads: (patientId?: string) =>
    delay(() =>
      patientId ? db.messageThreads.filter((t) => t.patientId === patientId) : db.messageThreads,
    ),
  getThread: (id: string) => delay(() => byId(db.messageThreads, id)),
  getRefills: (patientId?: string) =>
    delay(() =>
      patientId ? db.refillRequests.filter((r) => r.patientId === patientId) : db.refillRequests,
    ),

  /* ---------------------------------------------------------------- */
  /* Mutations                                                         */
  /* ---------------------------------------------------------------- */

  logDose: (input: { occurrenceId: string; site: InjectionSite; note?: string }) =>
    delay(() => {
      const occ = byId(db.occurrences, input.occurrenceId);
      if (!occ) throw new Error('Occurrence not found');
      occ.status = 'taken';
      const vial = db.vials.find((v) => v.protocolItemId === occ.protocolItemId);
      if (vial) vial.dosesDrawn += 1;
      const log: DoseLog = {
        id: nextId('log'),
        occurrenceId: occ.id,
        patientId: occ.patientId,
        productId: occ.productId,
        vialId: vial?.id ?? 'unknown',
        loggedAt: nowIso(),
        takenAt: nowIso(),
        dose: occ.dose,
        site: input.site,
        note: input.note,
      };
      db.doseLogs.push(log);
      return log;
    }),

  skipDose: (occurrenceId: string) =>
    delay(() => {
      const occ = byId(db.occurrences, occurrenceId);
      if (occ) occ.status = 'skipped';
      return occ;
    }),

  addCheckIn: (input: Omit<CheckIn, 'id'>) =>
    delay(() => {
      const existing = db.checkIns.find(
        (c) => c.patientId === input.patientId && c.date === input.date,
      );
      if (existing) {
        Object.assign(existing, input);
        return existing;
      }
      const checkIn: CheckIn = { id: nextId('checkin'), ...input };
      db.checkIns.push(checkIn);
      return checkIn;
    }),

  addSideEffect: (input: {
    patientId: string;
    type: string;
    severity: SymptomSeverity;
    note?: string;
    protocolItemId?: string;
  }) =>
    delay(() => {
      const event: SideEffectEvent = {
        id: nextId('se'),
        patientId: input.patientId,
        type: input.type,
        severity: input.severity,
        note: input.note,
        protocolItemId: input.protocolItemId,
        reportedAt: nowIso(),
        redFlag: input.severity === 'severe',
      };
      db.sideEffects.push(event);
      if (event.redFlag) {
        db.triageCases.unshift({
          id: nextId('triage'),
          patientId: event.patientId,
          sideEffectId: event.id,
          status: 'new',
          severity: event.severity,
          openedAt: event.reportedAt,
          slaDueAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
          summary: `${event.type} reported as ${event.severity}.`,
        });
      }
      return event;
    }),

  sendMessage: (input: { threadId: string; authorId: string; authorRole: 'patient' | 'staff'; body: string }) =>
    delay(() => {
      const thread = byId(db.messageThreads, input.threadId);
      if (!thread) throw new Error('Thread not found');
      const message: Message = {
        id: nextId('m'),
        threadId: thread.id,
        authorId: input.authorId,
        authorRole: input.authorRole,
        body: input.body,
        sentAt: nowIso(),
      };
      thread.messages.push(message);
      thread.lastMessageAt = message.sentAt;
      thread.unread = input.authorRole === 'patient';
      return message;
    }),

  startThread: (input: {
    patientId: string;
    subject: string;
    category: MessageCategory;
    body: string;
  }) =>
    delay(() => {
      const id = nextId('thread');
      const thread = {
        id,
        patientId: input.patientId,
        clinicId: db.clinic.id,
        subject: input.subject,
        category: input.category,
        unread: true,
        urgent: false,
        lastMessageAt: nowIso(),
        messages: [
          {
            id: nextId('m'),
            threadId: id,
            authorId: input.patientId,
            authorRole: 'patient' as const,
            body: input.body,
            sentAt: nowIso(),
          },
        ],
      };
      db.messageThreads.unshift(thread);
      return thread;
    }),

  requestRefill: (input: { patientId: string; productId: string; protocolId: string }) =>
    delay(() => {
      const refill: RefillRequest = {
        id: nextId('refill'),
        patientId: input.patientId,
        productId: input.productId,
        protocolId: input.protocolId,
        status: 'requested',
        requestedAt: nowIso(),
        eligible: false,
        eligibility: [
          { rule: 'supply', label: 'Supply running low', passed: true, blocking: false, detail: 'Eligible for refill' },
          { rule: 'provider', label: 'Provider approval', passed: false, blocking: true, detail: 'Awaiting provider review' },
          { rule: 'labs', label: 'Required labs current', passed: true, blocking: true, detail: 'On file' },
          { rule: 'payment', label: 'Account in good standing', passed: true, blocking: true, detail: 'No balance due' },
        ],
      };
      db.refillRequests.unshift(refill);
      return refill;
    }),

  advanceRefill: (input: { refillId: string; status: RefillRequest['status']; fulfillment?: RefillRequest['fulfillment'] }) =>
    delay(() => {
      const refill = byId(db.refillRequests, input.refillId);
      if (!refill) throw new Error('Refill not found');
      refill.status = input.status;
      if (input.fulfillment) refill.fulfillment = input.fulfillment;
      if (input.status === 'approved') {
        refill.eligible = true;
        refill.eligibility = refill.eligibility.map((e) =>
          e.rule === 'provider' ? { ...e, passed: true, detail: 'Approved' } : e,
        );
      }
      return refill;
    }),

  updateTriage: (input: { caseId: string; status: TriageStatus; assignedToId?: string }) =>
    delay(() => {
      const tc = byId(db.triageCases, input.caseId);
      if (!tc) throw new Error('Triage case not found');
      tc.status = input.status;
      if (input.assignedToId) tc.assignedToId = input.assignedToId;
      return tc;
    }),

  markNotificationRead: (id: string) =>
    delay(() => {
      const n = byId(db.notifications, id);
      if (n) n.read = true;
      return n;
    }),

  approveProtocol: (patientId: string) =>
    delay(() => {
      const protocol = db.protocols.find((p) => p.patientId === patientId);
      if (protocol) protocol.status = 'active';
      return protocol;
    }),
};

export type Api = typeof api;
