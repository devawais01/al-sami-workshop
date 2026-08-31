# Database migrations

Run these in order in the Supabase SQL Editor against a fresh project.
Together they reproduce the complete schema: tables, indexes, helper
functions, derived views, row-level security, storage buckets, and
realtime publication.

| File | Contents |
|---|---|
| `001_tables.sql` | Six tables, unique indexes, performance indexes |
| `002_functions.sql` | `security definer` helpers used by every policy |
| `003_views.sql` | `worker_balance`, `worker_pending`, `lot_summary`, `worker_last_activity` |
| `004_policies.sql` | RLS enabled and policied on all six tables |
| `005_storage.sql` | Three private buckets and their path-scoped policies |
| `006_realtime.sql` | Realtime publication, schema reload |
| `007_seed.sql` | Workshop row and admin membership — edit before running |

## Order matters

`002` must run before `003` and `004`, because the views and policies
call those functions. `007` must run after you have created the auth
users it references.

## Two things that are easy to get wrong

**`security_invoker = on` on every view.** In Postgres a view executes
with its owner's privileges by default, which means it ignores RLS
entirely. Omitting this leaves the tables locked and the views public.

**`workshop_member`'s read policy checks `auth.uid()` directly** rather
than calling `my_workshops()`. That function reads `workshop_member`,
so routing the policy through it would recurse.

## Verifying after a run

```sql
-- Every table must report true.
select tablename, rowsecurity from pg_tables
where schemaname = 'public' order by tablename;

-- All six helper functions should be listed.
select routine_name from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'my_workshops', 'my_workshops_writable', 'my_workshops_admin',
    'my_workshops_text', 'am_i_admin', 'list_members'
  );
```

Then create a throwaway user, leave them out of `workshop_member`, and
confirm `select * from worker` returns zero rows for them. That test is
the only thing that actually proves the data is private.

## Edge Functions

Not included here — deploy separately from `supabase/functions/`:

- **`add-user`** — creates accounts. Holds the service role key, and
  verifies the caller is an admin before acting.
- **`ping`** — cheap read that keeps the free-tier project from pausing.
  Disable JWT verification on this one so the uptime monitor can reach it.
