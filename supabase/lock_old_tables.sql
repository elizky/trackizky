-- Old tracker tables stay in the database. The API must not read them.
-- daily_logs keeps its policy so the app can still save today.

alter table public.daily_logs enable row level security;

drop policy if exists "anon all daily_logs" on public.daily_logs;
create policy "anon all daily_logs"
  on public.daily_logs
  for all
  to anon, authenticated
  using (true)
  with check (true);

do $$
declare
  tbl record;
begin
  for tbl in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and not c.relrowsecurity
      and c.relname <> 'daily_logs'
  loop
    execute format('alter table public.%I enable row level security', tbl.relname);
    execute format('revoke all on table public.%I from anon, authenticated', tbl.relname);
  end loop;
end $$;
