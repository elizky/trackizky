'use client';

import { useEffect, useState } from 'react';
import { activeStreak, inactiveStreak, isPerfect } from '@/lib/challenge';
import { formatDuration, parseDuration } from '@/lib/duration';
import { saveLog } from '@/lib/supabase/actions';
import { DailyLog, emptyLog } from '@/lib/types';
import { cn, monthDates } from '@/lib/utils';

const RULES = [
  { key: 'noAlcohol', label: 'Sin alcohol' },
  { key: 'food', label: 'Comida' },
  { key: 'water', label: 'Agua' },
  { key: 'noScreens', label: 'Sin pantallas' },
  { key: 'noDelivery', label: 'Sin delivery' },
  { key: 'noVice', label: 'Sin vicio' },
] as const;

const EXERCISE = [
  { key: 'exTennis', label: 'Tenis' },
  { key: 'exFootball', label: 'Fútbol' },
  { key: 'exWalk', label: 'Caminata' },
  { key: 'exGym', label: 'Gym' },
] as const;

const ART = [
  { key: 'artWrite', label: 'Escribir' },
  { key: 'artDraw', label: 'Dibujar' },
  { key: 'artRead', label: 'Leer' },
  { key: 'artMusic', label: 'Música' },
] as const;

type BoolKey = (typeof RULES)[number]['key'] | (typeof EXERCISE)[number]['key'] | (typeof ART)[number]['key'];

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function parseMeasure(raw: string): number | null {
  const trimmed = raw.trim().replace(',', '.');
  if (!trimmed) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : Number.NaN;
}

function formatMeasure(value: number | null): string {
  return value == null ? '' : String(value);
}

function showMeasure(value: number | null): string {
  return value == null ? '---' : String(value);
}

function showDuration(value: number | null): string {
  return value == null ? '---' : formatDuration(value);
}

function dayLabel(date: string): string {
  return `${Number(date.slice(8))} ${MONTHS[Number(date.slice(5, 7)) - 1]}`;
}

function Check({
  on,
  label,
  onToggle,
  run,
  gap,
}: {
  on: boolean;
  label: string;
  onToggle?: () => void;
  run?: number;
  gap?: number;
}) {
  const mark = <span className={on ? 'text-primary' : 'text-foreground/30'}>{on ? '☑' : '☐'}</span>;
  const streakMark =
    run != null && run >= 3 ? (
      <span className='ml-auto text-xs text-foreground/60'>🔥 {run}</span>
    ) : gap != null && gap >= 3 ? (
      <span className='ml-auto text-xs text-destructive'>↓ {gap}</span>
    ) : null;

  if (!onToggle) {
    return (
      <div className='flex w-full items-center gap-3 py-1.5 font-mono'>
        {mark}
        <span className={on ? '' : 'text-foreground/40'}>{label}</span>
        {streakMark}
      </div>
    );
  }

  return (
    <button type='button' onClick={onToggle} className='flex w-full items-center gap-3 py-1.5 text-left font-mono'>
      {mark}
      {label}
      {streakMark}
    </button>
  );
}

