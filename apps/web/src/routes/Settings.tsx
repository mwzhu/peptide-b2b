import { useState } from 'react';
import { Building2, Hash, MapPin, Palette, Pill, Plus, Shield, UserCog } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Field,
  Input,
  Loading,
  PageHeader,
  Tabs,
  Textarea,
} from '../components/ui';
import { formatCurrency, formatShortDate, formatTime, titleCase } from '../lib/format';
import {
  useAuditEvents,
  useClinic,
  useProducts,
  useStaff,
} from '../lib/hooks';

type TabValue = 'team' | 'locations' | 'branding' | 'products' | 'audit';

export function Settings() {
  const [tab, setTab] = useState<TabValue>('team');
  const clinic = useClinic();
  const staff = useStaff();
  const products = useProducts();
  const audit = useAuditEvents();

  if (!clinic.data) return <Loading />;

  return (
    <>
      <PageHeader title="Clinic settings" subtitle="Administration" />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'team', label: 'Team' },
          { value: 'locations', label: 'Locations' },
          { value: 'branding', label: 'Branding' },
          { value: 'products', label: 'Product catalog' },
          { value: 'audit', label: 'Audit log' },
        ]}
      />

      <div className="mt-6">
        {tab === 'team' && (
          <Card>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <UserCog size={18} className="text-primary" />
                <p className="font-display text-h3 text-ink">Providers & staff</p>
              </div>
              <Button icon={<Plus size={15} />}>Invite teammate</Button>
            </div>
            {(staff.data ?? []).map((s, idx) => (
              <div
                key={s.id}
                className={`grid grid-cols-[2fr_1.4fr_1fr_1fr_0.5fr] items-center gap-4 px-5 py-3.5 ${
                  idx > 0 ? 'border-t border-border' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={s.name} hue={s.avatarHue} size={36} />
                  <div>
                    <p className="font-semibold text-ink">{s.name}</p>
                    <p className="text-caption text-ink-muted">{s.email}</p>
                  </div>
                </div>
                <span className="text-bodySm text-ink">{s.title}</span>
                <Badge tone="brand">{titleCase(s.role)}</Badge>
                <span className="text-caption text-ink-muted">
                  {s.licensedStates.length > 0 ? `Licensed in ${s.licensedStates.join(', ')}` : '—'}
                </span>
                <Badge tone={s.active ? 'success' : 'neutral'}>{s.active ? 'Active' : 'Disabled'}</Badge>
              </div>
            ))}
          </Card>
        )}

        {tab === 'locations' && (
          <Card>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                <p className="font-display text-h3 text-ink">Clinic locations</p>
              </div>
              <Button icon={<Plus size={15} />}>Add location</Button>
            </div>
            {clinic.data.locations.map((l, idx) => (
              <div
                key={l.id}
                className={`flex items-center gap-4 px-5 py-4 ${idx > 0 ? 'border-t border-border' : ''}`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft">
                  <Building2 size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-ink">{l.name}</p>
                  <p className="text-caption text-ink-muted">
                    {l.city}, {l.state}
                  </p>
                </div>
                <Badge tone="success" dot>
                  Operating
                </Badge>
              </div>
            ))}
          </Card>
        )}

        {tab === 'branding' && (
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-5">
                <Field label="Clinic name">
                  <Input defaultValue={clinic.data.name} />
                </Field>
                <Field label="Tagline">
                  <Input defaultValue={clinic.data.tagline} />
                </Field>
                <Field label="Brand color">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl border border-border"
                      style={{ backgroundColor: clinic.data.brandColor }}
                    />
                    <Input defaultValue={clinic.data.brandColor} className="font-mono" />
                  </div>
                </Field>
                <Field label="Welcome message (shown in patient onboarding)">
                  <Textarea defaultValue="Welcome to Solstice Wellness. We're delighted you're here." />
                </Field>
              </div>
              <div>
                <div
                  className="aspect-[4/5] rounded-2xl p-6 text-primary-on"
                  style={{ background: `linear-gradient(135deg, ${clinic.data.brandColor}, #54663F)` }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-on/15">
                      <Palette size={16} />
                    </div>
                    <span className="font-display text-h3">{clinic.data.name}</span>
                  </div>
                  <p className="mt-12 font-display text-h1 leading-tight">
                    A calmer way to care for your peptide patients.
                  </p>
                  <p className="mt-3 text-bodySm opacity-80">{clinic.data.tagline}</p>
                </div>
                <p className="mt-3 text-caption text-ink-muted">Live preview of the patient app accent.</p>
              </div>
            </div>
          </Card>
        )}

        {tab === 'products' && (
          <Card>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Pill size={18} className="text-primary" />
                <p className="font-display text-h3 text-ink">Peptide catalog</p>
              </div>
              <Button icon={<Plus size={15} />}>Add product</Button>
            </div>
            <div className="grid grid-cols-[2fr_1fr_1fr_0.7fr_0.7fr_0.7fr] gap-4 border-b border-border px-5 py-3 text-overline font-semibold uppercase tracking-wide text-ink-muted">
              <span>Product</span>
              <span>Category</span>
              <span>Route</span>
              <span>Vial</span>
              <span>BUD</span>
              <span>Price</span>
            </div>
            {(products.data ?? []).map((p, idx) => (
              <div
                key={p.id}
                className={`grid grid-cols-[2fr_1fr_1fr_0.7fr_0.7fr_0.7fr] items-center gap-4 px-5 py-3.5 ${
                  idx > 0 ? 'border-t border-border' : ''
                }`}
              >
                <div>
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="text-caption text-ink-muted">{p.shortName}</p>
                </div>
                <Badge tone="brand">{titleCase(p.category)}</Badge>
                <span className="text-bodySm text-ink-secondary">{titleCase(p.route)}</span>
                <span className="text-bodySm text-ink">{p.vialAmount.value} {p.vialAmount.unit}</span>
                <span className="text-bodySm text-ink-secondary">{p.budDays}d</span>
                <span className="text-bodySm font-semibold text-ink">{formatCurrency(p.unitPriceUsd)}</span>
              </div>
            ))}
          </Card>
        )}

        {tab === 'audit' && (
          <Card>
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Shield size={18} className="text-primary" />
              <p className="font-display text-h3 text-ink">Audit log</p>
            </div>
            {(audit.data ?? []).map((e, idx) => (
              <div
                key={e.id}
                className={`flex items-center gap-4 px-5 py-3.5 ${idx > 0 ? 'border-t border-border' : ''}`}
              >
                <Hash size={14} className="text-ink-muted" />
                <div className="flex-1">
                  <p className="text-bodySm text-ink">
                    <span className="font-semibold">{e.actorName}</span>{' '}
                    <span className="text-ink-secondary">{e.action}</span>{' '}
                    <span className="text-ink">{e.resourceLabel}</span>
                  </p>
                  <p className="text-caption text-ink-muted">
                    {titleCase(e.actorRole)} · {formatShortDate(e.at)} at {formatTime(e.at)}
                  </p>
                </div>
                <Badge tone="neutral">{titleCase(e.resourceType)}</Badge>
              </div>
            ))}
          </Card>
        )}
      </div>
    </>
  );
}
