/** Patients and their full clinical records, plus clinic-wide aggregates. */
import { computeReconstitution } from '@beacon/calculations';
import type {
  Appointment,
  AppNotification,
  AuditEvent,
  CheckIn,
  ClinicDocument,
  DoseLog,
  DoseOccurrence,
  InjectionSite,
  InventoryLot,
  LabPanel,
  MessageThread,
  Order,
  OutcomeSeries,
  Patient,
  PatientProtocol,
  ProgressPhoto,
  RefillRequest,
  SideEffectEvent,
  Subscription,
  TriageCase,
  Vial,
} from '@beacon/domain';
import { products, protocolTemplates } from './seed-clinic';
import { daysFromNow, dateFromNow, iso, isoDate, NOW, pick, round, trend, uid } from './generate';

const SITES: InjectionSite[] = [
  'abdomen_left',
  'abdomen_right',
  'thigh_left',
  'thigh_right',
  'arm_left',
  'arm_right',
];

interface PatientPlan {
  base: Patient;
  templateId: string;
  /** Week of the protocol the patient is currently in. */
  currentWeek: number;
}

/* Patient roster. patient[0] is the signed-in patient in the mobile app. */
const plans: PatientPlan[] = [
  {
    templateId: 'tmpl_metabolic_reset',
    currentWeek: 6,
    base: {
      id: 'pt_avery',
      clinicId: 'clinic_solstice',
      firstName: 'Avery',
      lastName: 'Chen',
      preferredName: 'Avery',
      email: 'avery.chen@example.com',
      phone: '(480) 555-0142',
      dateOfBirth: '1989-03-14',
      sex: 'female',
      status: 'active',
      goals: ['weight_loss', 'performance'],
      allergies: ['Sulfa drugs'],
      conditions: ['Prediabetes'],
      medications: ['Vitamin D 2000 IU'],
      heightCm: 165,
      startWeightKg: 84.5,
      currentWeightKg: 78.9,
      goalWeightKg: 70,
      enrolledAt: dateFromNow(-44),
      locationId: 'loc_scottsdale',
      careTeamIds: ['staff_reyes', 'staff_lindqvist'],
      primaryProviderId: 'staff_reyes',
      avatarHue: 158,
      tags: ['GLP-1', 'Membership'],
      adherence30d: 0.93,
      churnRisk: 'low',
    },
  },
  {
    templateId: 'tmpl_recovery_stack',
    currentWeek: 3,
    base: {
      id: 'pt_marcus',
      clinicId: 'clinic_solstice',
      firstName: 'Marcus',
      lastName: 'Donnelly',
      email: 'marcus.d@example.com',
      phone: '(512) 555-0188',
      dateOfBirth: '1981-11-02',
      sex: 'male',
      status: 'active',
      goals: ['recovery', 'performance'],
      allergies: [],
      conditions: ['Rotator cuff strain'],
      medications: [],
      heightCm: 183,
      startWeightKg: 88,
      currentWeightKg: 87.2,
      enrolledAt: dateFromNow(-26),
      locationId: 'loc_austin',
      careTeamIds: ['staff_okafor'],
      primaryProviderId: 'staff_okafor',
      avatarHue: 24,
      tags: ['Recovery', 'Athlete'],
      adherence30d: 0.71,
      churnRisk: 'medium',
    },
  },
  {
    templateId: 'tmpl_sleep_restore',
    currentWeek: 8,
    base: {
      id: 'pt_lena',
      clinicId: 'clinic_solstice',
      firstName: 'Lena',
      lastName: 'Pereira',
      email: 'lena.p@example.com',
      phone: '(480) 555-0210',
      dateOfBirth: '1975-06-21',
      sex: 'female',
      status: 'active',
      goals: ['sleep', 'longevity'],
      allergies: ['Penicillin'],
      conditions: ['Insomnia'],
      medications: ['Magnesium glycinate'],
      heightCm: 170,
      startWeightKg: 68,
      currentWeightKg: 67.4,
      enrolledAt: dateFromNow(-62),
      locationId: 'loc_scottsdale',
      careTeamIds: ['staff_reyes', 'staff_lindqvist'],
      primaryProviderId: 'staff_reyes',
      avatarHue: 288,
      tags: ['Sleep', 'Membership'],
      adherence30d: 0.88,
      churnRisk: 'low',
    },
  },
  {
    templateId: 'tmpl_tirzepatide_program',
    currentWeek: 11,
    base: {
      id: 'pt_jordan',
      clinicId: 'clinic_solstice',
      firstName: 'Jordan',
      lastName: 'Whitfield',
      email: 'jordan.w@example.com',
      phone: '(512) 555-0177',
      dateOfBirth: '1992-09-30',
      sex: 'male',
      status: 'needs_attention',
      goals: ['weight_loss'],
      allergies: [],
      conditions: ['Hypertension'],
      medications: ['Lisinopril 10mg'],
      heightCm: 178,
      startWeightKg: 102,
      currentWeightKg: 91.3,
      goalWeightKg: 82,
      enrolledAt: dateFromNow(-82),
      locationId: 'loc_austin',
      careTeamIds: ['staff_okafor'],
      primaryProviderId: 'staff_okafor',
      avatarHue: 210,
      tags: ['GLP-1'],
      adherence30d: 0.62,
      churnRisk: 'high',
    },
  },
  {
    templateId: 'tmpl_longevity',
    currentWeek: 4,
    base: {
      id: 'pt_sofia',
      clinicId: 'clinic_solstice',
      firstName: 'Sofia',
      lastName: 'Ramirez',
      email: 'sofia.r@example.com',
      phone: '(480) 555-0299',
      dateOfBirth: '1968-12-05',
      sex: 'female',
      status: 'active',
      goals: ['longevity', 'performance'],
      allergies: [],
      conditions: [],
      medications: ['Atorvastatin 10mg'],
      heightCm: 162,
      startWeightKg: 61,
      currentWeightKg: 61.2,
      enrolledAt: dateFromNow(-30),
      locationId: 'loc_scottsdale',
      careTeamIds: ['staff_reyes'],
      primaryProviderId: 'staff_reyes',
      avatarHue: 95,
      tags: ['Longevity', 'Membership'],
      adherence30d: 0.97,
      churnRisk: 'low',
    },
  },
  {
    templateId: 'tmpl_metabolic_reset',
    currentWeek: 13,
    base: {
      id: 'pt_priya',
      clinicId: 'clinic_solstice',
      firstName: 'Priya',
      lastName: 'Anand',
      email: 'priya.a@example.com',
      phone: '(512) 555-0312',
      dateOfBirth: '1985-04-18',
      sex: 'female',
      status: 'active',
      goals: ['weight_loss', 'skin'],
      allergies: ['Latex'],
      conditions: [],
      medications: [],
      heightCm: 158,
      startWeightKg: 74,
      currentWeightKg: 65.1,
      goalWeightKg: 62,
      enrolledAt: dateFromNow(-96),
      locationId: 'loc_austin',
      careTeamIds: ['staff_okafor', 'staff_lindqvist'],
      primaryProviderId: 'staff_okafor',
      avatarHue: 338,
      tags: ['GLP-1', 'Membership'],
      adherence30d: 0.95,
      churnRisk: 'low',
    },
  },
  {
    templateId: 'tmpl_recovery_stack',
    currentWeek: 1,
    base: {
      id: 'pt_noah',
      clinicId: 'clinic_solstice',
      firstName: 'Noah',
      lastName: 'Berg',
      email: 'noah.b@example.com',
      phone: '(480) 555-0344',
      dateOfBirth: '1996-01-27',
      sex: 'male',
      status: 'onboarding',
      goals: ['recovery'],
      allergies: [],
      conditions: ['ACL reconstruction (2025)'],
      medications: [],
      heightCm: 188,
      startWeightKg: 95,
      currentWeightKg: 95,
      enrolledAt: dateFromNow(-3),
      locationId: 'loc_scottsdale',
      careTeamIds: ['staff_reyes'],
      primaryProviderId: 'staff_reyes',
      avatarHue: 48,
      tags: ['Recovery', 'New'],
      adherence30d: 0,
      churnRisk: 'low',
    },
  },
  {
    templateId: 'tmpl_sleep_restore',
    currentWeek: 12,
    base: {
      id: 'pt_grace',
      clinicId: 'clinic_solstice',
      firstName: 'Grace',
      lastName: 'Okonkwo',
      email: 'grace.o@example.com',
      phone: '(512) 555-0410',
      dateOfBirth: '1979-08-09',
      sex: 'female',
      status: 'lapsed',
      goals: ['sleep'],
      allergies: [],
      conditions: [],
      medications: [],
      heightCm: 167,
      startWeightKg: 71,
      currentWeightKg: 70,
      enrolledAt: dateFromNow(-140),
      locationId: 'loc_austin',
      careTeamIds: ['staff_okafor'],
      primaryProviderId: 'staff_okafor',
      avatarHue: 268,
      tags: ['Sleep'],
      adherence30d: 0.34,
      churnRisk: 'high',
    },
  },
  {
    templateId: 'tmpl_metabolic_reset',
    currentWeek: 2,
    base: {
      id: 'pt_eli',
      clinicId: 'clinic_solstice',
      firstName: 'Eli',
      lastName: 'Foster',
      email: 'eli.f@example.com',
      phone: '(480) 555-0455',
      dateOfBirth: '1990-10-12',
      sex: 'male',
      status: 'active',
      goals: ['weight_loss', 'performance'],
      allergies: [],
      conditions: [],
      medications: [],
      heightCm: 180,
      startWeightKg: 99,
      currentWeightKg: 97.6,
      goalWeightKg: 85,
      enrolledAt: dateFromNow(-16),
      locationId: 'loc_scottsdale',
      careTeamIds: ['staff_reyes', 'staff_lindqvist'],
      primaryProviderId: 'staff_reyes',
      avatarHue: 188,
      tags: ['GLP-1', 'New'],
      adherence30d: 0.86,
      churnRisk: 'low',
    },
  },
  {
    templateId: 'tmpl_tirzepatide_program',
    currentWeek: 18,
    base: {
      id: 'pt_hana',
      clinicId: 'clinic_solstice',
      firstName: 'Hana',
      lastName: 'Yamamoto',
      email: 'hana.y@example.com',
      phone: '(512) 555-0501',
      dateOfBirth: '1983-02-23',
      sex: 'female',
      status: 'active',
      goals: ['weight_loss', 'longevity'],
      allergies: [],
      conditions: [],
      medications: [],
      heightCm: 160,
      startWeightKg: 79,
      currentWeightKg: 66.8,
      goalWeightKg: 64,
      enrolledAt: dateFromNow(-130),
      locationId: 'loc_austin',
      careTeamIds: ['staff_okafor'],
      primaryProviderId: 'staff_okafor',
      avatarHue: 14,
      tags: ['GLP-1', 'Membership'],
      adherence30d: 0.91,
      churnRisk: 'low',
    },
  },
];

