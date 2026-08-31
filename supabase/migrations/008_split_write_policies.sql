-- ============================================================
-- 008 — Split write policies by role
--
-- Insert and update: admin + malik.
-- Delete: admin only.
-- Previously these were single `for all` policies, which meant any
-- member could delete records.
-- ============================================================

create or replace function my_workshops_writable()
returns setof uuid
language sql stable security definer set search_path = public
as $$
  select workshop_id from workshop_member
  where user_id = auth.uid() and role in ('admin', 'malik')
$$;

drop policy if exists worker_write on worker;
create policy worker_write  on worker for insert with check (workshop_id in (select my_workshops_writable()));
create policy worker_update on worker for update using (workshop_id in (select my_workshops_writable())) with check (workshop_id in (select my_workshops_writable()));
create policy worker_delete on worker for delete using (workshop_id in (select my_workshops_admin()));

drop policy if exists dress_write on dress;
create policy dress_write  on dress for insert with check (workshop_id in (select my_workshops_writable()));
create policy dress_update on dress for update using (workshop_id in (select my_workshops_writable())) with check (workshop_id in (select my_workshops_writable()));
create policy dress_delete on dress for delete using (workshop_id in (select my_workshops_admin()));

drop policy if exists lot_write on lot;
create policy lot_write  on lot for insert with check (workshop_id in (select my_workshops_writable()));
create policy lot_update on lot for update using (workshop_id in (select my_workshops_writable())) with check (workshop_id in (select my_workshops_writable()));
create policy lot_delete on lot for delete using (workshop_id in (select my_workshops_admin()));

drop policy if exists entry_write on entry;
create policy entry_insert on entry for insert with check (workshop_id in (select my_workshops_writable()));
create policy entry_update on entry for update using (workshop_id in (select my_workshops_writable())) with check (workshop_id in (select my_workshops_writable()));
create policy entry_delete on entry for delete using (workshop_id in (select my_workshops_admin()));

notify pgrst, 'reload schema';