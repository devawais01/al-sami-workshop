-- ============================================================
-- 003 — Derived views
--
-- security_invoker = on is REQUIRED on all of these. Without it a
-- view executes with its owner's privileges and silently bypasses
-- every RLS policy in 004. That would leave the tables locked and
-- the views wide open.
-- ============================================================

-- What each artisan holds, per lot.
create view worker_balance with (security_invoker = on) as
select
  workshop_id, worker_id, lot_id,
  sum(case when kind = 'issue'  then qty else 0 end)::int  as issued,
  sum(case when kind = 'return' then qty else 0 end)::int  as returned,
  sum(case when kind = 'issue'  then qty else -qty end)::int as pending
from entry
where deleted_at is null
group by workshop_id, worker_id, lot_id;

-- One outstanding number per artisan — drives the badge on the list.
create view worker_pending with (security_invoker = on) as
select workshop_id, worker_id, sum(pending)::int as pending
from worker_balance
group by workshop_id, worker_id;

-- Lot progress, with DERIVED status.
--
-- A lot counts as closed when everything went out and everything came
-- back. Deriving it rather than storing it means that raising a lot's
-- total automatically reopens it, instead of leaving it stuck closed.
create view lot_summary with (security_invoker = on) as
select
  l.id as lot_id,
  l.workshop_id,
  l.dress_id,
  l.lot_number,
  d.name       as dress_name,
  d.photo_path as dress_photo,
  l.total_pieces,
  coalesce(sum(case when e.kind = 'issue'  then e.qty else 0 end), 0)::int   as issued,
  coalesce(sum(case when e.kind = 'return' then e.qty else 0 end), 0)::int   as returned,
  coalesce(sum(case when e.kind = 'issue'  then e.qty else -e.qty end), 0)::int as pending,
  case
    when l.status = 'band' then 'band'
    when l.total_pieces is not null
     and coalesce(sum(case when e.kind = 'issue' then e.qty else 0 end), 0) >= l.total_pieces
     and coalesce(sum(case when e.kind = 'issue' then e.qty else -e.qty end), 0) = 0
      then 'band'
    else 'chalu'
  end as status
from lot l
join dress d on d.id = l.dress_id
left join entry e on e.lot_id = l.id and e.deleted_at is null
group by l.id, d.name, d.photo_path;

-- Most recent event per artisan — orders the contact list.
create view worker_last_activity with (security_invoker = on) as
select distinct on (worker_id)
  worker_id, workshop_id, kind, qty, happened_at, lot_id
from entry
where deleted_at is null
order by worker_id, happened_at desc;
