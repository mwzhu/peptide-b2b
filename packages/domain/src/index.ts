/**
 * Beacon shared domain types.
 *
 * Mirrors the entities in TECHNICAL_ARCHITECTURE.md §6.3. Used by the mock-data
 * package and both client apps. All IDs are plain strings; all timestamps are
 * ISO-8601 strings.
 */

export type Id = string;
/** ISO-8601 date-time string. */
export type ISODateTime = string;
/** ISO-8601 calendar date (YYYY-MM-DD). */
export type ISODate = string;

/* ------------------------------------------------------------------ */
/* Units & measures                                                    */
/* ------------------------------------------------------------------ */

export type MassUnit = 'mg' | 'mcg' | 'iu';
export type VolumeUnit = 'ml';
export type Route = 'subcutaneous' | 'intramuscular' | 'oral' | 'nasal' | 'topical';
export type SyringeType = 'u100' | 'u50' | 'u40';

/** A dose amount with its source unit, as a provider entered it. */
export interface DoseAmount {
  value: number;
  unit: MassUnit;
}

/* ------------------------------------------------------------------ */
/* Clinic, staff, patients                                             */
/* ------------------------------------------------------------------ */

export interface Clinic {
  id: Id;
  name: string;
  tagline: string;
  locations: ClinicLocation[];
  brandColor: string;
}

export interface ClinicLocation {
  id: Id;
  clinicId: Id;
  name: string;
  city: string;
  state: string;
}

export type StaffRole =
  | 'clinic_owner'
  | 'clinic_admin'
  | 'provider'
  | 'rn'
  | 'medical_assistant'
  | 'health_coach'
  | 'billing_staff'
  | 'inventory_manager';

export interface StaffMember {
  id: Id;
  clinicId: Id;
  name: string;
  role: StaffRole;
  credential: string;
  title: string;
  email: string;
  avatarHue: number;
  licensedStates: string[];
  active: boolean;
}

export type PatientStatus = 'active' | 'paused' | 'lapsed' | 'onboarding' | 'needs_attention';

export type PatientGoal =
  | 'weight_loss'
  | 'recovery'
  | 'sleep'
  | 'libido'
  | 'performance'
  | 'skin'
  | 'inflammation'
  | 'longevity';

export interface Patient {
  id: Id;
  clinicId: Id;
  firstName: string;
  lastName: string;
  preferredName?: string;
  email: string;
  phone: string;
  dateOfBirth: ISODate;
  sex: 'female' | 'male' | 'other';
  status: PatientStatus;
  goals: PatientGoal[];
  allergies: string[];
  conditions: string[];
  medications: string[];
  heightCm: number;
  startWeightKg: number;
  currentWeightKg: number;
  goalWeightKg?: number;
  enrolledAt: ISODate;
  locationId: Id;
  careTeamIds: Id[];
  primaryProviderId: Id;
  avatarHue: number;
  tags: string[];
  /** Adherence over the trailing 30 days, 0–1. */
  adherence30d: number;
  churnRisk: 'low' | 'medium' | 'high';
}

/* ------------------------------------------------------------------ */
/* Catalog & protocols                                                 */
/* ------------------------------------------------------------------ */

export type PeptideCategory =
  | 'weight_loss'
  | 'recovery'
  | 'aesthetics'
  | 'longevity'
  | 'muscle'
  | 'cognitive';

export interface PeptideProduct {
  id: Id;
  clinicId: Id;
  name: string;
  shortName: string;
  category: PeptideCategory;
  route: Route;
  /** Lyophilized peptide mass per vial. */
  vialAmount: DoseAmount;
  /** Default bacteriostatic-water volume to reconstitute with (mL). */
  defaultDiluentMl: number;
  /** Beyond-use days after reconstitution. */
  budDays: number;
  storage: string;
  blurb: string;
  whatToExpect: string[];
  commonSideEffects: string[];
  active: boolean;
  unitPriceUsd: number;
}

