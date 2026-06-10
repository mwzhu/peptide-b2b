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

/** Uploaded file metadata. The prototype stores no bytes — name and size only. */
export interface FileAttachment {
  fileName: string;
  sizeKb?: number;
}

export interface LabPanel {
  id: Id;
  patientId: Id;
  name: string;
  status: LabStatus;
  /** Who supplied the results — clinic-ordered draw vs. patient upload. */
  source?: 'clinic' | 'patient';
  orderedOn: ISODate;
  resultedOn?: ISODate;
  values: LabValue[];
  providerComment?: string;
  attachment?: FileAttachment;
}

export type DocumentKind =
  | 'consent'
  | 'care_plan'
  | 'lab'
  | 'prescription'
  | 'visit_summary'
  | 'instructions'
  | 'other';

export interface ClinicDocument {
  id: Id;
  patientId: Id;
  kind: DocumentKind;
  title: string;
  createdAt: ISODateTime;
  source?: 'clinic' | 'patient';
  /** Only clinic-issued forms (consents, care plans) collect a signature. */
  requiresSignature?: boolean;
  signed: boolean;
  signedAt?: ISODateTime;
  attachment?: FileAttachment;
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

/* ------------------------------------------------------------------ */
/* Peptide library & interactions                                      */
/* ------------------------------------------------------------------ */

/**
 * How two peptides relate when stacked. Ordered worst→best for sorting:
 * `incompatible` is a hard avoid, `neutral`/`compatible` are fine to combine,
 * `complementary` actively reinforce each other.
 */
export type InteractionCompatibility =
  | 'incompatible'
  | 'neutral'
  | 'compatible'
  | 'complementary';

/** One directed interaction note from the reference library. */
export interface PeptideInteraction {
  /** Display name of the other peptide. */
  withName: string;
  /** Catalog product id of the other peptide, when it maps to one we carry. */
  withProductId?: Id;
  compatibility: InteractionCompatibility;
  description: string;
}

/**
 * Six normalized 0–100 affinities a peptide has for each broad goal area.
 * Sourced from the reference library; the generator ranks candidates with these.
 */
export interface PurposeWeights {
  brain_mood: number;
  health_wellness: number;
  beauty_antiaging: number;
  weight_metabolic: number;
  performance_muscle: number;
  recovery_longevity: number;
}

/** A reference-library record layered on top of a catalog {@link PeptideProduct}. */
export interface PeptideLibraryEntry {
  productId: Id;
  name: string;
  /** Free-text guidance on when/how to time the dose (fasted, pre-bed, etc.). */
  timingGuidance: string;
  /** Elimination half-life in hours; drives stack-spacing hints. null if unknown. */
  halfLifeHours: number | null;
  purposeTags: string[];
  purposeWeights: PurposeWeights;
  interactions: PeptideInteraction[];
}

/* ------------------------------------------------------------------ */
/* AI protocol generator                                               */
/* ------------------------------------------------------------------ */

/** The goal areas a provider can target in the generator intake. */
export type ProtocolGoal =
  | 'weight_loss'
  | 'recovery'
  | 'sleep'
  | 'libido'
  | 'performance'
  | 'skin'
  | 'inflammation'
  | 'longevity'
  | 'cognitive'
  | 'immune';

/**
 * Everything the provider feeds the generator. Patient clinical context
 * (medications, supplements, conditions, allergies) drives the safety screen.
 */
export interface GenerationInput {
  patientId?: Id;
  goals: ProtocolGoal[];
  /** Free-text symptoms / needs, e.g. "wants to lose weight and sleep better". */
  symptoms: string;
  medications: string[];
  supplements: string[];
  conditions: string[];
  allergies: string[];
  /** Provider knobs that shape the output. */
  preferences: {
    /** Cap the number of peptides in the stack. */
    maxStackSize: number;
    /** Bias toward fewer needles / simpler routines. */
    injectionAverse: boolean;
    /** Only include well-studied peptides. */
    conservativeOnly: boolean;
  };
}

export type SafetySeverity = 'info' | 'caution' | 'warning';

/** A screen hit from a patient's meds/conditions against a proposed peptide. */
export interface SafetyFlag {
  severity: SafetySeverity;
  /** Short headline, e.g. "Overlaps with semaglutide". */
  title: string;
  detail: string;
  /** Which input tripped it (a medication, condition, allergy…). */
  source: string;
  /** Catalog product id this flag concerns, if peptide-specific. */
  productId?: Id;
}

/** One peptide line the generator proposes, with its reasoning. */
export interface GeneratedStackItem {
  productId: Id;
  name: string;
  /** 0–100 fit score for this patient's goals. */
  matchScore: number;
  /** Goal(s) this item primarily addresses. */
  addresses: ProtocolGoal[];
  /** Plain-language reason this peptide was chosen. */
  rationale: string;
  dose: DoseAmount;
  frequency: Frequency;
  route: Route;
  /** When in the day to dose, e.g. "Before bed". */
  timeOfDay: string;
  timingGuidance: string;
  titration: TitrationStep[];
  /** Other catalog peptides that could swap in for this slot. */
  alternatives: { productId: Id; name: string; reason: string }[];
}

/** A pairwise relationship between two items in the generated stack. */
export interface StackInteraction {
  aProductId: Id;
  bProductId: Id;
  aName: string;
  bName: string;
  compatibility: InteractionCompatibility;
  description: string;
}

/** One row of the day's dosing timeline. */
export interface ScheduleSlot {
  /** e.g. "Morning (fasted)", "Before bed". */
  label: string;
  /** Sort key, minutes from midnight. */
  minutes: number;
  items: { productId: Id; name: string; dose: DoseAmount }[];
  /** Spacing/timing note, e.g. "Separate from BPC-157 by 2+ hours". */
  note?: string;
}

/** The full generated draft the review screen renders. */
export interface GeneratedProtocol {
  id: Id;
  input: GenerationInput;
  name: string;
  summary: string;
  /** 0–100 overall confidence the generator reports. */
  confidence: number;
  durationWeeks: number;
  items: GeneratedStackItem[];
  interactions: StackInteraction[];
  schedule: ScheduleSlot[];
  safetyFlags: SafetyFlag[];
  monitoring: string[];
  suggestedLabs: string[];
  /** Items the generator considered but excluded, with why. */
  excluded: { name: string; reason: string }[];
  generatedAt: ISODateTime;
}
