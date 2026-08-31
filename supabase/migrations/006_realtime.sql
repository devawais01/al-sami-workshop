-- ============================================================
-- 006 — Realtime
--
-- Enabled at the database level. The client subscription layer is
-- not yet wired up; see the Roadmap in README.md.
-- ============================================================

alter publication supabase_realtime add table entry;
alter publication supabase_realtime add table worker;

notify pgrst, 'reload schema';
