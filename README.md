# Beacon

A peptide tracking platform for medspas and health clinics — three surfaces:

- **Patient mobile app** (Expo / React Native) — onboarding, protocol, reconstitution
  calculator with visual syringe, vial & beyond-use-date tracking, dose logging with
  injection-site rotation, symptoms, outcomes, labs, refills, appointments, education,
  messaging.
- **Provider/admin console** (Vite + React) — dashboard worklists, patient roster &
  longitudinal profile, protocol library & builder, triage inbox, refill queue with the
  dual fulfillment-path workflow, inventory ledger, unified messaging, analytics, clinic
  administration & audit log.
- **Marketing site** (Vite + React) — public landing page geared toward clinics: hero,
  the dosing-engine moat, features, two-sided story, compliance, pricing, FAQ.

The product positioning, scope, decisions, and technical architecture live in
[`PRD.md`](./PRD.md) and [`TECHNICAL_ARCHITECTURE.md`](./TECHNICAL_ARCHITECTURE.md).

> **This is a frontend-only prototype.** Data comes from a typed mock layer in
> `packages/mock-data`. The reconstitution & dosing math in `packages/calculations` is
> real, pure, and unit-tested — the rest of the data layer is in-memory and resets on
> reload.

---

## Project layout

```
beacon/
  apps/
    mobile/        Expo patient app (Expo Router, NativeWind)
    web/           Vite provider/admin SPA (React Router, Tailwind)
    marketing/     Vite marketing site (clinic-facing landing page)
  packages/
    theme/         design tokens — shared between Tailwind and NativeWind
    domain/        shared TypeScript types (every entity the UI renders)
    calculations/  real reconstitution / supply / BUD math (decimal-precise, tested)
    mock-data/     fixtures, in-memory store, async mock API
  PRD.md
  TECHNICAL_ARCHITECTURE.md
```

## Prerequisites

- Node 20+ (built against Node 24)
- pnpm 11 (`npm i -g pnpm` if missing)
- For the mobile app: Xcode + iOS Simulator on macOS, **or** the
  [Expo Go](https://expo.dev/client) app on a physical phone

## Install

```bash
pnpm install
```

## Run

```bash
# Marketing / landing site for clinics (opens http://localhost:5174)
pnpm landing

# Provider/admin web (opens http://localhost:5173)
pnpm web

# Patient app — launches the Expo dev server.
# Press `i` to open the iOS Simulator, or scan the QR with Expo Go on a real device.
pnpm mobile
```

## Verify

```bash
# The dosing engine — pure functions, golden + property tests
pnpm test

# Typecheck every workspace package
pnpm typecheck

# Production build of the web app
pnpm --filter @beacon/web build
```

## How the seamless integration works (and its prototype caveat)

The architecture is built around a shared set of synced objects (PRD §6). In this
frontend-only build, both apps consume the same `@beacon/mock-data` fixtures, so the
clinic, patients, protocols, vials, refills, etc. you see are identical across the two
apps.

Mutations (logging a dose, requesting a refill, replying to a message) write to an
in-memory store inside each running app. Because the mobile app and the web app are
separate processes, **mutations don't propagate between them in real time** — that's the
job of the backend (transactional outbox + WebSocket invalidation pattern described in
`TECHNICAL_ARCHITECTURE.md` §10 and §5.2). The seed state, however, is consistent; you
can walk the same patient end-to-end across both apps to see how each side surfaces the
same data.

## What's real, what's mocked

| Module | State |
|---|---|
| `packages/calculations` — reconstitution, units, supply projection, BUD | **Real**, pure, decimal-precise, golden + property tested |
| `packages/domain` — TypeScript types for every entity | Real |
| `packages/theme` — design tokens, Tailwind preset | Real |
| `packages/mock-data` — fixtures + async API + in-memory store | Mocked (typed) — production swaps in a real REST client without touching call sites |
| Native push notifications, telehealth video, payment processing, pharmacy fulfillment | Out of scope this phase |

## Stack

| Layer | Choice |
|---|---|
| Patient mobile | React Native + Expo Router + NativeWind v4 + react-native-svg |
| Provider web | React + Vite + React Router + Tailwind v3 + Recharts |
| Data layer (both) | TanStack Query against the mock API |
| Shared math | `decimal.js` for clinical arithmetic (no floats) |

## Design direction

"Wellness & premium" — warm sand canvas, soft contrast, muted sage primary, clay accent,
generous radii, Fraunces serif paired with Inter. See `packages/theme/src/tokens.ts`.

---

Built phase-by-phase from the plan at `~/.claude/plans/fizzy-wibbling-cat.md`.
# peptide-b2b
