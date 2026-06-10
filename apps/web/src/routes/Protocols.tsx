import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Search, Sparkles, Users } from 'lucide-react';
import type { PeptideCategory } from '@beacon/domain';
import { Badge, Button, Card, Loading, PageHeader, Select } from '../components/ui';
import { useProducts, useProtocolTemplates } from '../lib/hooks';

const CATEGORY_TONE = {
  weight_loss: 'brand',
  recovery: 'success',
  aesthetics: 'warning',
  longevity: 'accent',
  muscle: 'info',
  cognitive: 'neutral',
} as const;

const CATEGORY_LABEL: Record<PeptideCategory, string> = {
  weight_loss: 'Weight Loss',
  recovery: 'Recovery',
  aesthetics: 'Aesthetics',
  longevity: 'Longevity',
  muscle: 'Muscle',
  cognitive: 'Cognitive',
};

/** Display order for the category filter chips. */
const CATEGORY_ORDER: PeptideCategory[] = [
  'weight_loss',
  'recovery',
  'aesthetics',
  'longevity',
  'muscle',
  'cognitive',
];

type SortKey = 'popular' | 'name' | 'shortest' | 'longest';

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'popular', label: 'Most assigned' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'shortest', label: 'Shortest program' },
  { value: 'longest', label: 'Longest program' },
];

export function Protocols() {
  const templates = useProtocolTemplates();
  const products = useProducts();
  const [category, setCategory] = useState<PeptideCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('popular');

  const productName = (id: string) =>
    products.data?.find((p) => p.id === id)?.shortName ?? '';

  /** Counts per category, used to label the filter chips and hide empty ones. */
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of templates.data ?? []) map[t.category] = (map[t.category] ?? 0) + 1;
    return map;
  }, [templates.data]);

  const rows = useMemo(() => {
    if (!templates.data) return [];
    const q = search.trim().toLowerCase();
    const filtered = templates.data.filter((t) => {
      if (category !== 'all' && t.category !== category) return false;
      if (!q) return true;
      const haystack = [
        t.name,
        t.summary,
        CATEGORY_LABEL[t.category],
        ...t.items.map((it) => productName(it.productId)),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'shortest':
          return a.durationWeeks - b.durationWeeks;
        case 'longest':
          return b.durationWeeks - a.durationWeeks;
        case 'popular':
        default:
          return b.timesAssigned - a.timesAssigned;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates.data, products.data, category, search, sort]);

  if (!templates.data) return <Loading />;

  const chips: { value: PeptideCategory | 'all'; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: templates.data.length },
    ...CATEGORY_ORDER.filter((c) => counts[c]).map((c) => ({
      value: c,
      label: CATEGORY_LABEL[c],
      count: counts[c] ?? 0,
    })),
  ];

  return (
    <>
      <PageHeader
        title="Protocol library"
        subtitle="Protocols"
        actions={
          <>
            <Link to="/protocols/builder">
              <Button variant="secondary" icon={<Plus size={16} />}>
                New template
              </Button>
            </Link>
            <Link to="/protocols/generate">
              <Button icon={<Sparkles size={16} />}>Generate</Button>
            </Link>
          </>
        }
      />

      {/* Toolbar: category filter + sort + search */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as PeptideCategory | 'all')}
            className="w-full rounded-full sm:w-52"
            aria-label="Filter by category"
          >
            {chips.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label} ({c.count})
              </option>
            ))}
          </Select>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-44 rounded-full"
            aria-label="Sort protocols"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="text"
            placeholder="Search protocols or peptides…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-surface py-2 pl-9 pr-3 text-bodySm outline-none focus:border-primary"
          />
        </div>
      </div>

      <p className="mb-3 text-caption text-ink-muted">
        {rows.length} {rows.length === 1 ? 'protocol' : 'protocols'}
        {category !== 'all' && ` in ${CATEGORY_LABEL[category]}`}
      </p>

      {rows.length === 0 ? (
        <Card className="p-12 text-center text-bodySm text-ink-muted">
          No protocols match your search.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((t) => {
            const peptides = t.items.map((it) => productName(it.productId)).filter(Boolean);
            return (
              <Link key={t.id} to={`/protocols/${t.id}`}>
                <Card className="flex h-full flex-col p-4 transition-colors hover:border-primary/40 hover:bg-sand-100">
                  <div className="flex items-start justify-between gap-2">
                    <Badge tone={CATEGORY_TONE[t.category]}>{CATEGORY_LABEL[t.category]}</Badge>
                    <span className="inline-flex items-center gap-1 text-caption text-ink-muted">
                      <Users size={13} /> {t.timesAssigned}
                    </span>
                  </div>

                  <div className="mt-2 flex items-start gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                      <ClipboardList size={17} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-h3 leading-snug text-ink">{t.name}</h3>
                    </div>
                  </div>

                  <p className="mt-2 line-clamp-2 text-bodySm text-ink-muted">{t.summary}</p>

                  <div className="mt-auto pt-3">
                    <p
                      className="truncate text-caption text-ink-secondary"
                      title={peptides.join(' · ')}
                    >
                      {peptides.join(' · ')}
                    </p>
                    <p className="mt-1 text-caption text-ink-muted">
                      {t.durationWeeks} wk program · {t.items.length}{' '}
                      {t.items.length === 1 ? 'peptide' : 'peptides'}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
