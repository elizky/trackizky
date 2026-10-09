'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { activeStreak, inactiveStreak, isPerfect } from '@/lib/challenge';
import { formatDuration, parseDuration } from '@/lib/duration';
import { saveLog } from '@/lib/supabase/actions';
import { DailyLog, emptyLog } from '@/lib/types';
import { cn, daysInMonth, monthDates } from '@/lib/utils';

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
  const streakMark = run ? (
    <span className='ml-auto text-xs text-foreground/60'>🔥 {run}</span>
  ) : gap ? (
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

export default function Home({
  today,
  initialLog,
  logs,
}: {
  today: string;
  initialLog: DailyLog | null;
  logs: DailyLog[];
}) {
  const [log, setLog] = useState<DailyLog | null>(initialLog);
  const [history, setHistory] = useState(logs);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DailyLog>(initialLog ?? emptyLog(today));
  const [weight, setWeight] = useState(formatMeasure(initialLog?.weight ?? null));
  const [sleepHours, setSleepHours] = useState(
    initialLog?.sleepHours == null ? '' : formatDuration(initialLog.sleepHours),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDate, setOpenDate] = useState<string | null>(null);

  const day = Number(today.slice(8));
  const showForm = !log || editing;
  const loggedRun = activeStreak(history, today, () => true);
  const itemRun = (key: BoolKey) => activeStreak(history, today, (entry) => entry[key]);
  const itemGap = (key: BoolKey) => inactiveStreak(history, today, (entry) => entry[key]);
  const moved = (entry: DailyLog) => entry.exTennis || entry.exFootball || entry.exWalk || entry.exGym;
  const movementRun = activeStreak(history, today, moved);
  const movementGap = inactiveStreak(history, today, moved);

  useEffect(() => {
    if (!openDate) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenDate(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openDate]);

  const toggle = (key: BoolKey) => {
    setDraft((current) => ({ ...current, [key]: !current[key] }));
  };

  const openEdit = () => {
    const source = log ?? emptyLog(today);
    setDraft(source);
    setWeight(formatMeasure(source.weight));
    setSleepHours(source.sleepHours == null ? '' : formatDuration(source.sleepHours));
    setError(null);
    setEditing(true);
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
      date: today,
      weight: parsedWeight,
      sleepHours: parsedSleep,
    };

    const message = await saveLog(next);
    if (message) {
      setError(message);
      setIsSaving(false);
      return;
    }

    setLog(next);
    setHistory((current) => [next, ...current.filter((entry) => entry.date !== today)]);
    setEditing(false);
    setIsSaving(false);
  };

  const saved = log;
  const opened = openDate ? history.find((entry) => entry.date === openDate) ?? null : null;

  return (
    <main className='mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8 md:px-8'>
      <header className='mb-8'>
        <div className='flex items-center justify-between gap-4'>
          <h1 className='font-mono text-2xl text-primary'>OCTOBER RESET</h1>
          <div className='flex items-center gap-4'>
            <Link href='/stats' className='font-mono text-sm text-foreground/70 underline'>
              Stats
            </Link>
            <LogoutButton />
          </div>
        </div>
        <p className='mt-2 font-mono text-sm text-foreground/70'>
          Día {String(day).padStart(2, '0')} / {daysInMonth(today)}
        </p>
        <p className='mt-4 font-mono'>
          🔥 Racha: {loggedRun} {loggedRun === 1 ? 'día' : 'días'}
        </p>
        <MonthStrip today={today} logs={history} onOpen={setOpenDate} />
      </header>

      {error && (
        <p className='mb-4 border border-red-500/50 bg-red-500/10 p-3 font-mono text-sm'>{error}</p>
      )}

      {showForm ? (
        <div className='pb-24'>
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
            <h2 className='mb-1 font-mono text-xs uppercase tracking-widest text-foreground/50'>Ejercicio</h2>
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
            <h2 className='mb-1 font-mono text-xs uppercase tracking-widest text-foreground/50'>Arte</h2>
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
              inputMode='numeric'
              placeholder='7:30'
              value={sleepHours}
              onChange={(event) => setSleepHours(event.target.value)}
              className='w-full border border-foreground/20 bg-transparent px-3 py-2 font-mono outline-none focus:border-primary'
            />
          </label>

          <Score
            label='Energía'
            value={draft.energy}
            onChange={(energy) => setDraft((current) => ({ ...current, energy }))}
          />
          <Score
            label='Ánimo'
            value={draft.mood}
            onChange={(mood) => setDraft((current) => ({ ...current, mood }))}
          />

          <div className='fixed bottom-0 left-0 right-0 border-t border-foreground/20 bg-background p-4 md:p-8'>
            <div className='mx-auto flex max-w-2xl gap-3'>
              {editing && (
                <button
                  type='button'
                  onClick={() => setEditing(false)}
                  className='border border-foreground/20 px-4 py-3 font-mono text-sm'
                >
                  Cancelar
                </button>
              )}
              <button
                type='button'
                onClick={save}
                disabled={isSaving}
                className='flex-1 bg-primary px-4 py-3 font-mono text-primary-foreground disabled:opacity-50'
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        saved && (
          <div>
            {RULES.map((item) => (
              <Check
                key={item.key}
                on={saved[item.key]}
                label={item.label}
                run={itemRun(item.key)}
                gap={itemGap(item.key)}
              />
            ))}
            <Check
              on={saved.exTennis || saved.exFootball || saved.exWalk || saved.exGym}
              label='Movimiento'
              run={movementRun}
              gap={movementGap}
            />

            <CheckedNames title='Ejercicio' items={EXERCISE} log={saved} />
            <CheckedNames title='Arte' items={ART} log={saved} />

            <div className='my-6 border-t border-foreground/20' />

            <Metric label='Peso' value={showMeasure(saved.weight)} />
            <Metric label='Energía' value={saved.energy == null ? '---' : `${saved.energy}/10`} />
            <Metric label='Sueño' value={showDuration(saved.sleepHours)} />
            <Metric label='Ánimo' value={saved.mood == null ? '---' : `${saved.mood}/10`} />

            <button type='button' onClick={openEdit} className='mt-8 font-mono text-sm text-primary underline'>
              Editar
            </button>
          </div>
        )
      )}
      {openDate && (
        <DayModal date={openDate} log={opened} onClose={() => setOpenDate(null)} />
      )}
    </main>
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

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function dayLabel(date: string): string {
  return `${Number(date.slice(8))} ${MONTHS[Number(date.slice(5, 7)) - 1]}`;
}

function DayModal({ date, log, onClose }: { date: string; log: DailyLog | null; onClose: () => void }) {
  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center' onClick={onClose}>
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
      </div>
    </div>
  );
}

function MonthStrip({
  today,
  logs,
  onOpen,
}: {
  today: string;
  logs: DailyLog[];
  onOpen: (date: string) => void;
}) {
  const byDate = new Map(logs.map((log) => [log.date, log]));

  return (
    <div className='mt-6 flex flex-wrap gap-1'>
      {monthDates(today).map((date) => {
        const entry = byDate.get(date);
        const state = date > today ? 'future' : !entry ? 'empty' : isPerfect(entry) ? 'complete' : 'partial';
        return (
          <button
            key={date}
            type='button'
            disabled={date > today}
            onClick={() => onOpen(date)}
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
  );
}
