import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarRange,
  CircleDot,
  ClipboardList,
  Clock,
  FlaskConical,
  Pencil,
  Repeat,
  ShieldCheck,
  Syringe,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { computeReconstitution } from '@beacon/calculations';
import type { Frequency, PeptideCategory } from '@beacon/domain';
import { Badge, Button, Card, Loading, PageHeader, SectionTitle } from '../components/ui';
import { formatDose, titleCase } from '../lib/format';
import { useProducts, useProtocolTemplates } from '../lib/hooks';

const CATEGORY_TONE = {
  glp1: 'brand',
  healing: 'success',
  growth_hormone: 'info',
  longevity: 'accent',
  sexual_health: 'warning',
  cosmetic: 'neutral',
  immune: 'info',
} as const;

const CATEGORY_LABEL: Record<PeptideCategory, string> = {
  glp1: 'GLP-1',
  healing: 'Healing',
  growth_hormone: 'Growth Hormone',
  longevity: 'Longevity',
  sexual_health: 'Sexual Health',
  cosmetic: 'Cosmetic',
  immune: 'Immune',
};

const FREQUENCY_LABEL: Record<Frequency, string> = {
  daily: 'Daily',
  every_other_day: 'Every other day',
  twice_weekly: 'Twice weekly',
  weekly: 'Weekly',
  five_on_two_off: '5 days on / 2 off',
};

