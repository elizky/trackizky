-- November art tasks. Run after supabase/access_codes.sql.
-- Each access code gets a copy. Re-running does not reset a closed task.

create table if not exists public.art_projects (
  id text primary key,
  name text not null,
  target integer not null check (target > 0),
  position integer not null
);

create table if not exists public.art_tasks (
  id text not null,
  code text not null references public.access_codes (code),
  project_id text not null references public.art_projects (id),
  title text not null,
  planned_date date not null,
  position integer not null,
  counts boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'done', 'cancelled')),
  note text,
  resolved_at timestamptz,
  primary key (code, id),
  constraint art_tasks_resolution check (
    (status = 'pending' and note is null and resolved_at is null)
    or (
      status in ('done', 'cancelled')
      and note is not null
      and length(trim(note)) > 0
      and resolved_at is not null
    )
  )
);

alter table public.art_projects enable row level security;
alter table public.art_tasks enable row level security;
revoke all on table public.art_projects from anon, authenticated;
revoke all on table public.art_tasks from anon, authenticated;

create or replace function public.art_for(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'projects', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id,
        'name', name,
        'target', target,
        'position', position
      ) order by position)
      from art_projects
    ), '[]'::jsonb),
    'tasks', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id,
        'projectId', project_id,
        'title', title,
        'plannedDate', to_char(planned_date, 'YYYY-MM-DD'),
        'position', position,
        'counts', counts,
        'status', status,
        'note', note
      ) order by planned_date, position)
      from art_tasks
      where code = p_code
        and planned_date >= date '2026-11-01'
        and planned_date < date '2026-12-01'
    ), '[]'::jsonb)
  );
$$;

