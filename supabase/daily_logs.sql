create table if not exists public.daily_logs (
  date date primary key,
  no_alcohol boolean not null default false,
  food boolean not null default false,
  water boolean not null default false,
  no_screens boolean not null default false,
  no_delivery boolean not null default false,
  no_vice boolean not null default false,
  ex_tennis boolean not null default false,
  ex_football boolean not null default false,
  ex_walk boolean not null default false,
  ex_gym boolean not null default false,
  art_write boolean not null default false,
  art_draw boolean not null default false,
  art_read boolean not null default false,
  art_music boolean not null default false,
  weight numeric(4,1),
  sleep_hours numeric(3,1),
  energy smallint check (energy between 1 and 10),
  mood smallint check (mood between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.daily_logs to anon, authenticated;

alter table public.daily_logs enable row level security;

drop policy if exists "anon all daily_logs" on public.daily_logs;
create policy "anon all daily_logs"
  on public.daily_logs
  for all
  to anon, authenticated
  using (true)
  with check (true);
