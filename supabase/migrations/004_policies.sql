-- ============================================================
-- 004 — Row Level Security
--
-- The repo is public and the publishable key ships in the client
-- bundle by design. RLS is therefore the ENTIRE access boundary,
-- not a secondary measure. Anyone can call the API with that key;
-- these policies are the only reason they get nothing back.
-- ============================================================

alter table workshop        enable row level security;
alter table workshop_member enable row level security;
alter table worker          enable row level security;
alter table dress           enable row level security;
alter table lot             enable row level security;
alter table entry           enable row level security;

-- ---------- workshop ----------
create policy workshop_read on workshop
  for select using (id in (select my_workshops()));

-- ---------- workshop_member ----------
-- Read your own row, or every row if you administer that workshop.
-- The self-check uses auth.uid() directly rather than my_workshops(),
-- because that function reads this same table.
create policy member_read on workshop_member
  for select using (
    user_id = auth.uid()
    or workshop_id in (select my_workshops_admin())
  );

-- Only admins create or remove members.
create policy member_write on workshop_member
  for all
  using      (workshop_id in (select my_workshops_admin()))
  with check (workshop_id in (select my_workshops_admin()));

-- ---------- worker ----------
create policy worker_read on worker
  for select using (workshop_id in (select my_workshops()));

create policy worker_write on worker
  for all
  using      (workshop_id in (select my_workshops_writable()))
  with check (workshop_id in (select my_workshops_writable()));

-- ---------- dress ----------
create policy dress_read on dress
  for select using (workshop_id in (select my_workshops()));

create policy dress_write on dress
  for all
  using      (workshop_id in (select my_workshops_writable()))
  with check (workshop_id in (select my_workshops_writable()));

-- ---------- lot ----------
create policy lot_read on lot
  for select using (workshop_id in (select my_workshops()));

create policy lot_write on lot
  for all
  using      (workshop_id in (select my_workshops_writable()))
  with check (workshop_id in (select my_workshops_writable()));

-- ---------- entry ----------
create policy entry_read on entry
  for select using (workshop_id in (select my_workshops()));

create policy entry_write on entry
  for all
  using      (workshop_id in (select my_workshops_writable()))
  with check (workshop_id in (select my_workshops_writable()));
