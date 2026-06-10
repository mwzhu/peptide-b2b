import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  ArrowLeftRight,
  Brain,
  CalendarRange,
  Check,
  ChevronRight,
  ClipboardList,
  Clock,
  FlaskConical,
  Info,
  Pill,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Syringe,
  TriangleAlert,
  X,
} from 'lucide-react';
import type {
  GeneratedProtocol,
  GeneratedStackItem,
  GenerationInput,
  InteractionCompatibility,
  PeptideLibraryEntry,
  ProtocolGoal,
  SafetyFlag,
  StackInteraction,
} from '@beacon/domain';
import { buildStackItem, interactionsForStack, scheduleForItems } from '@beacon/mock-data';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  Field,
  Input,
  PageHeader,
  SectionTitle,
  Select,
  Textarea,
} from '../components/ui';
import { fullName, titleCase } from '../lib/format';
import { usePatients, usePeptideLibrary, useGenerateProtocol } from '../lib/hooks';
import { cn } from '../lib/cn';

/* ------------------------------------------------------------------ */
/* Static config                                                       */
/* ------------------------------------------------------------------ */

const GOAL_OPTIONS: { value: ProtocolGoal; label: string }[] = [
  { value: 'weight_loss', label: 'Weight loss' },
  { value: 'recovery', label: 'Recovery & repair' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'performance', label: 'Performance & muscle' },
  { value: 'cognitive', label: 'Cognitive & mood' },
  { value: 'longevity', label: 'Longevity' },
  { value: 'skin', label: 'Skin & hair' },
  { value: 'libido', label: 'Libido' },
  { value: 'inflammation', label: 'Inflammation & gut' },
  { value: 'immune', label: 'Immune support' },
];
const GOAL_LABEL: Record<ProtocolGoal, string> = Object.fromEntries(
  GOAL_OPTIONS.map((g) => [g.value, g.label]),
) as Record<ProtocolGoal, string>;

const FREQ_LABEL: Record<string, string> = {
  daily: 'Daily',
  twice_weekly: 'Twice weekly',
  weekly: 'Weekly',
  every_other_day: 'Every other day',
  five_on_two_off: '5 on / 2 off',
};

const COMPAT_META: Record<
  InteractionCompatibility,
  { label: string; tone: 'success' | 'info' | 'neutral' | 'danger'; dotClass: string }
> = {
  complementary: { label: 'Synergistic', tone: 'success', dotClass: 'bg-success' },
  compatible: { label: 'Compatible', tone: 'info', dotClass: 'bg-info' },
  neutral: { label: 'Neutral', tone: 'neutral', dotClass: 'bg-ink-muted' },
  incompatible: { label: 'Avoid together', tone: 'danger', dotClass: 'bg-danger' },
};

const SEVERITY_META: Record<
  SafetyFlag['severity'],
  { tone: 'danger' | 'warning' | 'info'; Icon: typeof ShieldAlert; label: string }
> = {
  warning: { tone: 'danger', Icon: ShieldAlert, label: 'Exclusion' },
  caution: { tone: 'warning', Icon: TriangleAlert, label: 'Caution' },
  info: { tone: 'info', Icon: Info, label: 'Note' },
};

const GENERATING_STEPS = [
  { Icon: Activity, label: 'Matching peptides to goals & symptoms' },
  { Icon: ShieldCheck, label: 'Screening medications, agents & conditions' },
  { Icon: ArrowLeftRight, label: 'Resolving stack interactions & compatibility' },
  { Icon: Clock, label: 'Sequencing daily dose timing & spacing' },
];

/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */

type Phase = 'intake' | 'generating' | 'review';

