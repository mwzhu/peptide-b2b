import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Loading,
  PageHeader,
  Tabs,
  Textarea,
} from '../components/ui';
import { formatTime, fullName, relativeTime, titleCase } from '../lib/format';
import { usePatients, useSendMessage, useStaff, useThread, useThreads } from '../lib/hooks';

export function Messages() {
  const threads = useThreads();
  const patients = usePatients();
  const staff = useStaff();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [filter, setFilter] = useState<'inbox' | 'urgent' | 'mine' | 'all'>('inbox');

  if (!threads.data || !patients.data) return <Loading />;

  const patientById = (id: string) => patients.data.find((p) => p.id === id);
  const sorted = [...threads.data].sort(
    (a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt),
  );
  const filtered = sorted.filter((t) => {
    if (filter === 'inbox') return t.unread || t.urgent;
    if (filter === 'urgent') return t.urgent;
    if (filter === 'mine') return t.assignedToId === 'staff_reyes';
    return true;
  });

  const selectedId = routeId ?? filtered[0]?.id;
  const counts = {
    inbox: sorted.filter((t) => t.unread || t.urgent).length,
    urgent: sorted.filter((t) => t.urgent).length,
    mine: sorted.filter((t) => t.assignedToId === 'staff_reyes').length,
    all: sorted.length,
  };

  return (
    <>
      <PageHeader title="Messages" subtitle="Inbox" />
      <Tabs
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: 'inbox', label: 'Inbox', count: counts.inbox },
          { value: 'urgent', label: 'Urgent', count: counts.urgent },
          { value: 'mine', label: 'Assigned to me', count: counts.mine },
          { value: 'all', label: 'All', count: counts.all },
        ]}
      />

      <div className="mt-6 grid grid-cols-[1fr_1.6fr] gap-5">
        {/* List */}
        <Card>
          {filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-bodySm text-ink-muted">No threads.</p>
          ) : (
            filtered.map((t, idx) => {
              const p = patientById(t.patientId);
              const isActive = selectedId === t.id;
              const last = t.messages[t.messages.length - 1];
              return (
                <button
                  key={t.id}
                  onClick={() => navigate(`/messages/${t.id}`)}
                  className={`w-full text-left px-5 py-4 ${idx > 0 ? 'border-t border-border' : ''} ${
                    isActive ? 'bg-primary-soft/60' : 'hover:bg-sand-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {p && <Avatar name={fullName(p)} hue={p.avatarHue} size={36} />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-ink">{p ? fullName(p) : 'Unknown'}</p>
                        {t.urgent && <Badge tone="danger">Urgent</Badge>}
                        {t.unread && (
                          <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-accent" />
                        )}
                      </div>
                      <p className="truncate text-bodySm text-ink">{t.subject}</p>
                      <p className="mt-0.5 truncate text-caption text-ink-muted">
                        {last?.authorRole === 'patient' ? '' : 'You: '}
                        {last?.body}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-caption text-ink-muted">
                        <Badge tone="neutral">{titleCase(t.category)}</Badge>
                        <span>· {relativeTime(t.lastMessageAt)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </Card>

        {/* Thread */}
        {selectedId ? <ThreadReader threadId={selectedId} /> : <Card className="p-10"><p className="text-center text-ink-muted">Select a thread.</p></Card>}
      </div>
    </>
  );
}

function ThreadReader({ threadId }: { threadId: string }) {
  const thread = useThread(threadId);
  const patients = usePatients();
  const staff = useStaff();
  const sendMessage = useSendMessage();
  const [draft, setDraft] = useState('');

  if (!thread.data || !patients.data) return <Loading />;
  const t = thread.data;
  const patient = patients.data.find((p) => p.id === t.patientId);
  const staffName = (id: string) =>
    id === t.patientId ? (patient ? fullName(patient) : 'Patient') : staff.data?.find((s) => s.id === id)?.name ?? 'Care team';
  const staffHue = (id: string) =>
    id === t.patientId ? patient?.avatarHue ?? 0 : staff.data?.find((s) => s.id === id)?.avatarHue ?? 160;

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    sendMessage.mutate({ threadId: t.id, body });
  };

  return (
    <Card className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-5">
        <div className="flex items-center gap-3">
          {patient && <Avatar name={fullName(patient)} hue={patient.avatarHue} size={40} />}
          <div>
            <Link
              to={patient ? `/patients/${patient.id}` : '#'}
              className="font-display text-h3 text-ink hover:underline"
            >
              {patient ? fullName(patient) : 'Unknown'}
            </Link>
            <p className="text-bodySm text-ink-muted">{t.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{titleCase(t.category)}</Badge>
          {t.urgent && <Badge tone="danger">Urgent</Badge>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {t.messages.map((m) => {
          const mine = m.authorRole === 'staff';
          return (
            <div key={m.id} className={`flex gap-2.5 ${mine ? 'flex-row-reverse' : ''}`}>
              <Avatar name={staffName(m.authorId)} hue={staffHue(m.authorId)} size={32} />
              <div className={`max-w-[72%] ${mine ? 'text-right' : ''}`}>
                {!mine && (
                  <p className="mb-1 text-caption font-medium text-ink-muted">{staffName(m.authorId)}</p>
                )}
                <div
                  className={`inline-block rounded-2xl px-3.5 py-2.5 text-bodySm ${
                    mine
                      ? 'bg-primary text-primary-on rounded-br-md'
                      : 'bg-surface-sunken text-ink rounded-bl-md'
                  }`}
                >
                  {m.body}
                </div>
                <p className="mt-1 text-caption text-ink-muted">
                  {formatTime(m.sentAt)} · {relativeTime(m.sentAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="border-t border-border p-4">
        <div className="flex items-end gap-3">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Reply to patient…"
            className="flex-1"
          />
          <Button onClick={send} disabled={!draft.trim()} icon={<Send size={15} />}>
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
}
