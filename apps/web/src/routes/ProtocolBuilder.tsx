import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarRange,
  CircleCheck,
  CircleDot,
  ClipboardList,
  Eye,
  FlaskConical,
  History,
  Save,
  ShieldCheck,
  Signature,
  TriangleAlert,
} from 'lucide-react';
import { computeReconstitution } from '@beacon/calculations';
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Loading,
  PageHeader,
  SectionTitle,
  Select,
} from '../components/ui';
import { formatDose, titleCase } from '../lib/format';
import { useProducts, useProtocolTemplates } from '../lib/hooks';
import type { PeptideCategory } from '@beacon/domain';

export function ProtocolBuilder() {
  const [search] = useSearchParams();
  const templates = useProtocolTemplates();
  const products = useProducts();

  const template = useMemo(() => {
    if (!templates.data) return undefined;
    const id = search.get('template');
    return id ? templates.data.find((t) => t.id === id) : templates.data[0];
  }, [templates.data, search]);

  // Category and per-item product are controlled so a category change can
  // immediately filter the peptide picker and snap each item to a peptide that
  // matches.
  const [category, setCategory] = useState<PeptideCategory>('weight_loss');
  const [productByItem, setProductByItem] = useState<Record<string, string>>({});

  // Initialize state from the loaded template.
  useEffect(() => {
    if (!template) return;
    setCategory(template.category);
    setProductByItem(Object.fromEntries(template.items.map((i) => [i.id, i.productId])));
  }, [template?.id]);

  if (!templates.data || !products.data) return <Loading />;
  if (!template) return <p className="text-ink-muted">Template not found.</p>;

  const productsInCategory = products.data.filter((p) => p.category === category);

  const onCategoryChange = (next: PeptideCategory) => {
    setCategory(next);
    // Reset each item to the first peptide in the new category (if any).
    const matching = products.data.filter((p) => p.category === next);
    const fallback = matching[0]?.id;
    if (!fallback) return;
    setProductByItem((prev) =>
      Object.fromEntries(Object.keys(prev).map((k) => [k, fallback])),
    );
  };

  return (
    <>
      <Link to="/protocols" className="mb-3 inline-flex items-center gap-1.5 text-bodySm text-ink-muted hover:text-ink">
        <ArrowLeft size={15} /> Protocol library
      </Link>

      <PageHeader
        title={template.name}
        subtitle="Protocol builder"
        actions={
          <>
            <Button variant="secondary" icon={<History size={15} />}>
              Version history
            </Button>
            <Button variant="secondary" icon={<Eye size={15} />}>
              Preview as patient
            </Button>
            <Button icon={<Signature size={15} />}>Sign & approve</Button>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-5">
        {/* Main */}
        <div className="col-span-2 space-y-5">
          {/* Header */}
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Template name">
                <Input defaultValue={template.name} />
              </Field>
              <Field label="Category" hint="Changing this filters the peptide picker below.">
                <Select
                  value={category}
                  onChange={(e) => onCategoryChange(e.target.value as PeptideCategory)}
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="recovery">Recovery</option>
                  <option value="aesthetics">Aesthetics</option>
                  <option value="longevity">Longevity</option>
                  <option value="muscle">Muscle</option>
                  <option value="cognitive">Cognitive</option>
                </Select>
              </Field>
              <Field label="Duration (weeks)">
                <Input type="number" defaultValue={template.durationWeeks} />
              </Field>
              <Field label="Summary">
                <Input defaultValue={template.summary} />
              </Field>
            </div>
          </Card>

          {/* Items */}
          {template.items.map((item) => {
            const selectedProductId = productByItem[item.id] ?? item.productId;
            const product =
              products.data!.find((p) => p.id === selectedProductId) ??
              products.data!.find((p) => p.id === item.productId)!;
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
                  <Badge tone="brand">{titleCase(product.category)}</Badge>
                </div>

                <div className="mb-4">
                  <Field label="Peptide">
                    <Select
                      value={selectedProductId}
                      onChange={(e) =>
                        setProductByItem((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                    >
                      {productsInCategory.length === 0 && (
                        <option value="">No peptides in this category</option>
                      )}
                      {productsInCategory.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.vialAmount.value} {p.vialAmount.unit} vial
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Field label="Route">
                    <Select defaultValue={item.route}>
                      <option value="subcutaneous">Subcutaneous</option>
                      <option value="intramuscular">Intramuscular</option>
                      <option value="oral">Oral</option>
                      <option value="nasal">Nasal</option>
                      <option value="topical">Topical</option>
                    </Select>
                  </Field>
                  <Field label="Frequency">
                    <Select defaultValue={item.frequency}>
                      <option value="daily">Daily</option>
                      <option value="every_other_day">Every other day</option>
                      <option value="twice_weekly">Twice weekly</option>
                      <option value="weekly">Weekly</option>
                      <option value="five_on_two_off">5 on / 2 off</option>
                    </Select>
                  </Field>
                  <Field label="Time of day">
                    <Input defaultValue={item.timeOfDay} />
                  </Field>
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
                            <Input className="w-28" defaultValue={step.dose.value} />
                            <Select className="w-24" defaultValue={step.dose.unit}>
                              <option value="mg">mg</option>
                              <option value="mcg">mcg</option>
                            </Select>
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
                    <Field label="Vial amount">
                      <Input defaultValue={`${product.vialAmount.value} ${product.vialAmount.unit}`} disabled />
                    </Field>
                    <Field label="Diluent">
                      <Input defaultValue={`${item.reconstitution.diluentMl} mL`} />
                    </Field>
                    <Field label="Syringe">
                      <Select defaultValue={item.reconstitution.syringeType}>
                        <option value="u100">U-100</option>
                        <option value="u50">U-50</option>
                        <option value="u40">U-40</option>
                      </Select>
                    </Field>
                    <div>
                      <p className="mb-1.5 text-bodySm font-semibold text-ink-secondary">Calculated draw</p>
                      <div className="rounded-xl bg-primary px-3.5 py-2.5 text-primary-on">
                        <p className="text-body font-semibold">{recon.displayUnits} units</p>
                        <p className="text-caption opacity-80">{recon.drawVolumeMl} mL</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-5">
                  <Field label="Patient-facing instructions">
                    <Input defaultValue={item.instructions} />
                  </Field>
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
            <ul className="space-y-2">
              {template.redFlags.map((r) => (
                <li key={r} className="flex items-start gap-2 text-bodySm text-ink-secondary">
                  <TriangleAlert size={14} className="mt-1 shrink-0 text-warning" />
                  {r}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle>Version</SectionTitle>
            <p className="font-display text-h3 text-ink">v2.1</p>
            <p className="mt-1 text-bodySm text-ink-muted">
              Last edited 3 days ago by Dr. Mara Reyes
            </p>
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <Step done label="Drafted" />
              <Step done label="Reviewed" />
              <Step active label="Awaiting provider sign-off" />
              <Step label="Active" />
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle>Monitoring</SectionTitle>
            <ul className="space-y-1.5 text-bodySm text-ink-secondary">
              {template.monitoring.map((m) => (
                <li key={m}>· {m}</li>
              ))}
            </ul>
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

          <Card className="p-5">
            <SectionTitle>Refill rules</SectionTitle>
            <ul className="space-y-2 text-bodySm text-ink-secondary">
              <li className="flex items-center gap-2">
                <CircleCheck size={14} className="text-success" /> Adherence ≥ 75%
              </li>
              <li className="flex items-center gap-2">
                <CircleCheck size={14} className="text-success" /> Provider approval
              </li>
              <li className="flex items-center gap-2">
                <CircleCheck size={14} className="text-success" /> Labs current within 90d
              </li>
            </ul>
          </Card>

          <Button className="w-full" icon={<Save size={15} />}>
            Save draft
          </Button>
          <Button variant="secondary" className="w-full" icon={<ClipboardList size={15} />}>
            Assign to patient
          </Button>
        </div>
      </div>
    </>
  );
}

function Step({ done, active, label }: { done?: boolean; active?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-bodySm">
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full ${
          done ? 'bg-primary text-primary-on' : active ? 'bg-primary-soft text-primary' : 'bg-surface-sunken text-ink-muted'
        }`}
      >
        {done ? '✓' : active ? <CircleDot size={11} /> : ''}
      </div>
      <span className={active ? 'font-semibold text-ink' : done ? 'text-ink-secondary' : 'text-ink-muted'}>
        {label}
      </span>
    </div>
  );
}
