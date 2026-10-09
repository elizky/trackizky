-- Promo codes. Replace IZKY1234 before running.
-- That code keeps the days already stored. Add more inserts for other people.

create table if not exists public.access_codes (
  code text primary key,
  created_at timestamptz not null default now()
);

insert into public.access_codes (code) values ('IZKY1234')
on conflict (code) do nothing;

alter table public.daily_logs add column if not exists code text;

update public.daily_logs
set code = 'IZKY1234'
where code is null;

alter table public.daily_logs alter column code set not null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'daily_logs_pkey'
      and conrelid = 'public.daily_logs'::regclass
      and pg_get_constraintdef(oid) not like '%code%'
  ) then
    alter table public.daily_logs drop constraint daily_logs_pkey;
    alter table public.daily_logs add primary key (code, date);
  end if;
end $$;

alter table public.daily_logs drop constraint if exists daily_logs_code_fkey;
alter table public.daily_logs
  add constraint daily_logs_code_fkey
  foreign key (code) references public.access_codes (code);

drop policy if exists "anon all daily_logs" on public.daily_logs;
alter table public.daily_logs enable row level security;
alter table public.access_codes enable row level security;
revoke all on table public.daily_logs from anon, authenticated;
revoke all on table public.access_codes from anon, authenticated;

create or replace function public.resolve_code(p_code text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select code
  from access_codes
  where upper(code) = upper(trim(p_code))
  limit 1;
$$;

create or replace function public.logs_for(p_code text)
returns setof daily_logs
language sql
stable
security definer
set search_path = public
as $$
  select *
  from daily_logs
  where code = p_code
  order by date desc;
$$;

create or replace function public.save_log(
  p_code text,
  p_date date,
  p_no_alcohol boolean,
  p_food boolean,
  p_water boolean,
  p_no_screens boolean,
  p_no_delivery boolean,
  p_no_vice boolean,
  p_ex_tennis boolean,
  p_ex_football boolean,
  p_ex_walk boolean,
  p_ex_gym boolean,
  p_art_write boolean,
  p_art_draw boolean,
  p_art_read boolean,
  p_art_music boolean,
  p_weight numeric,
  p_sleep_hours numeric,
  p_energy smallint,
  p_mood smallint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from access_codes where code = p_code) then
    raise exception 'invalid code';
  end if;

  if p_date <> (timezone('America/Argentina/Buenos_Aires', now()))::date then
    raise exception 'solo se guarda el dia de hoy';
  end if;

  insert into daily_logs (
    code, date, no_alcohol, food, water, no_screens, no_delivery, no_vice,
    ex_tennis, ex_football, ex_walk, ex_gym,
    art_write, art_draw, art_read, art_music,
    weight, sleep_hours, energy, mood, updated_at
  )
  values (
    p_code, p_date, p_no_alcohol, p_food, p_water, p_no_screens, p_no_delivery, p_no_vice,
    p_ex_tennis, p_ex_football, p_ex_walk, p_ex_gym,
    p_art_write, p_art_draw, p_art_read, p_art_music,
    p_weight, p_sleep_hours, p_energy, p_mood, now()
  )
  on conflict (code, date) do update set
    no_alcohol = excluded.no_alcohol,
    food = excluded.food,
    water = excluded.water,
    no_screens = excluded.no_screens,
    no_delivery = excluded.no_delivery,
    no_vice = excluded.no_vice,
    ex_tennis = excluded.ex_tennis,
    ex_football = excluded.ex_football,
    ex_walk = excluded.ex_walk,
    ex_gym = excluded.ex_gym,
    art_write = excluded.art_write,
    art_draw = excluded.art_draw,
    art_read = excluded.art_read,
    art_music = excluded.art_music,
    weight = excluded.weight,
    sleep_hours = excluded.sleep_hours,
    energy = excluded.energy,
    mood = excluded.mood,
    updated_at = now();
end $$;

revoke all on function public.resolve_code(text) from public;
revoke all on function public.logs_for(text) from public;
revoke all on function public.save_log(
  text, date, boolean, boolean, boolean, boolean, boolean, boolean,
  boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean,
  numeric, numeric, smallint, smallint
) from public;

grant execute on function public.resolve_code(text) to anon, authenticated;
grant execute on function public.logs_for(text) to anon, authenticated;
grant execute on function public.save_log(
  text, date, boolean, boolean, boolean, boolean, boolean, boolean,
  boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean,
  numeric, numeric, smallint, smallint
) to anon, authenticated;