export const patients: Patient[] = plans.map((p) => p.base);

/* ------------------------------------------------------------------ */
/* Per-patient clinical record generation                              */
/* ------------------------------------------------------------------ */

const protocols: PatientProtocol[] = [];
const occurrences: DoseOccurrence[] = [];
const doseLogs: DoseLog[] = [];
const vials: Vial[] = [];
const checkIns: CheckIn[] = [];
const sideEffects: SideEffectEvent[] = [];
const outcomes: Record<string, OutcomeSeries[]> = {};
const photos: ProgressPhoto[] = [];
const labs: LabPanel[] = [];
const documents: ClinicDocument[] = [];
const appointments: Appointment[] = [];
const notifications: AppNotification[] = [];

const FREQ_INTERVAL: Record<string, number> = {
  daily: 1,
  every_other_day: 2,
  twice_weekly: 3,
  weekly: 7,
  five_on_two_off: 1,
};

function buildRecord(plan: PatientPlan): void {
  const template = protocolTemplates.find((t) => t.id === plan.templateId)!;
  const patient = plan.base;
  const startDate = dateFromNow(-(plan.currentWeek - 1) * 7 - 2);

  // Resolve the current titration rung for each item.
  const items = template.items.map((item) => {
    const rung =
      [...item.titration].reverse().find((s) => plan.currentWeek >= s.startWeek) ??
      item.titration[0]!;
    return { ...item, dose: rung.dose };
  });

  const protocol: PatientProtocol = {
    id: `proto_${patient.id}`,
    patientId: patient.id,
    templateId: template.id,
    name: template.name,
    status: patient.status === 'onboarding' ? 'approved' : 'active',
    version: 1,
    items,
    startDate,
    endDate: dateFromNow((template.durationWeeks - plan.currentWeek) * 7),
    durationWeeks: template.durationWeeks,
    currentWeek: plan.currentWeek,
    approvedByProviderId: patient.primaryProviderId,
    approvedAt: daysFromNow(-(plan.currentWeek - 1) * 7 - 3),
    monitoring: template.monitoring,
    notes: `Tolerating ${template.name} well. Continue current step and review at next visit.`,
  };
  protocols.push(protocol);

  // Vials + reconstitution snapshots for each protocol item.
  items.forEach((item, idx) => {
    const product = products.find((p) => p.id === item.productId)!;
    const recon = computeReconstitution({
      vialAmount: product.vialAmount,
      diluentMl: item.reconstitution.diluentMl,
      prescribedDose: item.dose,
      syringeType: item.reconstitution.syringeType,
    });
    const reconstitutedDaysAgo = Math.min(plan.currentWeek * 7 - 1, product.budDays - 6);
    const totalDoses = recon.estimatedDosesPerVial;
    const drawn =
      patient.status === 'onboarding'
        ? 0
        : Math.min(totalDoses - 1, Math.round(reconstitutedDaysAgo / FREQ_INTERVAL[item.frequency]!));
    vials.push({
      id: `vial_${patient.id}_${idx}`,
      patientId: patient.id,
      productId: product.id,
      protocolItemId: item.id,
      state: patient.status === 'onboarding' ? 'planned' : 'active',
      reconstitutedAt:
        patient.status === 'onboarding' ? undefined : daysFromNow(-reconstitutedDaysAgo, 8),
      diluentMl: item.reconstitution.diluentMl,
      syringeType: item.reconstitution.syringeType,
      budDate:
        patient.status === 'onboarding'
          ? undefined
          : dateFromNow(-reconstitutedDaysAgo + product.budDays),
      dosesDrawn: drawn,
      estimatedTotalDoses: totalDoses,
      snapshot: {
        id: uid('snap'),
        vialAmountMcg: recon.vialAmountMcg,
        diluentMl: recon.diluentMl,
        prescribedDoseMcg: recon.prescribedDoseMcg,
        concentrationMcgPerMl: recon.concentrationMcgPerMl,
        drawVolumeMl: recon.drawVolumeMl,
        syringeType: recon.syringeType,
        syringeUnits: recon.syringeUnits,
        displayUnits: recon.displayUnits,
        roundingDisclosure: recon.roundingDisclosure,
        estimatedDosesPerVial: recon.estimatedDosesPerVial,
        generatedAt: protocol.approvedAt,
      },
    });
  });

  // Dose occurrences: 28 days back, 21 days forward, per item.
  items.forEach((item) => {
    const interval = FREQ_INTERVAL[item.frequency]!;
    const vial = vials.find((v) => v.protocolItemId === item.id)!;
    for (let day = -28; day <= 21; day += interval) {
      // five_on_two_off: skip weekend rest days (day-of-week 5,6 of the cycle).
      if (item.frequency === 'five_on_two_off') {
        const cycleDay = ((day % 7) + 7) % 7;
        if (cycleDay === 5 || cycleDay === 6) continue;
      }
      const hour = item.timeOfDay === 'Bedtime' ? 21 : 8;
      const occ: DoseOccurrence = {
        id: `occ_${patient.id}_${item.id}_${day}`,
        patientId: patient.id,
        protocolId: protocol.id,
        protocolItemId: item.id,
        productId: item.productId,
        scheduledFor: daysFromNow(day, hour),
        dose: item.dose,
        status: 'upcoming',
      };
      if (day < 0) {
        const adhere = Math.random() < patient.adherence30d;
        if (patient.status === 'onboarding') {
          occ.status = 'upcoming';
        } else if (adhere) {
          occ.status = 'taken';
          doseLogs.push({
            id: `log_${occ.id}`,
            occurrenceId: occ.id,
            patientId: patient.id,
            productId: item.productId,
            vialId: vial.id,
            loggedAt: daysFromNow(day, hour, 12),
            takenAt: daysFromNow(day, hour, 5),
            dose: item.dose,
            site: SITES[Math.abs(day) % SITES.length]!,
          });
        } else {
          occ.status = day === -interval ? 'late' : 'missed';
        }
      } else if (day === 0) {
        occ.status = 'due';
      }
      occurrences.push(occ);
    }
  });

  // Daily check-ins for the trailing 14 days.
  for (let d = 14; d >= 1; d--) {
    checkIns.push({
      id: `checkin_${patient.id}_${d}`,
      patientId: patient.id,
      date: dateFromNow(-d),
      energy: Math.round(round(3 + Math.random() * 2, 0)),
      sleep: Math.round(round(3 + Math.random() * 2, 0)),
      mood: Math.round(round(3 + Math.random() * 2, 0)),
      appetite: Math.round(round(2 + Math.random() * 2, 0)),
    });
  }

  // Side effects — a few per patient, weighted by category.
  const product0 = products.find((p) => p.id === items[0]!.productId)!;
  const seCount = patient.status === 'onboarding' ? 0 : patient.churnRisk === 'high' ? 4 : 2;
  for (let i = 0; i < seCount; i++) {
    const severity = i === 0 && patient.churnRisk === 'high' ? 'severe' : pick(['mild', 'moderate'] as const);
    sideEffects.push({
      id: `se_${patient.id}_${i}`,
      patientId: patient.id,
      type: pick(product0.commonSideEffects),
      severity,
      note: severity === 'severe' ? 'Worsening over the past two days.' : undefined,
      reportedAt: daysFromNow(-(i * 4 + 1), 14),
      protocolItemId: items[0]!.id,
      redFlag: severity === 'severe',
    });
  }

  // Outcome series.
  const weightStart = patient.startWeightKg;
  const weightNow = patient.currentWeightKg;
  outcomes[patient.id] = [
    {
      kind: 'weight',
      label: 'Weight',
      unit: 'kg',
      points: trend(weightStart, weightNow, Math.max(28, plan.currentWeek * 7), 7, 0.6),
    },
    {
      kind: 'waist',
      label: 'Waist',
      unit: 'cm',
      points: trend(92, 92 - (weightStart - weightNow) * 0.8, 56, 14, 1),
    },
    {
      kind: 'energy',
      label: 'Energy',
      unit: '/5',
      points: trend(3, 4.2, 56, 7, 0.5, 1),
    },
    {
      kind: 'sleep',
      label: 'Sleep quality',
      unit: '/5',
      points: trend(2.8, 4.3, 56, 7, 0.5, 1),
    },
  ];

  // Progress photos.
  if (patient.status !== 'onboarding') {
    photos.push(
      { id: `photo_${patient.id}_0`, patientId: patient.id, takenOn: startDate, hue: patient.avatarHue, pose: 'front' },
      { id: `photo_${patient.id}_1`, patientId: patient.id, takenOn: dateFromNow(-2), hue: patient.avatarHue, pose: 'front' },
    );
  }

  // Labs.
  labs.push({
    id: `lab_${patient.id}_0`,
    patientId: patient.id,
    name: 'Comprehensive Metabolic Panel',
    status: 'released',
    orderedOn: dateFromNow(-plan.currentWeek * 7 - 6),
    resultedOn: dateFromNow(-plan.currentWeek * 7),
    providerComment: 'Within normal limits. Recheck at the 12-week mark.',
    values: [
      { name: 'Glucose', value: 96, unit: 'mg/dL', refLow: 70, refHigh: 99, flag: 'normal' },
      { name: 'ALT', value: 28, unit: 'U/L', refLow: 7, refHigh: 56, flag: 'normal' },
      { name: 'Creatinine', value: 0.9, unit: 'mg/dL', refLow: 0.6, refHigh: 1.3, flag: 'normal' },
      { name: 'HbA1c', value: 5.4, unit: '%', refLow: 4, refHigh: 5.6, flag: 'normal' },
    ],
  });
  if (patient.id === 'pt_jordan') {
    labs.push({
      id: `lab_${patient.id}_1`,
      patientId: patient.id,
      name: 'Lipid Panel',
      status: 'resulted',
      orderedOn: dateFromNow(-9),
      resultedOn: dateFromNow(-2),
      values: [
        { name: 'Total cholesterol', value: 214, unit: 'mg/dL', refLow: 0, refHigh: 200, flag: 'high' },
        { name: 'LDL', value: 142, unit: 'mg/dL', refLow: 0, refHigh: 130, flag: 'high' },
        { name: 'HDL', value: 44, unit: 'mg/dL', refLow: 40, refHigh: 100, flag: 'normal' },
      ],
    });
  }

  // Documents.
  documents.push(
    {
      id: `doc_${patient.id}_consent`,
      patientId: patient.id,
      kind: 'consent',
      title: 'Peptide Therapy Treatment Consent',
      createdAt: daysFromNow(-plan.currentWeek * 7 - 5),
      signed: true,
      signedAt: daysFromNow(-plan.currentWeek * 7 - 5, 10),
    },
    {
      id: `doc_${patient.id}_careplan`,
      patientId: patient.id,
      kind: 'care_plan',
      title: `${template.name} — Care Plan`,
      createdAt: protocol.approvedAt,
      signed: false,
    },
    {
      id: `doc_${patient.id}_release`,
      patientId: patient.id,
      kind: 'consent',
      title: 'Injection Release Form',
      createdAt: daysFromNow(-plan.currentWeek * 7 - 4),
      signed: patient.status !== 'onboarding',
      signedAt:
        patient.status !== 'onboarding'
          ? daysFromNow(-plan.currentWeek * 7 - 4, 11)
          : undefined,
    },
  );

  // Appointments.
  appointments.push({
    id: `appt_${patient.id}_next`,
    patientId: patient.id,
    providerId: patient.primaryProviderId,
    type: 'follow_up',
    status: 'scheduled',
    startsAt: daysFromNow(pick([4, 6, 9, 12]), pick([9, 11, 14, 15])),
    durationMin: 25,
    telehealthUrl: 'https://telehealth.example.com/visit/' + patient.id,
    preVisitComplete: Math.random() > 0.5,
  });
  if (plan.currentWeek > 4) {
    appointments.push({
      id: `appt_${patient.id}_past`,
      patientId: patient.id,
      providerId: patient.primaryProviderId,
      type: 'check_in',
      status: 'completed',
      startsAt: daysFromNow(-28, 10),
      durationMin: 20,
      preVisitComplete: true,
    });
  }
}

