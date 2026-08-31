-- ============================================================
-- 002 — Helper functions
--
-- These are SECURITY DEFINER so they can read workshop_member
-- without tripping over that table's own RLS policy, which would
-- otherwise recurse infinitely.
-- ============================================================

-- Every workshop the caller belongs to, any role.
create or replace function my_workshops()
returns setof uuid
language sql stable security definer set search_path = public
as $$
  select workshop_id from workshop_member where user_id = auth.uid()
$$;

-- Workshops where the caller may write data.
create or replace function my_workshops_writable()
returns setof uuid
language sql stable security definer set search_path = public
as $$
  select workshop_id from workshop_member
  where user_id = auth.uid() and role in ('admin', 'malik')
$$;

-- Workshops where the caller may manage users.
create or replace function my_workshops_admin()
returns setof uuid
language sql stable security definer set search_path = public
as $$
  select workshop_id from workshop_member
  where user_id = auth.uid() and role = 'admin'
$$;

-- Same list as text, for matching against storage folder names.
create or replace function my_workshops_text()
returns setof text
language sql stable security definer set search_path = public
as $$
  select workshop_id::text from workshop_member where user_id = auth.uid()
$$;

create or replace function am_i_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from workshop_member
    where user_id = auth.uid() and role = 'admin'
  )
$$;

-- Member list with emails. auth.users is not readable from the browser,
-- so this reads it under definer rights — but its own WHERE clause
-- returns nothing unless the caller is an admin of that workshop.
create or replace function list_members()
returns table (id uuid, user_id uuid, role text, email text)
language sql stable security definer set search_path = public, auth
as $$
  select m.id, m.user_id, m.role, u.email::text
  from workshop_member m
  join auth.users u on u.id = m.user_id
  where m.workshop_id in (
    select workshop_id from workshop_member
    where user_id = auth.uid() and role = 'admin'
  )
  order by m.role, u.email
$$;

revoke all on function list_members() from public;
grant execute on function list_members() to authenticated;
