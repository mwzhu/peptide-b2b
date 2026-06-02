import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { Button, Field, Input } from '../components/ui';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('mara.reyes@solstice.health');
  const [password, setPassword] = useState('demo-access');

  return (
    <div className="flex h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-primary p-12 lg:flex">
        <div
          className="absolute inset-0 opacity-60"
          style={{ background: 'radial-gradient(120% 80% at 20% 0%, #869A6C 0%, transparent 60%)' }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-on/15">
            <Compass size={20} className="text-primary-on" />
          </div>
          <span className="font-display text-h3 text-primary-on">Beacon</span>
        </div>
        <div className="relative">
          <h1 className="font-display text-display leading-tight text-primary-on">
            Peptide care, beautifully coordinated.
          </h1>
          <p className="mt-4 max-w-md text-body text-primary-on/80">
            Build protocols, monitor adherence, triage symptoms, and keep every patient's
            journey in view — all in one calm console.
          </p>
        </div>
        <div className="relative flex gap-8">
          {[
            ['148', 'Active patients'],
            ['93%', 'Avg adherence'],
            ['4.2h', 'Response time'],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="font-display text-h2 text-primary-on">{v}</p>
              <p className="text-caption text-primary-on/70">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center bg-canvas p-8">
        <div className="w-full max-w-sm">
          <p className="text-overline font-semibold uppercase tracking-wide text-ink-muted">
            Provider Console
          </p>
          <h2 className="mt-1 font-display text-h1 text-ink">Welcome back</h2>
          <p className="mt-2 text-bodySm text-ink-muted">
            Sign in to your Solstice Wellness clinic account.
          </p>

          <form
            className="mt-8 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Password">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <Button type="submit" className="mt-2 w-full" icon={<ArrowRight size={17} />}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-caption text-ink-muted">
            This is a demonstration environment. Multi-factor authentication is required on
            production clinic accounts.
          </p>
        </div>
      </div>
    </div>
  );
}
