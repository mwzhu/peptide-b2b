/**
 * Mock AI protocol generator. A deterministic, rule-based stand-in for the
 * eventual model-backed endpoint: it ranks library peptides against the
 * provider's goals + free-text symptoms, screens the patient's medications and
 * conditions for conflicts, resolves stack interactions and dosing timing, and
 * returns a fully-formed {@link GeneratedProtocol} the review screen renders.
 *
 * Everything here is a heuristic for the prototype — not clinical guidance.
 * Swapping in a real endpoint later means replacing `generateProtocol` while
 * keeping the same input/output shapes.
 */
import type {
  DoseAmount,
  Frequency,
  GeneratedProtocol,
  GeneratedStackItem,
  GenerationInput,
  InteractionCompatibility,
  PeptideLibraryEntry,
  ProtocolGoal,
  Route,
  SafetyFlag,
  ScheduleSlot,
  StackInteraction,
  TitrationStep,
} from '@beacon/domain';
import { products } from './seed-clinic';
import { peptideLibrary } from './peptide-library';

/* ------------------------------------------------------------------ */
/* Goal model                                                          */
/* ------------------------------------------------------------------ */

type WeightAxis = keyof PeptideLibraryEntry['purposeWeights'];

interface GoalConfig {
  label: string;
  /** Primary purpose-weight axis this goal maps to (a soft, secondary signal). */
  axis: WeightAxis;
  /** Library purpose tags that boost a candidate for this goal. */
  tags: string[];
  /**
   * Canonical peptides for this goal. The dominant signal — keeps narrow goals
   * (sleep, libido) from collapsing onto the generic health_wellness axis, where
   * almost everything scores high.
   */
  prefer: string[];
}

const GOALS: Record<ProtocolGoal, GoalConfig> = {
  weight_loss: {
    label: 'Weight loss',
    axis: 'weight_metabolic',
    tags: ['Weight Loss', 'Metabolic Health', 'Appetite Suppression', 'Glucose Control'],
    prefer: [
      'prod_tirzepatide',
      'prod_semaglutide',
      'prod_retatrutide',
      'prod_survodutide',
      'prod_cagrilintide',
      'prod_aod9604',
      'prod_5amino1mq',
      'prod_tesamorelin',
    ],
  },
  recovery: {
    label: 'Recovery & repair',
    axis: 'recovery_longevity',
    tags: ['Recovery', 'Tissue Repair', 'Joint Health', 'Muscle Repair'],
    prefer: ['prod_bpc157', 'prod_tb500', 'prod_thymosin_b4', 'prod_pegmgf', 'prod_ghkcu'],
  },
  sleep: {
    label: 'Sleep',
    axis: 'health_wellness',
    tags: ['Sleep Quality', 'Stress Relief', 'Emotional Support'],
    prefer: ['prod_dsip', 'prod_epitalon', 'prod_cjc_ipa', 'prod_sermorelin', 'prod_pinealon'],
  },
  libido: {
    label: 'Libido & sexual health',
    axis: 'health_wellness',
    tags: ['Libido Support', 'Sexual Health', 'Reproductive Function', 'Hormonal Support'],
    prefer: ['prod_melanotan2', 'prod_melanotan1'],
  },
  performance: {
    label: 'Performance & muscle',
    axis: 'performance_muscle',
    tags: ['Muscle Development', 'Physical Performance', 'Growth Hormone', 'Muscle Repair'],
    prefer: [
      'prod_cjc_ipa',
      'prod_ipamorelin',
      'prod_igf1lr3',
      'prod_pegmgf',
      'prod_mk677',
      'prod_hgh',
      'prod_tesamorelin',
    ],
  },
  skin: {
    label: 'Skin & hair',
    axis: 'beauty_antiaging',
    tags: ['Skin Quality', 'Hair Growth', 'Dermal Protection', 'Anti-Aging'],
    prefer: ['prod_ghkcu', 'prod_ahkcu', 'prod_snap8', 'prod_glutathione', 'prod_melanotan1'],
  },
  inflammation: {
    label: 'Inflammation & gut',
    axis: 'recovery_longevity',
    tags: ['Anti-Inflammatory', 'Immune System', 'Gut Support', 'Digestive Health'],
    prefer: ['prod_kpv', 'prod_bpc157', 'prod_ll37', 'prod_thymosin_a1'],
  },
  longevity: {
    label: 'Longevity',
    axis: 'recovery_longevity',
    tags: ['Anti-Aging', 'Cellular Energy', 'Cellular Support', 'Oxidative Balance'],
    prefer: ['prod_epitalon', 'prod_nad', 'prod_motsc', 'prod_ss31', 'prod_glutathione'],
  },
  cognitive: {
    label: 'Cognitive & mood',
    axis: 'brain_mood',
    tags: ['Cognitive Health', 'Neurological Support', 'Memory Support', 'Stress Relief'],
    prefer: ['prod_semax', 'prod_selank', 'prod_dihexa', 'prod_pinealon'],
  },
  immune: {
    label: 'Immune support',
    axis: 'health_wellness',
    tags: ['Immune System', 'Anti-Inflammatory', 'Cellular Detox'],
    prefer: ['prod_thymosin_a1', 'prod_ll37', 'prod_kpv'],
  },
};