export type ProtocolStatus =
  | 'draft'
  | 'pending_provider_approval'
  | 'approved'
  | 'active'
  | 'paused'
  | 'completed'
  | 'superseded';

export type Frequency =
  | 'daily'
  | 'twice_weekly'
  | 'weekly'
  | 'every_other_day'
  | 'five_on_two_off';

/** One rung of a titration ladder. */
export interface TitrationStep {
  label: string;
  startWeek: number;
  dose: DoseAmount;
}

/** On/off cycling rule. */
export interface CycleConfig {
  enabled: boolean;
  onDays: number;
  offDays: number;
  description: string;
}

/** One peptide line within a protocol (a stack has several). */
export interface ProtocolItem {
  id: Id;
  productId: Id;
  route: Route;
  frequency: Frequency;
  /** Current prescribed dose (the active titration rung). */
  dose: DoseAmount;
  titration: TitrationStep[];
  cycle: CycleConfig;
  /** Provider-set reconstitution parameters for the patient's calculator. */
  reconstitution: {
    diluentMl: number;
    syringeType: SyringeType;
  };
  instructions: string;
  timeOfDay: string;
}

export interface ProtocolTemplate {
  id: Id;
  clinicId: Id;
  name: string;
  category: PeptideCategory;
  summary: string;
  durationWeeks: number;
  items: ProtocolItem[];
  monitoring: string[];
  requiredLabs: string[];
  redFlags: string[];
  timesAssigned: number;
}

export interface PatientProtocol {
  id: Id;
  patientId: Id;
  templateId: Id;
  name: string;
  status: ProtocolStatus;
  version: number;
  items: ProtocolItem[];
  startDate: ISODate;
  endDate: ISODate;
  durationWeeks: number;
  /** Current week elapsed since startDate. */
  currentWeek: number;
  approvedByProviderId: Id;
  approvedAt: ISODateTime;
  monitoring: string[];
  notes: string;
}

/* ------------------------------------------------------------------ */
/* Doses & schedule                                                    */
/* ------------------------------------------------------------------ */

export type InjectionSite =
  | 'abdomen_left'
  | 'abdomen_right'
  | 'thigh_left'
  | 'thigh_right'
  | 'arm_left'
  | 'arm_right'
  | 'glute_left'
  | 'glute_right';

export type DoseStatus = 'upcoming' | 'due' | 'taken' | 'missed' | 'skipped' | 'late';

/** A materialized scheduled dose. */
export interface DoseOccurrence {
  id: Id;
  patientId: Id;
  protocolId: Id;
  protocolItemId: Id;
  productId: Id;
  scheduledFor: ISODateTime;
  dose: DoseAmount;
  status: DoseStatus;
}

/** A logged administration. */
export interface DoseLog {
  id: Id;
  occurrenceId: Id;
  patientId: Id;
  productId: Id;
  vialId: Id;
  loggedAt: ISODateTime;
  takenAt: ISODateTime;
  dose: DoseAmount;
  site: InjectionSite;
  note?: string;
}

/* ------------------------------------------------------------------ */
/* Vials, reconstitution, supply                                       */
/* ------------------------------------------------------------------ */

export type VialState = 'planned' | 'active' | 'exhausted' | 'discarded' | 'replaced';

/** Immutable, server-generated calculation result the app renders. */
export interface CalculationSnapshot {
  id: Id;
  vialAmountMcg: number;
  diluentMl: number;
  prescribedDoseMcg: number;
  concentrationMcgPerMl: number;
  drawVolumeMl: number;
  syringeType: SyringeType;
  syringeUnits: number;
  /** syringeUnits rounded for display, per rounding policy. */
  displayUnits: number;
  roundingDisclosure: string;
  estimatedDosesPerVial: number;
  generatedAt: ISODateTime;
}

