-- ============================================================
-- 001 — Tables and indexes
-- Al Sami Creation's — workshop record keeping
-- ============================================================

create table workshop (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

create table workshop_member (
  id           uuid primary key default gen_random_uuid(),
  workshop_id  uuid not null references workshop(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'malik'
               check (role in ('admin', 'malik', 'dekhne_wala')),
  created_at   timestamptz not null default now(),
  unique (workshop_id, user_id)
);

create table worker (
  id           uuid primary key default gen_random_uuid(),
  workshop_id  uuid not null references workshop(id) on delete cascade,
  name         text not null,
  phone        text not null,
  cnic         text,
  address      text,
  photo_path   text,
  notes        text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- A dress is the design. It owns many lots and is reused over time.
create table dress (
  id           uuid primary key default gen_random_uuid(),
  workshop_id  uuid not null references workshop(id) on delete cascade,
  name         text not null,
  photo_path   text,
  notes        text,
  created_at   timestamptz not null default now()
);

-- Case- and whitespace-insensitive, so "Z 208", "z 208 " and "Z 208"
-- cannot become three separate dresses and split the records.
create unique index dress_name_unique
  on dress (workshop_id, lower(trim(name)));

create table lot (
  id           uuid primary key default gen_random_uuid(),
  workshop_id  uuid not null references workshop(id) on delete cascade,
  dress_id     uuid not null references dress(id) on delete cascade,
  lot_number   text not null,
  total_pieces int,
  status       text not null default 'chalu' check (status in ('chalu', 'band')),
  opened_at    timestamptz not null default now(),
  closed_at    timestamptz,
  close_note   text,
  created_at   timestamptz not null default now()
);

-- Unique per dress, NOT per workshop: two designs may each run a "Lot 44".
create unique index lot_dress_number_unique
  on lot (dress_id, lot_number);

-- THE LEDGER. Append-only, soft-deleted. Every balance derives from this.
create table entry (
  id           uuid primary key default gen_random_uuid(),
  workshop_id  uuid not null references workshop(id) on delete cascade,
  worker_id    uuid not null references worker(id) on delete cascade,
  lot_id       uuid not null references lot(id) on delete cascade,
  kind         text not null check (kind in ('issue', 'return')),
  qty          int  not null default 1 check (qty > 0),
  note         text,
  photo_path   text,
  happened_at  timestamptz not null default now(),
  created_by   uuid references auth.users(id) default auth.uid(),
  deleted_at   timestamptz,
  created_at   timestamptz not null default now()
);

create index worker_workshop_idx on worker (workshop_id) where is_active;
create index dress_workshop_idx  on dress  (workshop_id);
create index lot_dress_idx       on lot    (dress_id);
create index lot_workshop_idx    on lot    (workshop_id, status);
create index entry_worker_idx    on entry  (worker_id, happened_at desc);
create index entry_lot_idx       on entry  (lot_id);
create index entry_workshop_idx  on entry  (workshop_id, happened_at desc);