/** Symptom keywords → goals to infer when the provider didn't tick the chip. */
const SYMPTOM_KEYWORDS: { goal: ProtocolGoal; words: string[] }[] = [
  { goal: 'weight_loss', words: ['weight', 'lose', 'fat', 'obese', 'appetite', 'overweight', 'slim', 'belly'] },
  { goal: 'sleep', words: ['sleep', 'insomnia', 'rest', 'wake', 'restless', 'tired at night'] },
  { goal: 'recovery', words: ['recover', 'injury', 'heal', 'tendon', 'joint', 'pain', 'sore', 'rehab'] },
  { goal: 'performance', words: ['performance', 'muscle', 'strength', 'gym', 'workout', 'athletic', 'lean mass'] },
  { goal: 'cognitive', words: ['focus', 'brain', 'memory', 'cognition', 'mood', 'anxiety', 'mental', 'clarity'] },
  { goal: 'libido', words: ['libido', 'sex', 'erectile', 'arousal', 'desire'] },
  { goal: 'skin', words: ['skin', 'wrinkle', 'hair', 'collagen', 'aging skin', 'complexion'] },
  { goal: 'inflammation', words: ['inflammation', 'gut', 'ibs', 'bloat', 'digest', 'leaky'] },
  { goal: 'longevity', words: ['longevity', 'energy', 'fatigue', 'anti-aging', 'vitality', 'cellular'] },
  { goal: 'immune', words: ['immune', 'sick', 'infection', 'cold', 'resilience'] },
];

/* ------------------------------------------------------------------ */
/* Dosing table                                                        */
/* ------------------------------------------------------------------ */

interface DosingSpec {
  dose: DoseAmount;
  frequency: Frequency;
  /** When in the day; falls back to a derivation from timing guidance. */
  timeOfDay?: string;
  titration?: TitrationStep[];
  /** Well-studied enough to survive the "conservative only" preference. */
  established: boolean;
}

const tit = (steps: [string, number, number][]): TitrationStep[] =>
  steps.map(([label, startWeek, value]) => ({ label, startWeek, dose: { value, unit: 'mg' } }));

