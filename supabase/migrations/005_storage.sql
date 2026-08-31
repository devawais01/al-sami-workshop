-- ============================================================
-- 005 — Storage buckets and policies
--
-- Path convention the client MUST follow:
--     {workshop_id}/{random-uuid}.jpg
-- The first folder segment is what these policies check.
-- ============================================================

insert into storage.buckets (id, name, public) values
  ('worker-photos', 'worker-photos', false),
  ('design-photos', 'design-photos', false),
  ('entry-photos',  'entry-photos',  false)
on conflict (id) do nothing;

create policy storage_read on storage.objects
  for select using (
    bucket_id in ('worker-photos', 'design-photos', 'entry-photos')
    and (storage.foldername(name))[1] in (select my_workshops_text())
  );

create policy storage_write on storage.objects
  for insert with check (
    bucket_id in ('worker-photos', 'design-photos', 'entry-photos')
    and (storage.foldername(name))[1] in (select my_workshops_text())
  );

create policy storage_delete on storage.objects
  for delete using (
    bucket_id in ('worker-photos', 'design-photos', 'entry-photos')
    and (storage.foldername(name))[1] in (select my_workshops_text())
  );
