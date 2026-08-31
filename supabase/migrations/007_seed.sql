-- ============================================================
-- 007 — Seed (template, run manually)
--
-- Run this AFTER creating your admin accounts in the dashboard:
--   Authentication > Users > Add user
--   Tick "Auto Confirm User" so no email verification is needed.
--
-- Replace the workshop name and the emails below before running.
-- ============================================================

insert into workshop (name) values ('Al-Sami Workshop');

-- Admins: can manage users as well as all data.
insert into workshop_member (workshop_id, user_id, role)
select w.id, u.id, 'admin'
from workshop w, auth.users u
where w.name = 'Al-Sami Workshop'
  and u.email in (
    'first-admin@example.com',
    'second-admin@example.com'
  );

-- Verify. Every listed email should appear with its role.
select u.email, m.role
from workshop_member m
join auth.users u on u.id = m.user_id
order by m.role, u.email;