export interface Vial {
  id: Id;
  patientId: Id;
  productId: Id;
  protocolItemId: Id;
  state: VialState;
  reconstitutedAt?: ISODateTime;
  diluentMl: number;
  syringeType: SyringeType;
  /** Beyond-use date — discard after this. */
  budDate?: ISODate;
  dosesDrawn: number;
  estimatedTotalDoses: number;
  snapshot?: CalculationSnapshot;
}

/* ------------------------------------------------------------------ */
/* Symptoms, outcomes, labs                                            */
/* ------------------------------------------------------------------ */

export type SymptomSeverity = 'mild' | 'moderate' | 'severe';

export interface SideEffectEvent {
  id: Id;
  patientId: Id;
  type: string;
  severity: SymptomSeverity;
  note?: string;
  reportedAt: ISODateTime;
  protocolItemId?: Id;
  redFlag: boolean;
}

export type TriageStatus = 'new' | 'in_review' | 'escalated' | 'resolved';

export interface TriageCase {
  id: Id;
  patientId: Id;
  sideEffectId: Id;
  status: TriageStatus;
  severity: SymptomSeverity;
  assignedToId?: Id;
  openedAt: ISODateTime;
  slaDueAt: ISODateTime;
  summary: string;
}

export interface CheckIn {
  id: Id;
  patientId: Id;
  date: ISODate;
  energy: number;
  sleep: number;
  mood: number;
  appetite: number;
  note?: string;
}

export type MetricKind =
  | 'weight'
  | 'waist'
  | 'body_fat'
  | 'energy'
  | 'sleep'
  | 'systolic'
  | 'diastolic';

export interface MetricPoint {
  date: ISODate;
  value: number;
}

export interface OutcomeSeries {
  kind: MetricKind;
  label: string;
  unit: string;
  points: MetricPoint[];
}

export interface ProgressPhoto {
  id: Id;
  patientId: Id;
  takenOn: ISODate;
  /** Solid placeholder hue — no real images in the prototype. */
  hue: number;
  pose: 'front' | 'side' | 'back';
}

export type LabStatus = 'ordered' | 'collected' | 'resulted' | 'released';

export interface LabValue {
  name: string;
  value: number;
  unit: string;
  refLow: number;
  refHigh: number;
  flag: 'low' | 'normal' | 'high';
}

export interface LabPanel {
  id: Id;
  patientId: Id;
  name: string;
  status: LabStatus;
  orderedOn: ISODate;
  resultedOn?: ISODate;
  values: LabValue[];
  providerComment?: string;
}

export type DocumentKind = 'consent' | 'care_plan' | 'lab' | 'visit_summary' | 'instructions';

export interface ClinicDocument {
  id: Id;
  patientId: Id;
  kind: DocumentKind;
  title: string;
  createdAt: ISODateTime;
  signed: boolean;
  signedAt?: ISODateTime;
}

/* ------------------------------------------------------------------ */
/* Messaging & appointments                                            */
/* ------------------------------------------------------------------ */

export type MessageCategory = 'dose' | 'side_effect' | 'refill' | 'lab' | 'appointment' | 'general';

export interface Message {
  id: Id;
  threadId: Id;
  authorId: Id;
  authorRole: 'patient' | 'staff';
  body: string;
  sentAt: ISODateTime;
}

export interface MessageThread {
  id: Id;
  patientId: Id;
  clinicId: Id;
  subject: string;
  category: MessageCategory;
  assignedToId?: Id;
  unread: boolean;
  urgent: boolean;
  lastMessageAt: ISODateTime;
  messages: Message[];
}

export type AppointmentType = 'follow_up' | 'initial_consult' | 'lab_review' | 'check_in';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: Id;
  patientId: Id;
  providerId: Id;
  type: AppointmentType;
  status: AppointmentStatus;
  startsAt: ISODateTime;
  durationMin: number;
  /** External telehealth link — scheduling-only in MVP. */
  telehealthUrl?: string;
  preVisitComplete: boolean;
}