const DOSING: Record<string, DosingSpec> = {
  prod_semaglutide: {
    dose: { value: 0.25, unit: 'mg' },
    frequency: 'weekly',
    timeOfDay: 'Weekly — any time',
    established: true,
    titration: tit([
      ['Weeks 1–4', 1, 0.25],
      ['Weeks 5–8', 5, 0.5],
      ['Weeks 9+', 9, 1],
    ]),
  },
  prod_tirzepatide: {
    dose: { value: 2.5, unit: 'mg' },
    frequency: 'weekly',
    timeOfDay: 'Weekly — any time',
    established: true,
    titration: tit([
      ['Weeks 1–4', 1, 2.5],
      ['Weeks 5–8', 5, 5],
      ['Weeks 9+', 9, 7.5],
    ]),
  },
  prod_retatrutide: {
    dose: { value: 2, unit: 'mg' },
    frequency: 'weekly',
    timeOfDay: 'Weekly — any time',
    established: false,
    titration: tit([
      ['Weeks 1–4', 1, 2],
      ['Weeks 5–8', 5, 4],
      ['Weeks 9+', 9, 6],
    ]),
  },
  prod_cagrilintide: {
    dose: { value: 0.3, unit: 'mg' },
    frequency: 'weekly',
    timeOfDay: 'Weekly — any time',
    established: false,
    titration: tit([
      ['Weeks 1–4', 1, 0.3],
      ['Weeks 5+', 5, 0.6],
    ]),
  },
  prod_survodutide: { dose: { value: 0.6, unit: 'mg' }, frequency: 'weekly', timeOfDay: 'Weekly — any time', established: false },
  prod_tesamorelin: { dose: { value: 1, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Before bed', established: true },
  prod_aod9604: { dose: { value: 0.3, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Morning (fasted)', established: false },
  prod_5amino1mq: { dose: { value: 50, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Morning', established: false },
  prod_bpc157: { dose: { value: 0.25, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Morning (fasted)', established: true },
  prod_tb500: { dose: { value: 2.5, unit: 'mg' }, frequency: 'twice_weekly', timeOfDay: 'Morning', established: true },
  prod_cjc_ipa: { dose: { value: 0.3, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Before bed', established: true },
  prod_thymosin_a1: { dose: { value: 1.6, unit: 'mg' }, frequency: 'twice_weekly', timeOfDay: 'Morning', established: true },
  prod_thymosin_b4: { dose: { value: 2, unit: 'mg' }, frequency: 'twice_weekly', timeOfDay: 'Morning', established: true },
  prod_ll37: { dose: { value: 0.1, unit: 'mg' }, frequency: 'every_other_day', timeOfDay: 'Morning', established: false },
  prod_kpv: { dose: { value: 0.5, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Morning', established: false },
  prod_pegmgf: { dose: { value: 0.2, unit: 'mg' }, frequency: 'twice_weekly', timeOfDay: 'Pre-workout', established: false },
  prod_ghkcu: { dose: { value: 2, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Evening', established: true },
  prod_melanotan2: { dose: { value: 0.5, unit: 'mg' }, frequency: 'every_other_day', timeOfDay: 'Evening', established: false },
  prod_melanotan1: { dose: { value: 1, unit: 'mg' }, frequency: 'every_other_day', timeOfDay: 'Evening', established: false },
  prod_snap8: { dose: { value: 0.5, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Evening', established: false },
  prod_glutathione: { dose: { value: 200, unit: 'mg' }, frequency: 'twice_weekly', timeOfDay: 'Morning', established: true },
  prod_ahkcu: { dose: { value: 2, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Evening', established: false },
  prod_nad: { dose: { value: 100, unit: 'mg' }, frequency: 'twice_weekly', timeOfDay: 'Morning', established: true },
  prod_epitalon: { dose: { value: 10, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Before bed', established: false },
  prod_motsc: { dose: { value: 5, unit: 'mg' }, frequency: 'twice_weekly', timeOfDay: 'Morning', established: false },
  prod_ss31: { dose: { value: 5, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Morning', established: false },
  prod_mk677: { dose: { value: 25, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Before bed', established: true },
  prod_sermorelin: { dose: { value: 0.3, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Before bed', established: true },
  prod_ipamorelin: { dose: { value: 0.3, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Before bed', established: true },
  prod_cjc1295_dac: { dose: { value: 2, unit: 'mg' }, frequency: 'weekly', timeOfDay: 'Weekly — evening', established: true },
  prod_igf1lr3: { dose: { value: 0.05, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Pre-workout', established: false },
  prod_hgh: { dose: { value: 2, unit: 'iu' }, frequency: 'daily', timeOfDay: 'Before bed', established: true },
  prod_semax: { dose: { value: 0.6, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Morning', established: true },
  prod_selank: { dose: { value: 0.3, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Morning', established: true },
  prod_dihexa: { dose: { value: 8, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Morning', established: false },
  prod_pinealon: { dose: { value: 5, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Morning', established: false },
  prod_dsip: { dose: { value: 0.1, unit: 'mg' }, frequency: 'daily', timeOfDay: 'Before bed', established: false },
};

/* ------------------------------------------------------------------ */
/* Safety screening                                                    */
/* ------------------------------------------------------------------ */

const GLP1 = ['prod_semaglutide', 'prod_tirzepatide', 'prod_retatrutide', 'prod_survodutide'];
const GROWTH = [
  'prod_cjc_ipa',
  'prod_cjc1295_dac',
  'prod_ipamorelin',
  'prod_sermorelin',
  'prod_tesamorelin',
  'prod_mk677',
  'prod_igf1lr3',
  'prod_hgh',
  'prod_pegmgf',
];
const ANGIOGENIC = ['prod_bpc157', 'prod_tb500', 'prod_pegmgf', 'prod_igf1lr3'];
const COPPER = ['prod_ghkcu', 'prod_ahkcu'];
const MELANOTAN = ['prod_melanotan1', 'prod_melanotan2'];
const SEROTONERGIC = ['prod_selank', 'prod_semax', 'prod_dsip'];

interface ScreenRule {
  words: string[];
  /** Which input list this rule reads. */
  field: 'medications' | 'conditions' | 'allergies' | 'supplements';
  appliesTo: string[];
  severity: SafetyFlag['severity'];
  title: string;
  detail: (source: string, peptide: string) => string;
  /** A warning that should also remove the peptide from the stack. */
  exclude?: boolean;
}

const SCREEN_RULES: ScreenRule[] = [
  {
    words: ['glp', 'glp-1', 'semaglutide', 'ozempic', 'wegovy', 'rybelsus', 'tirzepatide', 'mounjaro', 'zepbound', 'liraglutide', 'saxenda', 'victoza', 'dulaglutide', 'trulicity'],
    field: 'medications',
    appliesTo: GLP1,
    severity: 'warning',
    title: 'Already on a GLP-1 agonist',
    detail: (src, name) =>
      `Patient takes ${src}. ${name} is also an incretin agonist — stacking duplicates appetite suppression and GI load. Taper or replace the existing agent rather than running both.`,
    exclude: true,
  },
  {
    words: ['insulin', 'metformin', 'glipizide', 'glyburide', 'sulfonylurea', 'januvia', 'jardiance', 'glimepiride'],
    field: 'medications',
    appliesTo: GLP1,
    severity: 'caution',
    title: 'Hypoglycemia risk with glucose-lowering meds',
    detail: (src, name) =>
      `${name} can amplify the glucose-lowering effect of ${src}. Review dosing and have the patient monitor blood sugar, especially during titration.`,
  },
  {
    words: ['warfarin', 'coumadin', 'eliquis', 'apixaban', 'xarelto', 'rivaroxaban', 'heparin', 'clopidogrel', 'plavix', 'blood thinner', 'anticoagulant'],
    field: 'medications',
    appliesTo: ANGIOGENIC,
    severity: 'caution',
    title: 'Angiogenic peptide with an anticoagulant',
    detail: (src, name) =>
      `${name} promotes vascular/tissue remodeling. Combined with ${src} this warrants monitoring for bruising or bleeding at injection sites.`,
  },
  {
    words: ['ssri', 'sertraline', 'zoloft', 'fluoxetine', 'prozac', 'escitalopram', 'lexapro', 'antidepressant', 'maoi', 'phenelzine'],
    field: 'medications',
    appliesTo: SEROTONERGIC,
    severity: 'caution',
    title: 'Overlapping neuro-active therapy',
    detail: (src, name) =>
      `${name} modulates mood/serotonergic tone. Layered on ${src}, introduce slowly and watch for over-activation or sleep changes.`,
  },
  {
    words: ['cancer', 'malignancy', 'tumor', 'carcinoma', 'lymphoma', 'leukemia', 'oncolog'],
    field: 'conditions',
    appliesTo: GROWTH,
    severity: 'warning',
    title: 'Growth-promoting peptide with malignancy history',
    detail: (src, name) =>
      `${name} raises GH/IGF-1 signaling, which is contraindicated with ${src}. Do not include without oncology clearance.`,
    exclude: true,
  },
  {
    words: ['medullary thyroid', 'men2', 'men 2', 'thyroid cancer', 'thyroid carcinoma'],
    field: 'conditions',
    appliesTo: GLP1,
    severity: 'warning',
    title: 'Boxed-warning contraindication',
    detail: (src, name) =>
      `Personal or family history of ${src} is a boxed contraindication for GLP-1 agonists like ${name}. Exclude.`,
    exclude: true,
  },
  {
    words: ['pregnan', 'breastfeed', 'lactat', 'nursing', 'trying to conceive'],
    field: 'conditions',
    appliesTo: ['*'],
    severity: 'warning',
    title: 'Not for use in pregnancy or lactation',
    detail: (src, name) =>
      `${src} noted. Peptide therapy including ${name} is not recommended — defer the protocol.`,
    exclude: true,
  },
  {
    words: ['hypertension', 'high blood pressure', 'bp meds', 'lisinopril', 'amlodipine', 'losartan', 'metoprolol', 'blood pressure'],
    field: 'medications',
    appliesTo: MELANOTAN,
    severity: 'caution',
    title: 'May affect blood pressure',
    detail: (src, name) =>
      `${name} can transiently raise blood pressure. With ${src} on board, baseline a BP reading and re-check after the first week.`,
  },
  {
    words: ['melanoma', 'skin cancer', 'atypical mole', 'dysplastic nevi'],
    field: 'conditions',
    appliesTo: MELANOTAN,
    severity: 'warning',
    title: 'Melanocortin agonist with skin-cancer history',
    detail: (src, name) =>
      `${name} stimulates melanocytes; with ${src} this is contraindicated. Exclude and refer to dermatology.`,
    exclude: true,
  },
  {
    words: ['copper', 'wilson'],
    field: 'allergies',
    appliesTo: COPPER,
    severity: 'warning',
    title: 'Copper sensitivity',
    detail: (src, name) =>
      `${name} is a copper peptide and conflicts with a noted ${src}. Exclude.`,
    exclude: true,
  },
  {
    words: ['copper'],
    field: 'supplements',
    appliesTo: COPPER,
    severity: 'caution',
    title: 'Stacking copper sources',
    detail: (src, name) =>
      `${name} adds to total copper load alongside ${src}. Cap combined intake and watch for nausea.`,
  },
  {
    words: ['kidney', 'renal', 'ckd', 'egfr'],
    field: 'conditions',
    appliesTo: GLP1,
    severity: 'caution',
    title: 'Renal monitoring advised',
    detail: (src, name) =>
      `GI fluid loss on ${name} can stress kidneys given ${src}. Keep the patient hydrated and monitor renal function.`,
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const libraryByProduct = new Map(peptideLibrary.map((e) => [e.productId, e]));
const productById = new Map(products.map((p) => [p.id, p]));

function routeFor(productId: string): Route {
  return productById.get(productId)?.route ?? 'subcutaneous';
}

/** Order for "most conservative wins" when two directional notes disagree. */
const COMPAT_RANK: Record<InteractionCompatibility, number> = {
  incompatible: 0,
  neutral: 1,
  compatible: 2,
  complementary: 3,
};

function lc(list: string[]): string[] {
  return list.map((s) => s.toLowerCase());
}

/** Slot-ordering minutes for the day timeline. */
function slotMinutes(label: string): number {
  const l = label.toLowerCase();
  if (l.includes('fasted') || l.includes('morning') || l.includes('am')) return 7 * 60;
  if (l.includes('pre-workout')) return 16 * 60;
  if (l.includes('evening')) return 19 * 60;
  if (l.includes('bed') || l.includes('night') || l.includes('pm')) return 22 * 60;
  if (l.includes('weekly')) return 8 * 60;
  return 12 * 60;
}

/* ------------------------------------------------------------------ */
/* Scoring                                                             */
/* ------------------------------------------------------------------ */

function scoreFor(entry: PeptideLibraryEntry, goal: ProtocolGoal): number {
  const cfg = GOALS[goal];
  const axis = entry.purposeWeights[cfg.axis] ?? 0;
  const tagHits = entry.purposeTags.filter((t) => cfg.tags.includes(t)).length;
  const preferRank = cfg.prefer.indexOf(entry.productId);
  // Canonical peptides dominate; the order in `prefer` breaks ties. Tags are the
  // next strongest signal, and the broad purpose-weight axis only nudges. Tuned
  // so canonical picks spread across ~60–90 rather than all pinning at 100.
  const preferBoost = preferRank === -1 ? 0 : 50 - preferRank * 3;
  return Math.round(preferBoost + tagHits * 7 + axis * 0.22);
}

/** Resolve the effective goal set: explicit chips + keywords from symptoms. */
function resolveGoals(input: GenerationInput): { goals: ProtocolGoal[]; inferred: ProtocolGoal[] } {
  const explicit = new Set(input.goals);
  const text = input.symptoms.toLowerCase();
  const inferred: ProtocolGoal[] = [];
  for (const { goal, words } of SYMPTOM_KEYWORDS) {
    if (explicit.has(goal)) continue;
    if (words.some((w) => text.includes(w))) {
      explicit.add(goal);
      inferred.push(goal);
    }
  }
  // Stable order: original chips first, then inferred.
  const ordered = [...input.goals, ...inferred];
  return { goals: ordered.length ? ordered : ['longevity'], inferred };
}

/* ------------------------------------------------------------------ */
/* Interaction & schedule resolution                                   */
/* ------------------------------------------------------------------ */

function resolvePairInteraction(aId: string, bId: string): StackInteraction | null {
  const a = libraryByProduct.get(aId);
  const b = libraryByProduct.get(bId);
  if (!a || !b) return null;
  const aName = a.name;
  const bName = b.name;
  const fromA = a.interactions.find((i) => i.withProductId === bId);
  const fromB = b.interactions.find((i) => i.withProductId === aId);
  let chosen = fromA ?? fromB;
  // If both directions exist, keep the more conservative reading.
  if (fromA && fromB) {
    chosen = COMPAT_RANK[fromA.compatibility] <= COMPAT_RANK[fromB.compatibility] ? fromA : fromB;
  }
  if (!chosen) {
    return {
      aProductId: aId,
      bProductId: bId,
      aName,
      bName,
      compatibility: 'compatible',
      description: 'No established interaction in the reference library — generally safe to run together; sequence by timing below.',
    };
  }
  return {
    aProductId: aId,
    bProductId: bId,
    aName,
    bName,
    compatibility: chosen.compatibility,
    description: chosen.description,
  };
}

function buildSchedule(items: GeneratedStackItem[]): ScheduleSlot[] {
  const byLabel = new Map<string, ScheduleSlot>();
  for (const it of items) {
    const label = it.timeOfDay;
    if (!byLabel.has(label)) {
      byLabel.set(label, { label, minutes: slotMinutes(label), items: [], note: undefined });
    }
    byLabel.get(label)!.items.push({ productId: it.productId, name: it.name, dose: it.dose });
  }

  const slots = [...byLabel.values()].sort((a, b) => a.minutes - b.minutes);

  for (const slot of slots) {
    if (slot.items.length < 2) {
      // Single-item slots still get a short hint for GH secretagogues / fasted peptides.
      const only = slot.items[0];
      if (only && GROWTH.includes(only.productId)) {
        slot.note = 'Dose on an empty stomach and wait ~30 min before eating to protect the GH pulse.';
      } else if (only && only.productId === 'prod_bpc157') {
        slot.note = 'Most effective fasted; keep ~10 min before food.';
      }
      continue;
    }
    const ids = slot.items.map((i) => i.productId);
    const hasGrowth = ids.some((id) => GROWTH.includes(id));
    if (hasGrowth) {
      slot.note =
        'Inject the GH-axis peptide on an empty stomach. Separate from other shots in this slot by 15–20 min, and don\'t eat for 30 min afterward.';
    } else {
      slot.note = 'These can be drawn into separate syringes and given back-to-back — no spacing required.';
    }
  }
  return slots;
}

/* ------------------------------------------------------------------ */
/* Main entry                                                          */
/* ------------------------------------------------------------------ */

let counter = 0;

export function generateProtocol(input: GenerationInput): GeneratedProtocol {
  const { goals, inferred } = resolveGoals(input);
  const maxStack = Math.max(1, Math.min(input.preferences.maxStackSize, 5));

  // 1) Score every library peptide against every active goal.
  const candidates = peptideLibrary
    .filter((e) => DOSING[e.productId])
    .map((e) => {
      const perGoal = goals.map((g) => ({ goal: g, score: scoreFor(e, g) }));
      const best = perGoal.reduce((a, b) => (b.score > a.score ? b : a));
      const addresses = perGoal
        .filter((pg) => pg.score >= Math.max(40, best.score - 18))
        .map((pg) => pg.goal);
      return { entry: e, best, addresses };
    });

  // 2) Pre-screen hard exclusions BEFORE selecting, so the generator substitutes
  //    a safe alternative (e.g. a non-GLP-1 weight peptide) instead of dropping a
  //    goal. Only peptides that were actually contenders for the patient's goals
  //    surface as flags, to keep the screen from listing irrelevant peptides.
  const contenderIds = new Set(
    candidates.filter((c) => c.best.score >= 50).map((c) => c.entry.productId),
  );
  const { banned, exclusionFlags, excludedNotes } = computeBans(input, contenderIds);
  const excluded: { name: string; reason: string }[] = [...excludedNotes];

  const isEligible = (c: (typeof candidates)[number]): boolean => {
    if (banned.has(c.entry.productId)) return false;
    if (input.preferences.conservativeOnly && !DOSING[c.entry.productId]!.established) {
      return false;
    }
    return true;
  };

  // A candidate cannot join the stack if it's hard-incompatible with anything
  // already chosen — the generator must never propose a pair it would itself flag
  // "avoid together" (e.g. two GLP-1 agonists). Conflicts that knock out an
  // otherwise strong candidate are recorded so the review screen can explain why.
  // Selection is the ONLY path that adds a peptide, so this guard can't be
  // bypassed by a later step.
  const conflictWith = (c: (typeof candidates)[number]) =>
    chosen.find(
      (x) => resolvePairInteraction(c.entry.productId, x.entry.productId)?.compatibility === 'incompatible',
    );

  // The "minimize injections" preference is a selection bias, not a post-hoc
  // swap: oral peptides get a boost so they win where they fit, and the conflict
  // guard above then naturally keeps the stack consistent.
  const routeBias = (c: (typeof candidates)[number]) =>
    input.preferences.injectionAverse && routeFor(c.entry.productId) === 'oral' ? 22 : 0;

  // 3) Greedy pick: for each goal in priority order, take its top eligible scorer
  //    that doesn't conflict with the stack, then fill remaining slots similarly.
  const chosen: typeof candidates = [];
  for (const goal of goals) {
    if (chosen.length >= maxStack) break;
    const pick = candidates
      .filter((c) => !chosen.includes(c) && isEligible(c) && !conflictWith(c))
      .filter((c) => c.addresses.includes(goal) || c.best.goal === goal)
      .sort((a, b) => scoreFor(b.entry, goal) + routeBias(b) - (scoreFor(a.entry, goal) + routeBias(a)))[0];
    if (pick) chosen.push(pick);
  }
  while (chosen.length < maxStack) {
    const pick = candidates
      .filter((c) => !chosen.includes(c) && isEligible(c) && !conflictWith(c))
      .sort((a, b) => b.best.score + routeBias(b) - (a.best.score + routeBias(a)))[0];
    if (!pick || pick.best.score < 40) break;
    chosen.push(pick);
  }

  // Record strong contenders dropped purely because they conflicted with the
  // stack (e.g. the other GLP-1 agonists once one is in), so the substitution is
  // transparent on the review screen.
  const conflictExcluded = candidates
    .filter((c) => !chosen.includes(c) && isEligible(c) && c.best.score >= 50)
    .map((c) => ({ c, conflict: conflictWith(c) }))
    .filter((x) => x.conflict)
    .slice(0, 3);
  for (const { c, conflict } of conflictExcluded) {
    excluded.push({
      name: c.entry.name,
      reason: `Conflicts with ${conflict!.entry.name} — flagged “avoid together” in the library, so it wasn't stacked.`,
    });
  }

  // 4) Build stack items.
  const items: GeneratedStackItem[] = chosen.map((c) => {
    const spec = DOSING[c.entry.productId]!;
    const entry = c.entry;
    const goalLabels = c.addresses.map((g) => GOALS[g].label);
    const rationale = buildRationale(entry, c.addresses, c.best.score);
    const alternatives = candidates
      .filter(
        (alt) =>
          alt !== c &&
          !chosen.includes(alt) &&
          alt.addresses.some((g) => c.addresses.includes(g)),
      )
      .sort((a, b) => b.best.score - a.best.score)
      .slice(0, 2)
      .map((alt) => ({
        productId: alt.entry.productId,
        name: alt.entry.name,
        reason: `Also targets ${goalLabels[0] ?? 'this goal'} (${Math.round(alt.best.score)}/100 fit).`,
      }));

    return {
      productId: entry.productId,
      name: entry.name,
      matchScore: Math.min(100, Math.round(c.best.score)),
      addresses: c.addresses,
      rationale,
      dose: spec.dose,
      frequency: spec.frequency,
      route: routeFor(entry.productId),
      timeOfDay: spec.timeOfDay ?? 'Morning',
      timingGuidance: entry.timingGuidance,
      titration: spec.titration ?? [],
      alternatives,
    };
  });

  // 5) Terminal compatibility backstop. Selection already guards conflicts, so
  //    this is normally a no-op — but it runs on the *assembled* stack no matter
  //    what produced it, guaranteeing the emitted protocol never contains an
  //    incompatible pair even if some future code path slips one in.
  const { items: finalItems, removed: lateRemoved } = enforceStackCompatibility(items);
  for (const r of lateRemoved) {
    excluded.push({
      name: r.item.name,
      reason: `Removed by the final compatibility check — conflicts with ${r.conflictsWith.name}.`,
    });
  }

  // 6) Pairwise interactions across the stack.
  const finalInteractions: StackInteraction[] = [];
  for (let i = 0; i < finalItems.length; i++) {
    for (let j = i + 1; j < finalItems.length; j++) {
      const r = resolvePairInteraction(finalItems[i]!.productId, finalItems[j]!.productId);
      if (r) finalInteractions.push(r);
    }
  }

  // 7) Safety screen: hard exclusions (computed up front) plus soft cautions that
  //    apply to peptides actually in the stack.
  const cautionFlags = screenCautions(input, finalItems);
  const order = { warning: 0, caution: 1, info: 2 };
  const safetyFlags = [...exclusionFlags, ...cautionFlags].sort(
    (a, b) => order[a.severity] - order[b.severity],
  );

  const schedule = buildSchedule(finalItems);

  // 8) Monitoring & labs derived from what's in the stack.
  const monitoring = deriveMonitoring(finalItems);
  const suggestedLabs = deriveLabs(finalItems);

  // 9) Confidence + naming.
  const avgMatch =
    finalItems.length > 0
      ? finalItems.reduce((s, it) => s + it.matchScore, 0) / finalItems.length
      : 50;
  const warningCount = safetyFlags.filter((f) => f.severity === 'warning').length;
  const confidence = Math.max(
    42,
    Math.min(96, Math.round(avgMatch - warningCount * 9 - (finalItems.length === 0 ? 30 : 0))),
  );

  const primaryLabel = GOALS[goals[0]!].label;
  const name = finalItems.length
    ? `${primaryLabel} stack — ${finalItems.map((i) => i.name).join(' + ')}`
    : `${primaryLabel} — review required`;

  counter += 1;
  return {
    id: `gen_${Date.now().toString(36)}_${counter}`,
    input,
    name,
    summary: buildSummary(goals, inferred, finalItems),
    confidence,
    durationWeeks: 12,
    items: finalItems,
    interactions: finalInteractions,
    schedule,
    safetyFlags,
    monitoring,
    suggestedLabs,
    excluded,
    generatedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/* Copy builders                                                       */
/* ------------------------------------------------------------------ */

function buildRationale(entry: PeptideLibraryEntry, goals: ProtocolGoal[], score: number): string {
  const labels = goals.map((g) => GOALS[g].label.toLowerCase());
  const tags = entry.purposeTags.slice(0, 2).join(' and ').toLowerCase();
  const fit = score >= 75 ? 'a strong match' : score >= 55 ? 'a solid match' : 'a reasonable fit';
  const goalPhrase =
    labels.length > 1 ? `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}` : labels[0];
  return `Chosen as ${fit} for ${goalPhrase}; known for ${tags}.`;
}

function buildSummary(goals: ProtocolGoal[], inferred: ProtocolGoal[], items: GeneratedStackItem[]): string {
  const goalText = goals.map((g) => GOALS[g].label.toLowerCase()).join(', ');
  const inferredText = inferred.length
    ? ` Symptoms also pointed to ${inferred.map((g) => GOALS[g].label.toLowerCase()).join(' and ')}.`
    : '';
  if (items.length === 0) {
    return `Could not assemble a safe stack for ${goalText} given the patient's clinical context. Review the safety flags.${inferredText}`;
  }
  return `A ${items.length}-peptide stack targeting ${goalText}, sequenced for interactions and daily timing.${inferredText}`;
}

/* ------------------------------------------------------------------ */
/* Screening + derivations                                             */
/* ------------------------------------------------------------------ */

function inputFields(input: GenerationInput) {
  return {
    medications: input.medications,
    conditions: input.conditions,
    allergies: input.allergies,
    supplements: input.supplements,
  } as const;
}

/** First entry in `list` that contains any of `words` (case-insensitive). */
function firstMatch(list: string[], words: string[]): string | undefined {
  const lowered = lc(list);
  const idx = lowered.findIndex((entry) => words.some((w) => entry.includes(w)));
  return idx === -1 ? undefined : list[idx];
}

/**
 * Hard exclusions, resolved before peptide selection. Bans every product an
 * `exclude` rule covers so the generator picks a safe substitute, and emits one
 * consolidated flag per rule (only for peptides that were genuine contenders for
 * the patient's goals).
 */
function computeBans(
  input: GenerationInput,
  contenderIds: Set<string>,
): { banned: Set<string>; exclusionFlags: SafetyFlag[]; excludedNotes: { name: string; reason: string }[] } {
  const fields = inputFields(input);
  const banned = new Set<string>();
  const exclusionFlags: SafetyFlag[] = [];
  const excludedNotes: { name: string; reason: string }[] = [];

  for (const rule of SCREEN_RULES) {
    if (!rule.exclude) continue;
    const source = firstMatch(fields[rule.field], rule.words);
    if (!source) continue;

    const targetIds = rule.appliesTo.includes('*')
      ? [...contenderIds]
      : rule.appliesTo;
    // Ban all covered peptides; surface only the ones that were contenders.
    const surfaced: string[] = [];
    for (const id of targetIds) {
      banned.add(id);
      if (contenderIds.has(id)) surfaced.push(id);
    }
    if (surfaced.length === 0) continue;

    const names = surfaced.map((id) => productById.get(id)?.name ?? id);
    exclusionFlags.push({
      severity: rule.severity,
      title: rule.title,
      detail: rule.detail(source, names.join(', ')),
      source,
    });
    for (const id of surfaced) {
      excludedNotes.push({
        name: productById.get(id)?.name ?? id,
        reason: `Excluded by the safety screen — ${rule.title.toLowerCase()} (${source}).`,
      });
    }
  }
  return { banned, exclusionFlags, excludedNotes };
}

/** Soft cautions for peptides that made it into the final stack. */
function screenCautions(input: GenerationInput, items: GeneratedStackItem[]): SafetyFlag[] {
  const fields = inputFields(input);
  const stackIds = new Set(items.map((i) => i.productId));
  const flags: SafetyFlag[] = [];

  for (const rule of SCREEN_RULES) {
    if (rule.exclude) continue;
    const source = firstMatch(fields[rule.field], rule.words);
    if (!source) continue;
    const targets = rule.appliesTo.includes('*')
      ? items.map((i) => i.productId)
      : rule.appliesTo.filter((id) => stackIds.has(id));
    for (const productId of targets) {
      const name = productById.get(productId)?.name ?? 'this peptide';
      flags.push({ severity: rule.severity, title: rule.title, detail: rule.detail(source, name), source, productId });
    }
  }

  const seen = new Set<string>();
  return flags.filter((f) => {
    const key = `${f.title}|${f.productId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function deriveMonitoring(items: GeneratedStackItem[]): string[] {
  const ids = new Set(items.map((i) => i.productId));
  const out = new Set<string>();
  if (GLP1.some((id) => ids.has(id))) {
    out.add('Weekly weight and waist circumference');
    out.add('GI tolerance (nausea, constipation) during titration');
    out.add('Blood glucose if diabetic or pre-diabetic');
  }
  if (GROWTH.some((id) => ids.has(id))) {
    out.add('Fasting glucose / HbA1c — GH peptides can raise blood sugar');
    out.add('IGF-1 at baseline and 8 weeks');
  }
  if (ANGIOGENIC.some((id) => ids.has(id))) {
    out.add('Injection-site healing and any unusual swelling');
  }
  if (ids.has('prod_melanotan1') || ids.has('prod_melanotan2')) {
    out.add('Skin / mole survey before and during use');
    out.add('Blood pressure in the first 1–2 weeks');
  }
  out.add('Symptom and side-effect check-in at week 2 and week 6');
  return [...out];
}

function deriveLabs(items: GeneratedStackItem[]): string[] {
  const ids = new Set(items.map((i) => i.productId));
  const out = new Set<string>();
  out.add('CMP (metabolic panel)');
  if (GLP1.some((id) => ids.has(id))) {
    out.add('HbA1c');
    out.add('Lipid panel');
  }
  if (GROWTH.some((id) => ids.has(id))) {
    out.add('IGF-1');
    out.add('Fasting insulin & glucose');
  }
  if (ids.has('prod_ghkcu') || ids.has('prod_ahkcu')) {
    out.add('Serum copper / ceruloplasmin');
  }
  return [...out];
}

/* ------------------------------------------------------------------ */
/* Catalog access for the swap UI                                      */
/* ------------------------------------------------------------------ */

export function getPeptideLibrary(): PeptideLibraryEntry[] {
  return peptideLibrary;
}

/** Replace one stack item with an alternative, recomputing its dosing/timing. */
export function buildStackItem(productId: string, addresses: ProtocolGoal[]): GeneratedStackItem | null {
  const entry = libraryByProduct.get(productId);
  const spec = DOSING[productId];
  if (!entry || !spec) return null;
  const best = addresses.reduce(
    (acc, g) => Math.max(acc, scoreFor(entry, g)),
    0,
  );
  return {
    productId,
    name: entry.name,
    matchScore: Math.min(100, Math.round(best)),
    addresses,
    rationale: buildRationale(entry, addresses, best),
    dose: spec.dose,
    frequency: spec.frequency,
    route: routeFor(productId),
    timeOfDay: spec.timeOfDay ?? 'Morning',
    timingGuidance: entry.timingGuidance,
    titration: spec.titration ?? [],
    alternatives: [],
  };
}

/**
 * Recompute the pairwise interaction matrix for a stack. Exported so the review
 * screen can keep the matrix live as the provider swaps peptides in and out.
 */
export function interactionsForStack(productIds: string[]): StackInteraction[] {
  const out: StackInteraction[] = [];
  for (let i = 0; i < productIds.length; i++) {
    for (let j = i + 1; j < productIds.length; j++) {
      const r = resolvePairInteraction(productIds[i]!, productIds[j]!);
      if (r) out.push(r);
    }
  }
  return out;
}

/** Recompute the day's dosing timeline for a stack (live during swaps). */
export function scheduleForItems(items: GeneratedStackItem[]): ScheduleSlot[] {
  return buildSchedule(items);
}

/**
 * Terminal safety net: enforce that no two peptides in a finished stack are
 * hard-incompatible — independent of how the stack was assembled. Walks items by
 * descending match score and drops any that conflict with one already kept, so
 * the higher-fit peptide of each conflicting pair survives; surviving items keep
 * their original order. Returns the cleaned stack plus what was removed and why.
 *
 * In normal operation this is a no-op (selection already guards conflicts). It
 * exists as a backstop so any future path that bypasses selection still can't
 * emit a stack the app would flag "avoid together".
 */
export function enforceStackCompatibility(items: GeneratedStackItem[]): {
  items: GeneratedStackItem[];
  removed: { item: GeneratedStackItem; conflictsWith: GeneratedStackItem }[];
} {
  const kept: GeneratedStackItem[] = [];
  const removed: { item: GeneratedStackItem; conflictsWith: GeneratedStackItem }[] = [];
  const byScore = [...items].sort((a, b) => b.matchScore - a.matchScore);
  for (const it of byScore) {
    const clash = kept.find(
      (k) => resolvePairInteraction(it.productId, k.productId)?.compatibility === 'incompatible',
    );
    if (clash) removed.push({ item: it, conflictsWith: clash });
    else kept.push(it);
  }
  const keptIds = new Set(kept.map((k) => k.productId));
  return { items: items.filter((it) => keptIds.has(it.productId)), removed };
}
