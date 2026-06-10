import { NavLink, Outlet } from 'react-router-dom';
import {
  Boxes,
  ChevronDown,
  ClipboardList,
  Compass,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { Avatar } from './ui';
import { useClinic, useStaff, useThreads } from '../lib/hooks';

interface NavItem {
  to: string;
  label: string;
  Icon: typeof LayoutDashboard;
  end?: boolean;
  badge?: 'messages';
}

// Triage cases surface inside "Needs attention" on the Dashboard; the standalone
// /triage route still exists for deep-links but isn't promoted in the sidebar.
const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/patients', label: 'Patients', Icon: Users },
  { to: '/protocols', label: 'Protocols', Icon: ClipboardList },
  { to: '/inventory', label: 'Inventory', Icon: Boxes },
  { to: '/messages', label: 'Messages', Icon: MessageSquare, badge: 'messages' },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

export function AppShell() {
  const clinic = useClinic();
  const staff = useStaff();
  const threads = useThreads();

  const counts: Record<string, number> = {
    messages: threads.data?.filter((t) => t.unread).length ?? 0,
  };

  const owner = staff.data?.find((s) => s.role === 'clinic_owner');

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* Sidebar */}
      <aside className="flex w-[244px] shrink-0 flex-col border-r border-border bg-surface">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Compass size={20} className="text-primary-on" />
          </div>
          <div>
            <p className="font-display text-h3 leading-none text-ink">Beacon</p>
            <p className="text-caption text-ink-muted">Provider Console</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {NAV.map(({ to, label, Icon, badge, end }) => {
            const count = badge ? counts[badge] ?? 0 : 0;
            return (
              <NavLink
                key={to}
                to={to}
                end={end ?? false}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-bodySm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-soft text-sage-700'
                      : 'text-ink-secondary hover:bg-sand-100',
                  )
                }
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {count > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-overline font-semibold text-accent-on">
                    {count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Clinic / user */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            {owner && <Avatar name={owner.name} hue={owner.avatarHue} size={38} />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-bodySm font-semibold text-ink">{owner?.name ?? 'Provider'}</p>
              <p className="truncate text-caption text-ink-muted">{owner?.title}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
          <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-bodySm text-ink-secondary hover:bg-sand-100">
            <span className="font-semibold text-ink">{clinic.data?.name ?? 'Clinic'}</span>
            <span className="text-ink-muted">· {clinic.data?.locations[0]?.name}</span>
            <ChevronDown size={15} className="text-ink-muted" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1180px] px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