plans.forEach(buildRecord);

/* Notifications for the signed-in patient (Avery). */
notifications.push(
  {
    id: 'notif_1',
    patientId: 'pt_avery',
    kind: 'dose',
    title: 'Dose due today',
    body: 'Your weekly Semaglutide dose is scheduled for this morning.',
    createdAt: daysFromNow(0, 7),
    read: false,
  },
  {
    id: 'notif_2',
    patientId: 'pt_avery',
    kind: 'message',
    title: 'Message from Solstice Wellness',
    body: 'Priya replied to your question about nausea.',
    createdAt: daysFromNow(-1, 16),
    read: false,
  },
  {
    id: 'notif_3',
    patientId: 'pt_avery',
    kind: 'bud',
    title: 'Vial expiring soon',
    body: 'Your Semaglutide vial reaches its discard date in 6 days.',
    createdAt: daysFromNow(-1, 9),
    read: true,
  },
  {
    id: 'notif_4',
    patientId: 'pt_avery',
    kind: 'appointment',
    title: 'Upcoming follow-up',
    body: 'Your visit with Dr. Reyes is in 4 days.',
    createdAt: daysFromNow(-2, 12),
    read: true,
  },
);

/* ------------------------------------------------------------------ */
/* Message threads                                                     */
/* ------------------------------------------------------------------ */