function Score({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <div className='mb-5'>
      <div className='mb-2 font-mono text-sm'>{label}</div>
      <div className='flex flex-wrap gap-1'>
        {Array.from({ length: 10 }, (_, index) => index + 1).map((n) => (
          <button
            key={n}
            type='button'
            onClick={() => onChange(value === n ? null : n)}
            className={cn(
              'h-9 w-9 border font-mono text-sm',
              value === n
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-foreground/20 text-foreground/70'
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckedNames({
  title,
  items,
  log,
}: {
  title: string;
  items: ReadonlyArray<{ key: BoolKey; label: string }>;
  log: DailyLog;
}) {
  const names = items.filter((item) => log[item.key]).map((item) => item.label);
  if (names.length === 0) return null;

  return (
    <p className='mt-3 font-mono text-sm text-foreground/70'>
      {title}: {names.join(', ')}
    </p>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex max-w-xs justify-between font-mono'>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function RoutineSheet({
  date,
  today,
  logs,
  onClose,
  onSaved,
}: {
  date: string;
  today: string;
  logs: DailyLog[];
  onClose: () => void;
  onSaved: (log: DailyLog) => void;
}) {
  const existing = logs.find((entry) => entry.date === date) ?? null;
  const [draft, setDraft] = useState<DailyLog>(existing ?? emptyLog(date));
  const [weight, setWeight] = useState(formatMeasure(existing?.weight ?? null));
  const [sleepHours, setSleepHours] = useState(existing?.sleepHours == null ? '' : formatDuration(existing.sleepHours));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemRun = (key: BoolKey) => activeStreak(logs, today, (entry) => entry[key]);
  const itemGap = (key: BoolKey) => inactiveStreak(logs, today, (entry) => entry[key]);
  const title = date === today ? (existing ? 'Editar' : 'Registrar hoy') : `Editando ${dayLabel(date)}`;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggle = (key: BoolKey) => {
    setDraft((current) => ({ ...current, [key]: !current[key] }));
  };

  const save = async () => {
    const parsedWeight = parseMeasure(weight);
    const parsedSleep = parseDuration(sleepHours);
    if (Number.isNaN(parsedWeight) || Number.isNaN(parsedSleep)) {
      setError('Peso o sueño inválido.');
      return;
    }

    setIsSaving(true);
    setError(null);
    const next: DailyLog = {
      ...draft,
      date,
      weight: parsedWeight,
      sleepHours: parsedSleep,
    };
    const message = await saveLog(next);
    if (message) {
      setError(message);
      setIsSaving(false);
      return;
    }
    onSaved(next);
  };

  return (
    <div role='dialog' aria-modal='true' aria-label={title} className='fixed inset-0 z-50 flex flex-col bg-background'>
      <div className='mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-4 md:px-8'>
        <h2 className='font-mono text-lg text-primary'>{title}</h2>
        <button type='button' onClick={onClose} className='font-mono text-sm text-foreground/70'>
          Cerrar
        </button>
      </div>
      <div className='mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 pb-8 md:px-8'>
        {error && <p className='mb-4 border border-red-500/50 bg-red-500/10 p-3 font-mono text-sm'>{error}</p>}
        <section className='mb-6'>
          {RULES.map((item) => (
            <Check
              key={item.key}
              on={draft[item.key]}
              label={item.label}
              run={itemRun(item.key)}
              gap={itemGap(item.key)}
              onToggle={() => toggle(item.key)}
            />
          ))}
        </section>
        <section className='mb-6'>
          <h3 className='mb-1 font-mono text-xs uppercase tracking-widest text-foreground/50'>Ejercicio</h3>
          {EXERCISE.map((item) => (
            <Check
              key={item.key}
              on={draft[item.key]}
              label={item.label}
              run={itemRun(item.key)}
              gap={itemGap(item.key)}
              onToggle={() => toggle(item.key)}
            />
          ))}
        </section>
        <section className='mb-8'>
          <h3 className='mb-1 font-mono text-xs uppercase tracking-widest text-foreground/50'>Arte</h3>
          {ART.map((item) => (
            <Check
              key={item.key}
              on={draft[item.key]}
              label={item.label}
              run={itemRun(item.key)}
              gap={itemGap(item.key)}
              onToggle={() => toggle(item.key)}
            />
          ))}
        </section>
        <label className='mb-4 block'>
          <span className='mb-2 block font-mono text-sm'>Peso</span>
          <input
            inputMode='decimal'
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            className='w-full border border-foreground/20 bg-transparent px-3 py-2 font-mono outline-none focus:border-primary'
          />
        </label>
        <label className='mb-5 block'>
          <span className='mb-2 block font-mono text-sm'>Sueño</span>
          <input
            type='text'
            placeholder='7:30'
            value={sleepHours}
            onChange={(event) => setSleepHours(event.target.value)}
            className='w-full border border-foreground/20 bg-transparent px-3 py-2 font-mono outline-none focus:border-primary'
          />
        </label>
        <Score label='Energía' value={draft.energy} onChange={(energy) => setDraft((current) => ({ ...current, energy }))} />
        <Score label='Ánimo' value={draft.mood} onChange={(mood) => setDraft((current) => ({ ...current, mood }))} />
        <button
          type='button'
          onClick={save}
          disabled={isSaving}
          className='w-full bg-primary px-4 py-3 font-mono text-primary-foreground disabled:opacity-50'
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

function DayModal({
  date,
  log,
  onClose,
  onEdit,
}: {
  date: string;
  log: DailyLog | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className='fixed inset-0 z-40 flex items-end justify-center bg-black/70 p-4 sm:items-center' onClick={onClose}>
      <div
        role='dialog'
        aria-modal='true'
        aria-label={dayLabel(date)}
        className='max-h-[80vh] w-full max-w-2xl overflow-y-auto border border-foreground/20 bg-background p-4'
        onClick={(event) => event.stopPropagation()}
      >
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='font-mono text-lg text-primary'>{dayLabel(date)}</h2>
          <button type='button' onClick={onClose} className='font-mono text-sm text-foreground/70'>
            Cerrar
          </button>
        </div>
        {log ? (
          <>
            {RULES.map((item) => (
              <Check key={item.key} on={log[item.key]} label={item.label} />
            ))}
            <CheckedNames title='Ejercicio' items={EXERCISE} log={log} />
            <CheckedNames title='Arte' items={ART} log={log} />
            <div className='my-4 border-t border-foreground/20' />
            <Metric label='Peso' value={showMeasure(log.weight)} />
            <Metric label='Energía' value={log.energy == null ? '---' : `${log.energy}/10`} />
            <Metric label='Sueño' value={showDuration(log.sleepHours)} />
            <Metric label='Ánimo' value={log.mood == null ? '---' : `${log.mood}/10`} />
          </>
        ) : (
          <p className='font-mono text-sm text-foreground/60'>Sin registro</p>
        )}
        <button type='button' onClick={onEdit} className='mt-6 font-mono text-sm text-primary underline'>
          Editar
        </button>
      </div>
    </div>
  );
}

export function RoutineMonth({ today, logs: initialLogs }: { today: string; logs: DailyLog[] }) {
  const [logs, setLogs] = useState(initialLogs);
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string | null>(null);
  const opened = openDate ? logs.find((entry) => entry.date === openDate) ?? null : null;
  const byDate = new Map(logs.map((log) => [log.date, log]));

  useEffect(() => {
    if (!openDate) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenDate(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openDate]);

  return (
    <section className='mb-8'>
      <div className='flex flex-wrap gap-1'>
        {monthDates(today).map((date) => {
          const entry = byDate.get(date);
          const state = date > today ? 'future' : !entry ? 'empty' : isPerfect(entry) ? 'complete' : 'partial';
          return (
            <button
              key={date}
              type='button'
              disabled={date > today}
              onClick={() => setOpenDate(date)}
              className={cn(
                'flex h-8 w-8 items-center justify-center font-mono text-xs',
                date === today && 'ring-1 ring-foreground',
                state === 'future' && 'text-foreground/25',
                state === 'empty' && 'border border-foreground/20 text-foreground/40',
                state === 'partial' && 'border border-primary/60 text-primary',
                state === 'complete' && 'bg-primary text-primary-foreground'
              )}
            >
              {Number(date.slice(8))}
            </button>
          );
        })}
      </div>
      {openDate && (
        <DayModal
          date={openDate}
          log={opened}
          onClose={() => setOpenDate(null)}
          onEdit={() => {
            setEditDate(openDate);
            setOpenDate(null);
          }}
        />
      )}
      {editDate && (
        <RoutineSheet
          date={editDate}
          today={today}
          logs={logs}
          onClose={() => setEditDate(null)}
          onSaved={(next) => {
            setLogs((current) => [next, ...current.filter((entry) => entry.date !== next.date)]);
            setEditDate(null);
          }}
        />
      )}
    </section>
  );
}