export function ProtocolGenerator() {
  const [search] = useSearchParams();
  const patients = usePatients();
  const library = usePeptideLibrary();
  const generate = useGenerateProtocol();

  const [phase, setPhase] = useState<Phase>('intake');
  const [result, setResult] = useState<GeneratedProtocol | null>(null);

  // ---- intake state ----
  const [patientId, setPatientId] = useState<string>(search.get('patient') ?? '');
  const [goals, setGoals] = useState<ProtocolGoal[]>([]);
  const [symptoms, setSymptoms] = useState('');
  const [medications, setMedications] = useState<string[]>([]);
  const [supplements, setSupplements] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [maxStackSize, setMaxStackSize] = useState(3);
  const [injectionAverse, setInjectionAverse] = useState(false);
  const [conservativeOnly, setConservativeOnly] = useState(false);

  const selectedPatient = patients.data?.find((p) => p.id === patientId);

  // Prefill clinical context + goals from the chosen patient.
  const prefillFrom = (id: string) => {
    setPatientId(id);
    const p = patients.data?.find((x) => x.id === id);
    if (!p) return;
    setMedications(p.medications ?? []);
    setConditions(p.conditions ?? []);
    setAllergies(p.allergies ?? []);
    setSupplements([]);
    // PatientGoal is a subset of ProtocolGoal; keep the ones the generator knows.
    setGoals((p.goals ?? []).filter((g) => g in GOAL_LABEL) as ProtocolGoal[]);
  };

  // Honor a ?patient= deep link once patients load.
  useEffect(() => {
    if (patientId && patients.data && medications.length === 0 && goals.length === 0) {
      prefillFrom(patientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patients.data]);

  const input: GenerationInput = {
    patientId: patientId || undefined,
    goals,
    symptoms,
    medications,
    supplements,
    conditions,
    allergies,
    preferences: { maxStackSize, injectionAverse, conservativeOnly },
  };

  const canGenerate = goals.length > 0 || symptoms.trim().length > 0;

  const runGenerate = () => {
    setPhase('generating');
    generate.mutate(input, {
      onSuccess: (data) => {
        setResult(data);
        setPhase('review');
      },
      onError: () => setPhase('intake'),
    });
  };

  if (phase === 'generating') {
    return <GeneratingView patientName={selectedPatient ? fullName(selectedPatient) : undefined} goals={goals} symptoms={symptoms} />;
  }

  if (phase === 'review' && result) {
    return (
      <ReviewView
        result={result}
        library={library.data ?? []}
        patientName={selectedPatient ? fullName(selectedPatient) : undefined}
        onRegenerate={runGenerate}
        onBack={() => setPhase('intake')}
      />
    );
  }

  return (
    <>
      <Link to="/protocols" className="mb-3 inline-flex items-center gap-1.5 text-bodySm text-ink-muted hover:text-ink">
        <ArrowLeft size={15} /> Protocol library
      </Link>

      <PageHeader
        title="AI Protocol Generator"
        subtitle="Protocols"
        actions={
          <Badge tone="accent" dot>
            Prototype
          </Badge>
        }
      />

      <div className="grid grid-cols-3 gap-5">
        {/* Main intake */}
        <div className="col-span-2 space-y-5">
          {/* Patient */}
          <Card className="p-5">
            <SectionTitle>Patient</SectionTitle>
            <div className="flex items-center gap-3">
              <Select
                value={patientId}
                onChange={(e) => prefillFrom(e.target.value)}
                className="flex-1"
                aria-label="Select patient"
              >
                <option value="">New / unlinked patient</option>
                {patients.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {fullName(p)} · {p.goals.map((g) => GOAL_LABEL[g as ProtocolGoal] ?? titleCase(g)).join(', ')}
                  </option>
                ))}
              </Select>
            </div>
            {selectedPatient && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-sand-50 p-3">
                <Avatar name={fullName(selectedPatient)} hue={selectedPatient.avatarHue} size={40} />
                <div className="flex-1">
                  <p className="font-semibold text-ink">{fullName(selectedPatient)}</p>
                  <p className="text-caption text-ink-muted">
                    Clinical context below was pulled from this chart — edit freely before generating.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Goals & symptoms */}
          <Card className="p-5">
            <SectionTitle>Goals &amp; needs</SectionTitle>
            <p className="mb-3 text-bodySm text-ink-muted">
              Pick the goals to target, and describe symptoms in plain language — the generator reads both.
            </p>
            <div className="mb-5 flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((g) => {
                const on = goals.includes(g.value);
                return (
                  <button
                    key={g.value}
                    onClick={() =>
                      setGoals((prev) => (on ? prev.filter((x) => x !== g.value) : [...prev, g.value]))
                    }
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-bodySm font-medium transition-colors',
                      on
                        ? 'border-primary bg-primary-soft text-sage-700'
                        : 'border-border bg-surface text-ink-secondary hover:bg-sand-100',
                    )}
                  >
                    {on && <Check size={14} />}
                    {g.label}
                  </button>
                );
              })}
            </div>
            <Field label="Symptoms & needs" hint="e.g. “Wants to lose weight and sleep better. Low energy in the afternoons, occasional joint pain.”">
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe what the patient wants to improve…"
              />
            </Field>
          </Card>

          {/* Clinical context */}
          <Card className="p-5">
            <div className="mb-1 flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              <h2 className="font-display text-h3 text-ink">Clinical context</h2>
            </div>
            <p className="mb-4 text-bodySm text-ink-muted">
              Other medications and agents in the body, plus conditions and allergies. Every peptide in the
              draft is screened against these for conflicts.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <TagInput label="Medications" placeholder="e.g. Ozempic 0.5mg" value={medications} onChange={setMedications} />
              <TagInput label="Supplements & agents" placeholder="e.g. TRT, copper" value={supplements} onChange={setSupplements} />
              <TagInput label="Conditions" placeholder="e.g. Hypertension" value={conditions} onChange={setConditions} />
              <TagInput label="Allergies" placeholder="e.g. Sulfa" value={allergies} onChange={setAllergies} />
            </div>
          </Card>
        </div>

        {/* Settings sidebar */}
        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle>Generator settings</SectionTitle>
            <Field label="Max peptides in stack">
              <Select value={maxStackSize} onChange={(e) => setMaxStackSize(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'peptide' : 'peptides'}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="mt-4 space-y-3">
              <Toggle
                checked={injectionAverse}
                onChange={setInjectionAverse}
                label="Minimize injections"
                hint="Prefer oral / fewer needles"
              />
              <Toggle
                checked={conservativeOnly}
                onChange={setConservativeOnly}
                label="Well-studied only"
                hint="Exclude experimental peptides"
              />
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle>Targeting</SectionTitle>
            {goals.length === 0 && !symptoms.trim() ? (
              <p className="text-bodySm text-ink-muted">Add at least one goal or symptom to generate.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {goals.map((g) => (
                  <Badge key={g} tone="brand">
                    {GOAL_LABEL[g]}
                  </Badge>
                ))}
                {goals.length === 0 && <Badge tone="neutral">From symptoms</Badge>}
              </div>
            )}
            <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-caption text-ink-muted">
              <ContextCount label="Medications" n={medications.length} />
              <ContextCount label="Supplements / agents" n={supplements.length} />
              <ContextCount label="Conditions" n={conditions.length} />
              <ContextCount label="Allergies" n={allergies.length} />
            </dl>
          </Card>

          <Button className="w-full" icon={<Sparkles size={16} />} disabled={!canGenerate} onClick={runGenerate}>
            Generate protocol
          </Button>
          <p className="text-center text-caption text-ink-muted">
            Drafts are unsigned and require provider review before assignment.
          </p>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Generating view                                                     */
/* ------------------------------------------------------------------ */

function GeneratingView({
  patientName,
  goals,
  symptoms,
}: {
  patientName?: string;
  goals: ProtocolGoal[];
  symptoms: string;
}) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, GENERATING_STEPS.length - 1)), 750);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft">
          <Sparkles size={28} className="animate-pulse text-primary" />
        </div>
        <h2 className="font-display text-h2 text-ink">Generating protocol</h2>
        <p className="mt-1 text-bodySm text-ink-muted">
          {patientName ? `For ${patientName} · ` : ''}
          {goals.length ? goals.map((g) => GOAL_LABEL[g]).join(', ') : 'reading symptoms'}
        </p>

        <div className="mt-6 space-y-2.5 text-left">
          {GENERATING_STEPS.map(({ Icon, label }, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={label}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors',
                  active ? 'border-primary bg-primary-soft' : done ? 'border-border bg-surface' : 'border-border bg-surface opacity-45',
                )}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full',
                    done ? 'bg-success text-white' : active ? 'bg-primary text-primary-on' : 'bg-surface-sunken text-ink-muted',
                  )}
                >
                  {done ? <Check size={15} /> : <Icon size={15} className={active ? 'animate-pulse' : ''} />}
                </div>
                <span className={cn('text-bodySm', active || done ? 'font-medium text-ink' : 'text-ink-muted')}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        {symptoms.trim() && (
          <p className="mt-5 truncate text-caption italic text-ink-muted">“{symptoms.trim()}”</p>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Review view                                                         */
/* ------------------------------------------------------------------ */

function ReviewView({
  result,
  library,
  patientName,
  onRegenerate,
  onBack,
}: {
  result: GeneratedProtocol;
  library: PeptideLibraryEntry[];
  patientName?: string;
  onRegenerate: () => void;
  onBack: () => void;
}) {
  // Stack is editable: swapping a peptide recomputes the matrix + schedule live.
  const [items, setItems] = useState<GeneratedStackItem[]>(result.items);
  const [addOpen, setAddOpen] = useState(false);

  const interactions = useMemo<StackInteraction[]>(
    () => interactionsForStack(items.map((i) => i.productId)),
    [items],
  );
  const schedule = useMemo(() => scheduleForItems(items), [items]);

  const swap = (index: number, productId: string) => {
    const next = buildStackItem(productId, items[index]!.addresses);
    if (!next) return;
    setItems((prev) => prev.map((it, i) => (i === index ? next : it)));
  };
  const remove = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));
  const addPeptide = (entry: PeptideLibraryEntry) => {
    if (items.some((i) => i.productId === entry.productId)) return;
    const next = buildStackItem(entry.productId, result.input.goals.length ? result.input.goals : ['longevity']);
    if (next) setItems((prev) => [...prev, next]);
    setAddOpen(false);
  };

  const usedIds = new Set(items.map((i) => i.productId));
  const worstFlag = result.safetyFlags[0];

  return (
    <>
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1.5 text-bodySm text-ink-muted hover:text-ink">
        <ArrowLeft size={15} /> Edit intake
      </button>

      <PageHeader
        title={items.length ? `${GOAL_LABEL[result.input.goals[0] ?? 'longevity'] ?? 'Protocol'} stack` : 'Protocol — review required'}
        subtitle={patientName ? `AI draft · ${patientName}` : 'AI draft'}
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCw size={15} />} onClick={onRegenerate}>
              Regenerate
            </Button>
            <Button variant="secondary" icon={<Save size={15} />}>
              Save draft
            </Button>
            <Button icon={<ClipboardList size={15} />} disabled={items.length === 0}>
              Send to builder
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-5">
        {/* Main */}
        <div className="col-span-2 space-y-5">
          {/* Summary */}
          <Card className="p-5">
            <div>
              <div className="mb-1.5 flex flex-wrap gap-1.5">
                {result.input.goals.map((g) => (
                  <Badge key={g} tone="brand">
                    {GOAL_LABEL[g]}
                  </Badge>
                ))}
              </div>
              <p className="text-bodySm text-ink-secondary">{result.summary}</p>
              <p className="mt-2 text-caption text-ink-muted">
                {items.length} {items.length === 1 ? 'peptide' : 'peptides'} · {result.durationWeeks}-week program
                {' · '}generated just now
              </p>
            </div>
          </Card>

          {/* Safety flags */}
          {result.safetyFlags.length > 0 && (
            <Card className={cn('p-5', worstFlag?.severity === 'warning' ? 'border-danger/40' : 'border-warning/40')}>
              <SectionTitle>
                <span className="inline-flex items-center gap-2">
                  <ShieldAlert size={18} className="text-danger" /> Safety screen
                </span>
              </SectionTitle>
              <div className="space-y-2.5">
                {result.safetyFlags.map((f, i) => {
                  const meta = SEVERITY_META[f.severity];
                  return (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-border p-3.5">
                      <div
                        className={cn(
                          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                          meta.tone === 'danger' ? 'bg-danger-soft text-danger' : meta.tone === 'warning' ? 'bg-warning-soft text-warning' : 'bg-info-soft text-info',
                        )}
                      >
                        <meta.Icon size={15} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-ink">{f.title}</p>
                          <Badge tone={meta.tone === 'danger' ? 'danger' : meta.tone === 'warning' ? 'warning' : 'info'}>
                            {meta.label}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-bodySm text-ink-secondary">{f.detail}</p>
                        <p className="mt-1 text-caption text-ink-muted">
                          Triggered by <span className="font-medium text-ink-secondary">{f.source}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Stack */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-h3 text-ink">The stack</h2>
              <Button size="sm" variant="secondary" icon={<Plus size={15} />} onClick={() => setAddOpen(true)}>
                Add peptide
              </Button>
            </div>
            {items.length === 0 ? (
              <Card className="p-8 text-center text-bodySm text-ink-muted">
                No peptides in the draft. The safety screen excluded the candidates — adjust the intake or add a
                peptide manually.
              </Card>
            ) : (
              <div className="space-y-4">
                {items.map((item, i) => (
                  <StackItemCard
                    key={item.productId}
                    item={item}
                    onSwap={(pid) => swap(i, pid)}
                    onRemove={() => remove(i)}
                    removable={items.length > 1}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Compatibility matrix */}
          {items.length > 1 && <CompatibilityPanel items={items} interactions={interactions} />}

          {/* Peptides avoided — shown whenever the engine dropped a candidate,
              whether from the safety screen or a stack-compatibility conflict. */}
          {result.excluded.length > 0 && (
            <Card className="p-5">
              <SectionTitle>
                <span className="inline-flex items-center gap-2">
                  <ArrowLeftRight size={18} className="text-ink-muted" /> Peptides considered but avoided
                </span>
              </SectionTitle>
              <ul className="space-y-2">
                {result.excluded.map((e) => (
                  <li key={e.name} className="flex items-start gap-2.5">
                    <X size={14} className="mt-1 shrink-0 text-ink-muted" />
                    <p className="text-bodySm text-ink-secondary">
                      <span className="font-semibold text-ink">{e.name}</span> — {e.reason}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <ScheduleTimeline schedule={schedule} />

          <Card className="p-5">
            <SectionTitle>
              <span className="inline-flex items-center gap-2">
                <Activity size={17} className="text-primary" /> Monitoring
              </span>
            </SectionTitle>
            <ul className="space-y-1.5 text-bodySm text-ink-secondary">
              {result.monitoring.map((m) => (
                <li key={m} className="flex items-start gap-2">
                  <ChevronRight size={14} className="mt-1 shrink-0 text-ink-muted" />
                  {m}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <SectionTitle>
              <span className="inline-flex items-center gap-2">
                <FlaskConical size={17} className="text-primary" /> Suggested labs
              </span>
            </SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {result.suggestedLabs.map((l) => (
                <Badge key={l} tone="neutral">
                  {l}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Add peptide dialog */}
      <AddPeptideDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        library={library}
        usedIds={usedIds}
        onAdd={addPeptide}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Stack item card                                                     */
/* ------------------------------------------------------------------ */

function StackItemCard({
  item,
  onSwap,
  onRemove,
  removable,
}: {
  item: GeneratedStackItem;
  onSwap: (productId: string) => void;
  onRemove: () => void;
  removable: boolean;
}) {
  const [showAlts, setShowAlts] = useState(false);
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft">
            <FlaskConical size={20} className="text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-h3 text-ink">{item.name}</h3>
              <MatchPill score={item.matchScore} />
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {item.addresses.map((g) => (
                <Badge key={g} tone="brand">
                  {GOAL_LABEL[g]}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        {removable && (
          <button
            onClick={onRemove}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-surface-sunken hover:text-danger"
            aria-label={`Remove ${item.name}`}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <p className="mt-3 text-bodySm text-ink-secondary">{item.rationale}</p>

      {/* Dosing row */}
      <div className="mt-4 grid grid-cols-4 gap-3">
        <DoseStat icon={<Pill size={14} />} label="Dose" value={`${item.dose.value} ${item.dose.unit}`} />
        <DoseStat icon={<CalendarRange size={14} />} label="Frequency" value={FREQ_LABEL[item.frequency] ?? titleCase(item.frequency)} />
        <DoseStat icon={<Syringe size={14} />} label="Route" value={titleCase(item.route)} />
        <DoseStat icon={<Clock size={14} />} label="Timing" value={item.timeOfDay} />
      </div>

      {/* Timing guidance */}
      <div className="mt-3 flex items-start gap-2 rounded-xl bg-sand-50 p-3">
        <Clock size={15} className="mt-0.5 shrink-0 text-ink-muted" />
        <p className="text-caption text-ink-secondary">{timingGuidanceText(item)}</p>
      </div>

      {/* Titration */}
      {item.titration.length > 1 && (
        <div className="mt-3">
          <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-muted">Titration ladder</p>
          <div className="flex flex-wrap gap-2">
            {item.titration.map((step, idx) => (
              <div key={step.label} className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-overline font-semibold text-sage-700">
                  {idx + 1}
                </span>
                <span className="text-caption text-ink-secondary">{step.label}</span>
                <span className="text-caption font-semibold text-ink">
                  {step.dose.value} {step.dose.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternatives / swap */}
      {item.alternatives.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <button
            onClick={() => setShowAlts((s) => !s)}
            className="inline-flex items-center gap-1.5 text-bodySm font-medium text-primary hover:underline"
          >
            <ArrowLeftRight size={14} />
            {showAlts ? 'Hide alternatives' : `Swap for an alternative (${item.alternatives.length})`}
          </button>
          {showAlts && (
            <div className="mt-2 space-y-2">
              {item.alternatives.map((alt) => (
                <div key={alt.productId} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <div className="flex-1">
                    <p className="font-semibold text-ink">{alt.name}</p>
                    <p className="text-caption text-ink-muted">{alt.reason}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => onSwap(alt.productId)}>
                    Use this
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Compatibility matrix                                                */
/* ------------------------------------------------------------------ */

function CompatibilityPanel({
  items,
  interactions,
}: {
  items: GeneratedStackItem[];
  interactions: StackInteraction[];
}) {
  const find = (a: string, b: string) =>
    interactions.find(
      (i) =>
        (i.aProductId === a && i.bProductId === b) || (i.aProductId === b && i.bProductId === a),
    );
  const worst = interactions.reduce<InteractionCompatibility | null>((acc, i) => {
    if (i.compatibility === 'incompatible') return 'incompatible';
    return acc;
  }, null);

  return (
    <Card className="p-5">
      <SectionTitle
        action={
          worst === 'incompatible' ? (
            <Badge tone="danger" dot>
              Conflict found
            </Badge>
          ) : (
            <Badge tone="success" dot>
              No conflicts
            </Badge>
          )
        }
      >
        <span className="inline-flex items-center gap-2">
          <ArrowLeftRight size={18} className="text-primary" /> Stack compatibility
        </span>
      </SectionTitle>

      {/* Grid matrix */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-bodySm">
          <thead>
            <tr>
              <th className="p-2" />
              {items.map((it) => (
                <th key={it.productId} className="p-2 text-caption font-semibold text-ink-muted">
                  {it.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.productId}>
                <td className="whitespace-nowrap p-2 text-caption font-semibold text-ink-muted">{row.name}</td>
                {items.map((col) => {
                  if (row.productId === col.productId) {
                    return (
                      <td key={col.productId} className="p-1.5">
                        <div className="flex h-9 items-center justify-center rounded-lg bg-surface-sunken text-ink-muted">
                          —
                        </div>
                      </td>
                    );
                  }
                  const rel = find(row.productId, col.productId);
                  const meta = rel ? COMPAT_META[rel.compatibility] : COMPAT_META.compatible;
                  return (
                    <td key={col.productId} className="p-1.5">
                      <div
                        className={cn(
                          'flex h-9 items-center justify-center gap-1.5 rounded-lg',
                          meta.tone === 'success' ? 'bg-success-soft text-green-700' : meta.tone === 'danger' ? 'bg-danger-soft text-red-700' : meta.tone === 'info' ? 'bg-info-soft text-blue-700' : 'bg-surface-sunken text-ink-secondary',
                        )}
                        title={meta.label}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', meta.dotClass)} />
                        <span className="text-caption font-medium">{meta.label}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes for non-trivial pairs */}
      <div className="mt-4 space-y-2 border-t border-border pt-4">
        {interactions
          .filter((i) => i.compatibility === 'complementary' || i.compatibility === 'incompatible')
          .map((i) => {
            const meta = COMPAT_META[i.compatibility];
            return (
              <div key={`${i.aProductId}-${i.bProductId}`} className="flex items-start gap-2.5">
                <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', meta.dotClass)} />
                <p className="text-bodySm text-ink-secondary">
                  <span className="font-semibold text-ink">
                    {i.aName} + {i.bName}
                  </span>{' '}
                  <span
                    className={
                      i.compatibility === 'incompatible' ? 'text-danger' : 'text-success'
                    }
                  >
                    ({meta.label})
                  </span>{' '}
                  — {i.description}
                </p>
              </div>
            );
          })}
        {interactions.every((i) => i.compatibility === 'compatible' || i.compatibility === 'neutral') && (
          <p className="text-bodySm text-ink-muted">
            No synergies or conflicts flagged — these peptides are independent. Sequence by the daily timing on
            the right.
          </p>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Schedule timeline                                                   */
/* ------------------------------------------------------------------ */

function ScheduleTimeline({ schedule }: { schedule: GeneratedProtocol['schedule'] }) {
  return (
    <Card className="p-5">
      <SectionTitle>
        <span className="inline-flex items-center gap-2">
          <Clock size={17} className="text-primary" /> Daily timing
        </span>
      </SectionTitle>
      <div className="space-y-4">
        {schedule.map((slot, i) => (
          <div key={slot.label} className="relative pl-6">
            {/* rail */}
            <span className="absolute left-[7px] top-1 h-2.5 w-2.5 rounded-full border-2 border-primary bg-surface" />
            {i < schedule.length - 1 && (
              <span className="absolute left-[11px] top-3.5 h-[calc(100%+0.25rem)] w-px bg-border" />
            )}
            <p className="text-bodySm font-semibold text-ink">{slot.label}</p>
            <div className="mt-1 space-y-1">
              {slot.items.map((it) => (
                <div key={it.productId} className="flex items-center justify-between text-caption">
                  <span className="text-ink-secondary">{it.name}</span>
                  <span className="text-ink-muted">
                    {it.dose.value} {it.dose.unit}
                  </span>
                </div>
              ))}
            </div>
            {slot.note && (
              <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-accent-soft px-2.5 py-1.5 text-caption text-clay-600">
                <Info size={13} className="mt-0.5 shrink-0" />
                {slot.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Add-peptide dialog                                                  */
/* ------------------------------------------------------------------ */

function AddPeptideDialog({
  open,
  onClose,
  library,
  usedIds,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  library: PeptideLibraryEntry[];
  usedIds: Set<string>;
  onAdd: (entry: PeptideLibraryEntry) => void;
}) {
  const [q, setQ] = useState('');
  const rows = library
    .filter((e) => !usedIds.has(e.productId))
    .filter((e) => e.name.toLowerCase().includes(q.toLowerCase()) || e.purposeTags.join(' ').toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Dialog open={open} onClose={onClose} title="Add a peptide" width="max-w-xl">
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search peptides or purposes…" className="pl-9" />
      </div>
      <div className="max-h-[50vh] space-y-2 overflow-y-auto">
        {rows.map((e) => (
          <button
            key={e.productId}
            onClick={() => onAdd(e)}
            className="flex w-full items-start gap-3 rounded-xl border border-border p-3 text-left hover:border-primary/40 hover:bg-sand-100"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
              <FlaskConical size={16} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{e.name}</p>
              <p className="truncate text-caption text-ink-muted">{e.purposeTags.join(' · ')}</p>
            </div>
            <Plus size={16} className="mt-1 shrink-0 text-ink-muted" />
          </button>
        ))}
        {rows.length === 0 && <p className="py-6 text-center text-bodySm text-ink-muted">No peptides match.</p>}
      </div>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function TagInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const add = () => {
    const v = draft.trim();
    if (v && !value.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...value, v]);
    setDraft('');
  };
  return (
    <div>
      <span className="mb-1.5 block text-bodySm font-semibold text-ink-secondary">{label}</span>
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex min-h-[44px] cursor-text flex-wrap items-center gap-1.5 rounded-xl border border-border bg-surface px-2.5 py-2 focus-within:border-primary"
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-primary-soft py-1 pl-2.5 pr-1.5 text-bodySm text-sage-700"
          >
            {tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(value.filter((x) => x !== tag));
              }}
              className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-sage-200"
              aria-label={`Remove ${tag}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            } else if (e.key === 'Backspace' && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={add}
          placeholder={value.length === 0 ? placeholder : ''}
          className="min-w-[80px] flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-muted"
        />
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button onClick={() => onChange(!checked)} className="flex w-full items-center gap-3 text-left">
      <span
        className={cn(
          'relative h-6 w-10 shrink-0 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-surface-sunken',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </span>
      <span className="flex-1">
        <span className="block text-bodySm font-medium text-ink">{label}</span>
        {hint && <span className="block text-caption text-ink-muted">{hint}</span>}
      </span>
    </button>
  );
}

function ContextCount({ label, n }: { label: string; n: number }) {
  return (
    <div className="flex items-center justify-between">
      <dt>{label}</dt>
      <dd className={n > 0 ? 'font-semibold text-ink-secondary' : 'text-ink-muted'}>{n}</dd>
    </div>
  );
}

/** Library timing text, with a sensible fallback when the source is blank. */
function timingGuidanceText(item: GeneratedStackItem): string {
  const g = item.timingGuidance.trim();
  if (g && g.toLowerCase() !== 'not specified') return g;
  return `No specific timing constraint — give it at the scheduled slot (${item.timeOfDay.toLowerCase()}).`;
}

function MatchPill({ score }: { score: number }) {
  const tone = score >= 75 ? 'success' : score >= 55 ? 'brand' : 'neutral';
  return <Badge tone={tone}>{score}/100 match</Badge>;
}

function DoseStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-2.5">
      <div className="flex items-center gap-1 text-ink-muted">
        {icon}
        <span className="text-overline font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-0.5 text-bodySm font-semibold text-ink">{value}</p>
    </div>
  );
}