export const messageThreads: MessageThread[] = [
  {
    id: 'thread_avery_1',
    patientId: 'pt_avery',
    clinicId: 'clinic_solstice',
    subject: 'Nausea after my dose',
    category: 'side_effect',
    assignedToId: 'staff_lindqvist',
    unread: false,
    urgent: false,
    lastMessageAt: daysFromNow(-1, 16),
    messages: [
      {
        id: 'm1',
        threadId: 'thread_avery_1',
        authorId: 'pt_avery',
        authorRole: 'patient',
        body: "I've had some nausea the morning after my last two doses. It's manageable but I wanted to check in.",
        sentAt: daysFromNow(-2, 9),
      },
      {
        id: 'm2',
        threadId: 'thread_avery_1',
        authorId: 'staff_lindqvist',
        authorRole: 'staff',
        body: 'Thanks for letting us know, Avery. Mild nausea is common at this step. Try smaller, protein-forward meals and plenty of water. If it becomes severe or you can’t keep fluids down, message us right away.',
        sentAt: daysFromNow(-1, 16),
      },
    ],
  },
  {
    id: 'thread_avery_2',
    patientId: 'pt_avery',
    clinicId: 'clinic_solstice',
    subject: 'Refill timing',
    category: 'refill',
    assignedToId: 'staff_gomez',
    unread: true,
    urgent: false,
    lastMessageAt: daysFromNow(-4, 11),
    messages: [
      {
        id: 'm3',
        threadId: 'thread_avery_2',
        authorId: 'pt_avery',
        authorRole: 'patient',
        body: 'When should I reorder my next vial?',
        sentAt: daysFromNow(-4, 11),
      },
    ],
  },
  {
    id: 'thread_jordan_1',
    patientId: 'pt_jordan',
    clinicId: 'clinic_solstice',
    subject: 'Severe nausea — not improving',
    category: 'side_effect',
    unread: true,
    urgent: true,
    lastMessageAt: daysFromNow(0, 8),
    messages: [
      {
        id: 'm4',
        threadId: 'thread_jordan_1',
        authorId: 'pt_jordan',
        authorRole: 'patient',
        body: "The nausea has been bad for two days and I'm struggling to keep food down. What should I do?",
        sentAt: daysFromNow(0, 8),
      },
    ],
  },
  {
    id: 'thread_marcus_1',
    patientId: 'pt_marcus',
    clinicId: 'clinic_solstice',
    subject: 'Injection-site redness',
    category: 'side_effect',
    assignedToId: 'staff_okafor',
    unread: true,
    urgent: false,
    lastMessageAt: daysFromNow(-1, 13),
    messages: [
      {
        id: 'm5',
        threadId: 'thread_marcus_1',
        authorId: 'pt_marcus',
        authorRole: 'patient',
        body: 'One of my injection sites is a little red and warm. Photo attached.',
        sentAt: daysFromNow(-1, 13),
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Triage cases (derived from severe / red-flag side effects)           */
/* ------------------------------------------------------------------ */

export const triageCases: TriageCase[] = sideEffects
  .filter((s) => s.redFlag)
  .map((s) => ({
    id: `triage_${s.id}`,
    patientId: s.patientId,
    sideEffectId: s.id,
    status: s.patientId === 'pt_jordan' ? 'escalated' : 'new',
    severity: s.severity,
    assignedToId: s.patientId === 'pt_jordan' ? 'staff_okafor' : undefined,
    openedAt: s.reportedAt,
    slaDueAt: daysFromNow(0, 18),
    summary: `${s.type} reported as ${s.severity}.`,
  }));

/* ------------------------------------------------------------------ */
/* Refills & orders                                                    */
/* ------------------------------------------------------------------ */

function eligibility(allPass: boolean): RefillRequest['eligibility'] {
  return [
    { rule: 'supply', label: 'Supply running low', passed: true, blocking: false, detail: '6 doses remaining' },
    { rule: 'provider', label: 'Provider approval', passed: allPass, blocking: true, detail: allPass ? 'Approved' : 'Awaiting provider review' },
    { rule: 'labs', label: 'Required labs current', passed: true, blocking: true, detail: 'CMP on file' },
    { rule: 'payment', label: 'Account in good standing', passed: true, blocking: true, detail: 'No balance due' },
    { rule: 'visit', label: 'Follow-up visit', passed: allPass, blocking: false, detail: allPass ? 'Scheduled' : 'Recommended within 2 weeks' },
  ];
}

export const refillRequests: RefillRequest[] = [
  {
    id: 'refill_avery',
    patientId: 'pt_avery',
    productId: 'prod_semaglutide',
    protocolId: 'proto_pt_avery',
    status: 'under_review',
    requestedAt: daysFromNow(-1, 10),
    eligibility: eligibility(false),
    eligible: false,
  },
  {
    id: 'refill_priya',
    patientId: 'pt_priya',
    productId: 'prod_semaglutide',
    protocolId: 'proto_pt_priya',
    status: 'approved',
    requestedAt: daysFromNow(-3, 9),
    eligibility: eligibility(true),
    eligible: true,
    fulfillment: 'in_house',
  },
  {
    id: 'refill_hana',
    patientId: 'pt_hana',
    productId: 'prod_tirzepatide',
    protocolId: 'proto_pt_hana',
    status: 'shipped',
    requestedAt: daysFromNow(-6, 14),
    eligibility: eligibility(true),
    eligible: true,
    fulfillment: 'pharmacy',
    trackingNumber: '1Z999AA10123456784',
  },
  {
    id: 'refill_lena',
    patientId: 'pt_lena',
    productId: 'prod_cjc_ipa',
    protocolId: 'proto_pt_lena',
    status: 'requested',
    requestedAt: daysFromNow(0, 7),
    eligibility: eligibility(false),
    eligible: false,
  },
];

export const orders: Order[] = [
  {
    id: 'order_priya',
    patientId: 'pt_priya',
    refillId: 'refill_priya',
    status: 'ready_for_fulfillment',
    fulfillment: 'in_house',
    createdAt: daysFromNow(-2, 12),
    items: [{ productId: 'prod_semaglutide', quantity: 1, unitPriceUsd: 320 }],
    totalUsd: 320,
    lotId: 'lot_sema_1',
  },
  {
    id: 'order_hana',
    patientId: 'pt_hana',
    refillId: 'refill_hana',
    status: 'shipped',
    fulfillment: 'pharmacy',
    createdAt: daysFromNow(-5, 9),
    items: [{ productId: 'prod_tirzepatide', quantity: 1, unitPriceUsd: 470 }],
    totalUsd: 470,
  },
  {
    id: 'order_eli',
    patientId: 'pt_eli',
    status: 'paid',
    fulfillment: 'in_house',
    createdAt: daysFromNow(-1, 15),
    items: [{ productId: 'prod_semaglutide', quantity: 1, unitPriceUsd: 320 }],
    totalUsd: 320,
  },
];

/* ------------------------------------------------------------------ */
/* Inventory                                                            */
/* ------------------------------------------------------------------ */

export const inventoryLots: InventoryLot[] = [
  { id: 'lot_sema_1', clinicId: 'clinic_solstice', locationId: 'loc_scottsdale', productId: 'prod_semaglutide', lotNumber: 'SEM-24A118', expiresOn: dateFromNow(220), quantityOnHand: 14, quantityReserved: 2, reorderThreshold: 8, status: 'in_stock', supplier: 'Cascade Compounding' },
  { id: 'lot_sema_2', clinicId: 'clinic_solstice', locationId: 'loc_austin', productId: 'prod_semaglutide', lotNumber: 'SEM-24A092', expiresOn: dateFromNow(34), quantityOnHand: 5, quantityReserved: 1, reorderThreshold: 8, status: 'expiring', supplier: 'Cascade Compounding' },
  { id: 'lot_tirz_1', clinicId: 'clinic_solstice', locationId: 'loc_austin', productId: 'prod_tirzepatide', lotNumber: 'TRZ-24B044', expiresOn: dateFromNow(180), quantityOnHand: 4, quantityReserved: 0, reorderThreshold: 6, status: 'low', supplier: 'Cascade Compounding' },
  { id: 'lot_bpc_1', clinicId: 'clinic_solstice', locationId: 'loc_scottsdale', productId: 'prod_bpc157', lotNumber: 'BPC-24C201', expiresOn: dateFromNow(150), quantityOnHand: 19, quantityReserved: 3, reorderThreshold: 6, status: 'in_stock', supplier: 'Northlight Labs' },
  { id: 'lot_cjc_1', clinicId: 'clinic_solstice', locationId: 'loc_scottsdale', productId: 'prod_cjc_ipa', lotNumber: 'CJC-24A077', expiresOn: dateFromNow(95), quantityOnHand: 11, quantityReserved: 1, reorderThreshold: 6, status: 'in_stock', supplier: 'Northlight Labs' },
  { id: 'lot_nad_1', clinicId: 'clinic_solstice', locationId: 'loc_scottsdale', productId: 'prod_nad', lotNumber: 'NAD-23D310', expiresOn: dateFromNow(-4), quantityOnHand: 3, quantityReserved: 0, reorderThreshold: 4, status: 'recalled', supplier: 'Cascade Compounding' },
  { id: 'lot_tb_1', clinicId: 'clinic_solstice', locationId: 'loc_austin', productId: 'prod_tb500', lotNumber: 'TB5-24B019', expiresOn: dateFromNow(210), quantityOnHand: 8, quantityReserved: 0, reorderThreshold: 4, status: 'in_stock', supplier: 'Northlight Labs' },
];

/* ------------------------------------------------------------------ */
/* Commerce                                                             */
/* ------------------------------------------------------------------ */

export const subscriptions: Subscription[] = patients
  .filter((p) => p.tags.includes('Membership'))
  .map((p) => ({
    id: `sub_${p.id}`,
    patientId: p.id,
    planName: 'Solstice Membership',
    status: 'active',
    amountUsd: 149,
    interval: 'monthly',
    nextBillingOn: dateFromNow(pick([6, 11, 18, 24])),
  }));

/* ------------------------------------------------------------------ */
/* Audit log                                                            */
/* ------------------------------------------------------------------ */

export const auditEvents: AuditEvent[] = [
  { id: 'audit_1', clinicId: 'clinic_solstice', actorName: 'Dr. Mara Reyes', actorRole: 'clinic_owner', action: 'approved protocol', resourceType: 'protocol', resourceLabel: 'Metabolic Reset — Avery Chen', at: daysFromNow(0, 9) },
  { id: 'audit_2', clinicId: 'clinic_solstice', actorName: 'Priya Lindqvist', actorRole: 'rn', action: 'replied to message thread', resourceType: 'message', resourceLabel: 'Nausea after my dose', at: daysFromNow(-1, 16) },
  { id: 'audit_3', clinicId: 'clinic_solstice', actorName: 'Tobias Gomez', actorRole: 'medical_assistant', action: 'dispensed from lot', resourceType: 'inventory', resourceLabel: 'SEM-24A118 → Priya Anand', at: daysFromNow(-1, 14) },
  { id: 'audit_4', clinicId: 'clinic_solstice', actorName: 'Dr. Daniel Okafor', actorRole: 'provider', action: 'escalated triage case', resourceType: 'triage', resourceLabel: 'Severe nausea — Jordan Whitfield', at: daysFromNow(0, 8) },
  { id: 'audit_5', clinicId: 'clinic_solstice', actorName: 'Avery Chen', actorRole: 'patient', action: 'logged a dose', resourceType: 'dose', resourceLabel: 'Semaglutide 500 mcg', at: daysFromNow(-7, 8) },
  { id: 'audit_6', clinicId: 'clinic_solstice', actorName: 'Wendy Huang', actorRole: 'clinic_admin', action: 'flagged inventory lot', resourceType: 'inventory', resourceLabel: 'NAD-23D310 recalled', at: daysFromNow(-2, 11) },
];

export const clinicalData = {
  protocols,
  occurrences,
  doseLogs,
  vials,
  checkIns,
  sideEffects,
  outcomes,
  photos,
  labs,
  documents,
  appointments,
  notifications,
};