export function ProtocolDetail() {
  const { id } = useParams<{ id: string }>();
  const templates = useProtocolTemplates();
  const products = useProducts();

  if (!templates.data || !products.data) return <Loading />;

  const template = templates.data.find((t) => t.id === id);
  if (!template) {
    return (
      <>
        <Link
          to="/protocols"
          className="mb-3 inline-flex items-center gap-1.5 text-bodySm text-ink-muted hover:text-ink"
        >
          <ArrowLeft size={15} /> Protocol library
        </Link>
        <Card className="p-12 text-center text-bodySm text-ink-muted">Protocol not found.</Card>
      </>
    );
  }

  return (
    <>
      <Link
        to="/protocols"
        className="mb-3 inline-flex items-center gap-1.5 text-bodySm text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> Protocol library
      </Link>

      <PageHeader
        title={template.name}
        subtitle="Protocol"
        actions={
          <>
            <Link to={`/protocols/builder?template=${template.id}`}>
              <Button variant="secondary" icon={<Pencil size={15} />}>
                Edit in builder
              </Button>
            </Link>
            <Button icon={<ClipboardList size={15} />}>Assign to patient</Button>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-5">
        {/* Main */}
        <div className="col-span-2 space-y-5">
          {/* Overview */}
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="max-w-xl text-body text-ink-secondary">{template.summary}</p>
              <Badge tone={CATEGORY_TONE[template.category]}>
                {CATEGORY_LABEL[template.category]}
              </Badge>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4 border-t border-border pt-5">
              <Detail
                icon={<CalendarRange size={14} />}
                label="Duration"
                value={`${template.durationWeeks} weeks`}
              />
              <Detail
                icon={<FlaskConical size={14} />}
                label="Peptides"
                value={`${template.items.length}`}
              />
              <Detail
                icon={<Users size={14} />}
                label="Patients assigned"
                value={`${template.timesAssigned}`}
              />
            </div>
          </Card>

          {/* Peptide items */}
          {template.items.map((item) => {
            const product = products.data!.find((p) => p.id === item.productId);
            if (!product) return null;
            const recon = computeReconstitution({
              vialAmount: product.vialAmount,
              diluentMl: item.reconstitution.diluentMl,
              prescribedDose: item.dose,
              syringeType: item.reconstitution.syringeType,
            });
            return (
              <Card key={item.id} className="p-5">
                <div className="flex items-center justify-between">
                  <SectionTitle>
                    <span className="inline-flex items-center gap-2">
                      <FlaskConical size={18} className="text-primary" /> {product.name}
                    </span>
                  </SectionTitle>
                  <Badge tone={CATEGORY_TONE[product.category]}>
                    {CATEGORY_LABEL[product.category]}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <Detail icon={<Syringe size={14} />} label="Route" value={titleCase(item.route)} />
                  <Detail
                    icon={<Repeat size={14} />}
                    label="Frequency"
                    value={FREQUENCY_LABEL[item.frequency]}
                  />
                  <Detail icon={<Clock size={14} />} label="Time of day" value={item.timeOfDay} />
                  <Detail
                    icon={<CircleDot size={14} />}
                    label="Current dose"
                    value={formatDose(item.dose)}
                  />
                </div>

                {/* Titration ladder */}
                {item.titration.length > 1 && (
                  <div className="mt-5">
                    <p className="mb-2 text-bodySm font-semibold text-ink-secondary">
                      <CalendarRange size={14} className="mr-1 inline" />
                      Titration ladder
                    </p>
                    <div className="space-y-2">
                      {item.titration.map((step, idx) => {
                        const next = item.titration[idx + 1];
                        return (
                          <div
                            key={step.label}
                            className="flex items-center gap-3 rounded-xl border border-border p-3"
                          >
                            <CircleDot size={16} className="text-primary" />
                            <div className="flex-1">
                              <p className="text-bodySm font-semibold text-ink">{step.label}</p>
                              <p className="text-caption text-ink-muted">
                                Starts week {step.startWeek}
                                {next ? ` · ends week ${next.startWeek - 1}` : ''}
                              </p>
                            </div>
                            <span className="text-bodySm font-semibold text-ink">
                              {formatDose(step.dose)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cycle */}
                {item.cycle.enabled && (
                  <div className="mt-5 flex items-center gap-3 rounded-xl bg-accent-soft p-4">
                    <CalendarRange size={18} className="text-accent" />
                    <div className="flex-1">
                      <p className="text-bodySm font-semibold text-ink">Cycled dosing</p>
                      <p className="text-caption text-ink-secondary">{item.cycle.description}</p>
                    </div>
                  </div>
                )}

                {/* Reconstitution params */}
                <div className="mt-5 rounded-xl border border-border bg-sand-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <ShieldCheck size={15} className="text-success" />
                    <p className="text-bodySm font-semibold text-ink">
                      Reconstitution — flows to patient's calculator
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <Detail
                      label="Vial amount"
                      value={`${product.vialAmount.value} ${product.vialAmount.unit}`}
                    />
                    <Detail label="Diluent" value={`${item.reconstitution.diluentMl} mL`} />
                    <Detail label="Syringe" value={item.reconstitution.syringeType.toUpperCase()} />
                    <div>
                      <p className="mb-1.5 text-bodySm font-semibold text-ink-secondary">
                        Calculated draw
                      </p>
                      <div className="rounded-xl bg-primary px-3.5 py-2.5 text-primary-on">
                        <p className="text-body font-semibold">{recon.displayUnits} units</p>
                        <p className="text-caption opacity-80">{recon.drawVolumeMl} mL</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-5 rounded-xl border border-border p-4">
                  <p className="mb-1 text-bodySm font-semibold text-ink-secondary">
                    Patient-facing instructions
                  </p>
                  <p className="text-bodySm text-ink">{item.instructions}</p>
                </div>
              </Card>
            );
          })}

          {/* Red flags */}
          <Card className="p-5">
            <SectionTitle>
              <span className="inline-flex items-center gap-2">
                <TriangleAlert size={18} className="text-warning" /> Red-flag rules
              </span>
            </SectionTitle>
            {template.redFlags.length === 0 ? (
              <p className="text-bodySm text-ink-muted">No red-flag rules defined.</p>
            ) : (
              <ul className="space-y-2">
                {template.redFlags.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-bodySm text-ink-secondary">
                    <TriangleAlert size={14} className="mt-1 shrink-0 text-warning" />
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle>Monitoring</SectionTitle>
            {template.monitoring.length === 0 ? (
              <p className="text-bodySm text-ink-muted">No monitoring scheduled.</p>
            ) : (
              <ul className="space-y-1.5 text-bodySm text-ink-secondary">
                {template.monitoring.map((m) => (
                  <li key={m}>· {m}</li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <SectionTitle>Required labs</SectionTitle>
            {template.requiredLabs.length === 0 ? (
              <p className="text-bodySm text-ink-muted">No labs required.</p>
            ) : (
              <ul className="space-y-1.5 text-bodySm text-ink-secondary">
                {template.requiredLabs.map((l) => (
                  <li key={l}>· {l}</li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function Detail({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 inline-flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-ink-muted">
        {icon}
        {label}
      </p>
      <p className="text-bodySm font-medium text-ink">{value}</p>
    </div>
  );
}