/* ------------------------------------------------------------------ */
/* Refills, orders, inventory                                          */
/* ------------------------------------------------------------------ */

export type RefillStatus =
  | 'requested'
  | 'under_review'
  | 'approved'
  | 'awaiting_payment'
  | 'sent_to_pharmacy'
  | 'shipped'
  | 'delivered'
  | 'denied';

export interface EligibilityCheck {
  rule: string;
  label: string;
  passed: boolean;
  blocking: boolean;
  detail: string;
}

export interface RefillRequest {
  id: Id;
  patientId: Id;
  productId: Id;
  protocolId: Id;
  status: RefillStatus;
  requestedAt: ISODateTime;
  eligibility: EligibilityCheck[];
  eligible: boolean;
  fulfillment?: FulfillmentMethod;
  trackingNumber?: string;
}

export type FulfillmentMethod = 'in_house' | 'pharmacy';

export type OrderStatus =
  | 'draft'
  | 'pending_clinical_approval'
  | 'approved'
  | 'awaiting_payment'
  | 'paid'
  | 'ready_for_fulfillment'
  | 'fulfilled'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: Id;
  patientId: Id;
  refillId?: Id;
  status: OrderStatus;
  fulfillment: FulfillmentMethod;
  createdAt: ISODateTime;
  items: { productId: Id; quantity: number; unitPriceUsd: number }[];
  totalUsd: number;
  lotId?: Id;
}

export type LotStatus = 'in_stock' | 'low' | 'expiring' | 'recalled' | 'depleted';

export interface InventoryLot {
  id: Id;
  clinicId: Id;
  locationId: Id;
  productId: Id;
  lotNumber: string;
  expiresOn: ISODate;
  quantityOnHand: number;
  quantityReserved: number;
  reorderThreshold: number;
  status: LotStatus;
  supplier: string;
}

export interface DispenseRecord {
  id: Id;
  lotId: Id;
  patientId: Id;
  orderId: Id;
  quantity: number;
  dispensedAt: ISODateTime;
  dispensedById: Id;
}

/* ------------------------------------------------------------------ */
/* Commerce                                                            */
/* ------------------------------------------------------------------ */

export type SubscriptionStatus = 'active' | 'past_due' | 'paused' | 'cancelled';

export interface Subscription {
  id: Id;
  patientId: Id;
  planName: string;
  status: SubscriptionStatus;
  amountUsd: number;
  interval: 'monthly' | 'quarterly';
  nextBillingOn: ISODate;
}

export interface Invoice {
  id: Id;
  patientId: Id;
  amountUsd: number;
  status: 'paid' | 'open' | 'void';
  issuedOn: ISODate;
  description: string;
}

/* ------------------------------------------------------------------ */
/* Education, notifications, analytics, audit                          */
/* ------------------------------------------------------------------ */

export interface EducationArticle {
  id: Id;
  title: string;
  category: 'reconstitution' | 'injection' | 'storage' | 'protocol' | 'lifestyle';
  readMinutes: number;
  excerpt: string;
  body: string[];
  hue: number;
}

export interface AppNotification {
  id: Id;
  patientId: Id;
  kind: 'dose' | 'bud' | 'refill' | 'message' | 'appointment' | 'lab';
  title: string;
  body: string;
  createdAt: ISODateTime;
  read: boolean;
}

export interface AuditEvent {
  id: Id;
  clinicId: Id;
  actorName: string;
  actorRole: StaffRole | 'patient';
  action: string;
  resourceType: string;
  resourceLabel: string;
  at: ISODateTime;
}

export interface AnalyticsSnapshot {
  activePatients: number;
  newStarts30d: number;
  avgAdherence: number;
  refillConversion: number;
  mrrUsd: number;
  avgResponseMinutes: number;
  adherenceTrend: MetricPoint[];
  revenueTrend: MetricPoint[];
  protocolPopularity: { name: string; count: number }[];
  sideEffectFrequency: { type: string; count: number }[];
}