create or replace function public.resolve_art_task(
  p_code text,
  p_id text,
  p_status text,
  p_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status text;
begin
  if not exists (select 1 from access_codes where code = p_code) then
    raise exception 'invalid code';
  end if;

  if p_status not in ('done', 'cancelled') then
    raise exception 'Estado inválido';
  end if;

  if p_note is null or length(trim(p_note)) = 0 then
    raise exception 'La nota es obligatoria';
  end if;

  select status into current_status
  from art_tasks
  where code = p_code and id = p_id;

  if current_status is null then
    raise exception 'Tarea inexistente';
  end if;

  if current_status <> 'pending' then
    raise exception 'La tarea ya está cerrada';
  end if;

  update art_tasks
  set status = p_status,
      note = trim(p_note),
      resolved_at = now()
  where code = p_code and id = p_id and status = 'pending';
end $$;

revoke all on function public.art_for(text) from public;
revoke all on function public.resolve_art_task(text, text, text, text) from public;
grant execute on function public.art_for(text) to anon, authenticated;
grant execute on function public.resolve_art_task(text, text, text, text) to anon, authenticated;

insert into public.art_projects (id, name, target, position) values
  ('vlog', 'Vlog', 1, 1),
  ('lectura', 'Lectura', 3, 2),
  ('dibujo', 'Dibujo', 10, 3),
  ('escritura', 'Escritura', 4, 4)
on conflict (id) do update set
  name = excluded.name,
  target = excluded.target,
  position = excluded.position;

insert into public.art_tasks (id, code, project_id, title, planned_date, position, counts)
select v.id, c.code, v.project_id, v.title, v.planned_date, v.position, v.counts
from public.access_codes c
cross join (
  values
    ('vlog-2026-11-02-1', 'vlog', 'Definir la idea del vlog', date '2026-11-02', 1, false),
    ('escritura-2026-11-02-2', 'escritura', 'Escribir el cuento 1', date '2026-11-02', 2, false),
    ('dibujo-2026-11-03-1', 'dibujo', 'Dibujo 1', date '2026-11-03', 1, true),
    ('lectura-2026-11-03-2', 'lectura', 'Lectura de Mujeres', date '2026-11-03', 2, false),
    ('dibujo-2026-11-04-1', 'dibujo', 'Dibujo 2', date '2026-11-04', 1, true),
    ('lectura-2026-11-04-2', 'lectura', 'Lectura', date '2026-11-04', 2, false),
    ('lectura-2026-11-05-1', 'lectura', 'Lectura', date '2026-11-05', 1, false),
    ('vlog-2026-11-06-1', 'vlog', 'Grabar el vlog', date '2026-11-06', 1, false),
    ('dibujo-2026-11-06-2', 'dibujo', 'Dibujo 3', date '2026-11-06', 2, true),
    ('lectura-2026-11-07-1', 'lectura', 'Lectura', date '2026-11-07', 1, false),
    ('vlog-2026-11-07-2', 'vlog', 'Grabar escenas adicionales', date '2026-11-07', 2, false),
    ('escritura-2026-11-08-1', 'escritura', 'Terminar el cuento 1', date '2026-11-08', 1, true),
    ('vlog-2026-11-08-2', 'vlog', 'Revisar el material grabado', date '2026-11-08', 2, false),
    ('dibujo-2026-11-09-1', 'dibujo', 'Dibujo 4', date '2026-11-09', 1, true),
    ('escritura-2026-11-09-2', 'escritura', 'Escribir el cuento 2', date '2026-11-09', 2, false),
    ('lectura-2026-11-10-1', 'lectura', 'Terminar Mujeres', date '2026-11-10', 1, true),
    ('dibujo-2026-11-16-1', 'dibujo', 'Dibujo 5', date '2026-11-16', 1, true),
    ('lectura-2026-11-16-2', 'lectura', 'Empezar El túnel', date '2026-11-16', 2, false),
    ('escritura-2026-11-17-1', 'escritura', 'Escribir el cuento 2', date '2026-11-17', 1, false),
    ('dibujo-2026-11-18-1', 'dibujo', 'Dibujo 6', date '2026-11-18', 1, true),
    ('lectura-2026-11-18-2', 'lectura', 'Lectura', date '2026-11-18', 2, false),
    ('lectura-2026-11-19-1', 'lectura', 'Lectura', date '2026-11-19', 1, false),
    ('vlog-2026-11-20-1', 'vlog', 'Editar el vlog', date '2026-11-20', 1, false),
    ('escritura-2026-11-20-2', 'escritura', 'Escribir el cuento 3', date '2026-11-20', 2, false),
    ('dibujo-2026-11-21-1', 'dibujo', 'Dibujo 7', date '2026-11-21', 1, true),
    ('vlog-2026-11-21-2', 'vlog', 'Continuar edición', date '2026-11-21', 2, false),
    ('escritura-2026-11-22-1', 'escritura', 'Terminar el cuento 3', date '2026-11-22', 1, true),
    ('vlog-2026-11-22-2', 'vlog', 'Revisar el vlog', date '2026-11-22', 2, false),
    ('dibujo-2026-11-23-1', 'dibujo', 'Dibujo 8', date '2026-11-23', 1, true),
    ('vlog-2026-11-23-2', 'vlog', 'Publicar el vlog', date '2026-11-23', 2, true),
    ('lectura-2026-11-24-1', 'lectura', 'Empezar el segundo libro de Murakami', date '2026-11-24', 1, false),
    ('dibujo-2026-11-25-1', 'dibujo', 'Dibujo 9', date '2026-11-25', 1, true),
    ('escritura-2026-11-25-2', 'escritura', 'Terminar el cuento 4', date '2026-11-25', 2, true),
    ('dibujo-2026-11-30-1', 'dibujo', 'Dibujo 10', date '2026-11-30', 1, true),
    ('lectura-2026-11-30-2', 'lectura', 'Terminar el libro de Murakami', date '2026-11-30', 2, true)
) as v(id, project_id, title, planned_date, position, counts)
on conflict (code, id) do nothing;
