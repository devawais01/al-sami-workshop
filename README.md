<div align="center">

<img src="public/icon-512.png" alt="Al Sami Creation's" width="96" />

# Al Sami Creation's

**Workshop record-keeping, built for the people who actually run one.**

A mobile-first progressive web app that replaces the paper ledger in an embroidery workshop — tracking which artisan holds which dresses, from which lot, and how many are still out.

[![React](https://img.shields.io/badge/React-19-1A1817?style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-1A1817?style=flat-square)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-1A1817?style=flat-square)](https://vite.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-1A1817?style=flat-square)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%2017-1A1817?style=flat-square)](https://supabase.com)
[![PWA](https://img.shields.io/badge/PWA-installable-96742C?style=flat-square)](https://web.dev/progressive-web-apps/)

[**Live app**](https://al-sami-workshop.vercel.app)

</div>

---

## The problem

Al-Sami Creations runs an embroidery (*kadhai*) workshop. Dresses leave the premises in lots, go home with individual artisans (*karigars*), and come back finished — rarely all at once, often weeks apart, frequently in partial batches.

The entire record lived in a paper diary. That worked, but it meant:

- No way to answer *"how many pieces does Aslam still have?"* without reading back through months of entries
- No way to see a lot's progress without tallying by hand
- No way for anyone but the person holding the diary to check anything
- One spilled cup of tea away from losing the lot

The brief was to replace it with something a non-technical user would actually reach for instead of the diary — a considerably harder bar than simply digitising the data.

## The approach

**The ledger is the chat.** Every issue and every return is one row in a single append-only table. Filter that table to one artisan, sort by time, and you have his conversation thread. Partial returns need no special handling. Balances are derived, never stored, so they cannot drift out of sync with the history that produced them.

**The interface speaks the user's language.** Every string is Roman Urdu — *Karigar*, *Baqaya*, *Dress diye*, *Wapis mile* — the way it is actually spoken and typed in Pakistan. All copy lives in one file, so wording can change without touching a line of logic.

**Scope was cut, deliberately.** No wage calculation, no payments, no damage tracking, no multi-stage workflow. The app replaces the diary and nothing more. The ledger already stores every fact a wage system would need, so that can be added later without disturbing anything that exists.

**One number, one place.** Reports answer *what happened during a period*. The artisan screens answer *what someone is holding right now*. These are deliberately never shown side by side, because issued-minus-returned within a date range is not the same as current holdings — and a report that quietly disagrees with the physical stock destroys trust in the entire system.

---

## Features

### Artisan management
- Contact list with photo, name, phone, and live outstanding count
- Full profile with CNIC, address, notes, and one-tap call or WhatsApp
- Instant search across name, phone, and CNIC
- Camera or gallery photo capture, compressed client-side before upload

### The ledger
- Chat-threaded history of every issue and return, colour-coded and grouped by day
- Issue sheet capped at available stock — cannot send out what is not there
- Return sheet lists only what that artisan actually holds, pre-filled to the full outstanding amount, so a complete return is two taps
- Backdating supported throughout, because entries are not always made the same day

### Lots and dresses
- A dress is a first-class entity owning many lots — the same design runs repeatedly over time
- Lot numbers unique per dress rather than globally, so two designs can each run a "Lot 44"
- Three-segment progress bar showing returned, still out, and remaining in store
- Lots close automatically when fully issued and fully returned, and reopen if the total is later revised
- Editable lot totals, floored at the quantity already issued

### Reporting
- Any period — one week, two weeks, one month, or a custom range
- Grouped by artisan, by lot, or by dress
- Timestamp-bounded filtering, inclusive of both end dates

### Access control
- Two roles: **admin**, who manages users, and **user**, who does everything else
- Admins provision accounts from inside the app via a server-side function
- Non-admins cannot see or reach user management — enforced in the database, not merely hidden in the UI

### Platform
- Installable to the home screen, opening full-screen with no browser chrome
- Responsive from a 360px phone to a desktop browser
- Session persistence — sign in once, not every morning

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  React 19 · Vite · TypeScript · Tailwind v4         │
│  TanStack Query for caching and invalidation        │
│  vite-plugin-pwa — service worker, manifest, icons  │
└────────────────────────┬────────────────────────────┘
                         │  supabase-js
┌────────────────────────┴────────────────────────────┐
│  Supabase                                           │
│                                                     │
│  Postgres 17    six tables, four views              │
│                 row-level security on every table   │
│  Auth           email + password, persisted session │
│  Storage        three private buckets, signed URLs  │
│  Edge Functions add-user (service role) · ping      │
└─────────────────────────────────────────────────────┘

Vercel          static hosting, auto-deploy on push to main
UptimeRobot     30-minute health checks, email alerts
GitHub Actions  weekly verified pg_dump, 90-day retention
```

### Data model

```
workshop ──┬── workshop_member ── auth.users
           │
           ├── worker
           │
           ├── dress ──── lot ────┐
           │                      │
           └────────── entry ─────┘
                    (worker + lot + kind + qty + timestamp)
```

`entry` is append-only and soft-deleted. Everything else is derived:

| View | Answers |
|---|---|
| `worker_balance` | What does each artisan hold, per lot? |
| `worker_pending` | One outstanding number per artisan — drives the badge |
| `lot_summary` | Issued, returned, pending, and derived open/closed status |
| `worker_last_activity` | Most recent event per artisan — orders the contact list |

All views are declared `security_invoker = on`. Without it, a view executes with its owner's privileges and silently bypasses every row-level policy beneath it.

### Security model

The repository is public and the Supabase publishable key ships inside the client bundle, as designed. Row-level security is therefore the entire access boundary rather than a secondary measure.

- RLS enabled on all six tables, with every policy resolving membership through `security definer` helper functions
- Write policies additionally require an `admin` or `malik` role
- `workshop_member` is writable only by admins, and its read policy checks `auth.uid()` directly to avoid recursion
- Storage policies validate that the first path segment matches the caller's workshop
- Account creation runs exclusively inside an Edge Function holding the service role key, which verifies the caller is an admin before acting and rolls back the created user if membership assignment fails
- The service role key exists only in Edge Function environment variables — never in the client, never in the repository

Verified by querying as an unaffiliated user and confirming zero rows returned across every table.

---

## Design

A monochrome palette drawn from the client's brand identity, with a single accent reserved for the one number that matters.

| Token | Value | Purpose |
|---|---|---|
| `chalk` | `#F5F4F1` | Page ground |
| `ink` | `#1A1817` | Primary text |
| `indigo` | `#262322` | Primary actions |
| `out` | `#A0442F` | Dresses issued, not yet returned |
| `sabz` | `#1E5F45` | Dresses returned |
| `brass` | `#96742C` | Outstanding count — the only colour that shouts |

Typography pairs **Fraunces** for the wordmark with **Inter** for the interface. Numerals are set tabular throughout, so quantities align in vertical columns instead of wobbling — this app is largely numbers in lists, and it shows.

The brand gold `#C6A45D` is retained at full saturation in the app icon, where it sits as a large fill on dark. Interface text and badges use a darkened `#96742C`, because the original manages only 2.2:1 contrast on white and is unreadable at small sizes in daylight.

---

## Getting started

### Prerequisites

- Node.js 20 or later
- A Supabase project
- A Vercel account for deployment

### Installation

```bash
git clone https://github.com/devawais01/al-sami-workshop.git
cd al-sami-workshop
npm install
```

### Environment

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_your_key
```

Both values come from **Supabase → Connect**. Never add the service role key here — it bypasses every security policy in the database.

### Database

Run the migrations in `supabase/migrations/` in order through the Supabase SQL Editor. This creates the tables, indexes, views, helper functions, RLS policies, and storage buckets.

Then deploy the Edge Functions:

```bash
supabase functions deploy add-user
supabase functions deploy ping
```

Disable JWT verification on `ping` so the uptime monitor can reach it.

### Development

```bash
npm run dev      # dev server with hot reload
npm run build    # type-check and production build
npm run preview  # serve the build — required to test PWA behaviour
```

The service worker only runs in a production build. `npm run dev` also skips type errors that `npm run build` enforces, so always build before shipping.

---

## Operations

**Uptime.** Supabase free-tier projects pause after seven days without a database query. An UptimeRobot monitor calls the `ping` Edge Function every 30 minutes, which touches the database and keeps the project awake. A second monitor watches the deployed app. Both alert by email.

**Backups.** A GitHub Actions workflow runs `pg_dump` every Sunday at 02:00 UTC and uploads a gzipped artifact retained for 90 days. The workflow fails deliberately if the dump is under 2 KB or missing the `worker` table — a backup that reports success while containing nothing is worse than no backup at all.

Backups are restore-verified: six tables, four views with security attributes intact, fourteen RLS policies, and all row data.

> **Note:** `pg_dump` covers the `public` schema only. Authentication accounts live in Supabase's `auth` schema and are not included. Recovery involves recreating admin accounts manually and re-running the membership inserts.

---

## Roadmap

Deliberately excluded from v1, and unblocked by the existing schema:

- **Per-piece wage tracking.** The ledger already records artisan, dress, quantity, and date. Adding rates means a snapshot column on returns, a payments table, and a new tab — with nothing built so far requiring rework.
- **Two-pane desktop layout.** The current desktop view is a widened mobile layout; a split view would suit larger screens better.
- **PDF and WhatsApp report export.** Sharing formatted plain text over WhatsApp is how reports actually circulate in this context.
- **Realtime sync.** Supabase Realtime is enabled on the `entry` table; the subscription layer is not yet wired up.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19, Vite 8, TypeScript |
| Styling | Tailwind CSS v4 |
| Data | TanStack Query |
| Icons | Lucide |
| Backend | Supabase — Postgres 17, Auth, Storage, Edge Functions |
| Images | browser-image-compression |
| Hosting | Vercel |
| Monitoring | UptimeRobot |
| Backups | GitHub Actions with `pg_dump` |

---

<div align="center">

Built for **Al-Sami Creations**

</div>
