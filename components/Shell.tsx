'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ArtCard from '@/components/ArtCard';
import LogoutButton from '@/components/LogoutButton';
import { RoutineSheet } from '@/components/Routine';
import { ArtTask } from '@/lib/art';
import { activeStreak } from '@/lib/challenge';
import { DailyLog } from '@/lib/types';

function moved(log: DailyLog): boolean {
  return log.exTennis || log.exFootball || log.exWalk || log.exGym;
}

export default function Shell({
  today,
  logs: initialLogs,
  tasks: initialTasks,
}: {
  today: string;
  logs: DailyLog[];
  tasks: ArtTask[];
}) {
  const [logs, setLogs] = useState(initialLogs);
  const [tasks, setTasks] = useState(initialTasks);
  const [menu, setMenu] = useState(false);
  const [sheet, setSheet] = useState(false);
  const todayLog = logs.find((log) => log.date === today) ?? null;
  const loggedRun = activeStreak(logs, today, () => true);

  useEffect(() => {
    if (!menu) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  return (
    <main className='mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8 md:px-8'>
      <header className='relative mb-8 flex items-center justify-between gap-4'>
        <h1 className='font-mono text-2xl text-primary'>Trackizky</h1>
        <button
          type='button'
          aria-expanded={menu}
          onClick={() => setMenu((open) => !open)}
          className='font-mono text-sm text-foreground/70'
        >
          Menú
        </button>
        {menu && (
          <nav className='absolute right-0 top-full z-20 mt-2 w-44 border border-foreground/20 bg-background p-3'>
            <Link href='/stats' onClick={() => setMenu(false)} className='block py-2 font-mono text-sm'>
              Stats rutina
            </Link>
            <Link href='/arte' onClick={() => setMenu(false)} className='block py-2 font-mono text-sm'>
              Stats arte
            </Link>
            <div className='py-2'>
              <LogoutButton />
            </div>
          </nav>
        )}
      </header>

      <div className='flex flex-col gap-4'>
        <section className='border border-foreground/20 p-4'>
          <h2 className='mb-3 font-mono text-xs uppercase tracking-widest text-foreground/50'>Rutina</h2>
          {todayLog ? (
            <>
              <p className='font-mono'>Hoy cargado</p>
              <p className='mt-2 font-mono text-sm text-foreground/70'>
                Racha {loggedRun} · {moved(todayLog) ? 'Con movimiento' : 'Sin movimiento'}
              </p>
              <p className='font-mono text-sm text-foreground/70'>
                Peso {todayLog.weight == null ? '---' : String(todayLog.weight)}
              </p>
            </>
          ) : (
            <p className='font-mono'>Hoy sin registro</p>
          )}
          <button
            type='button'
            onClick={() => {
              setMenu(false);
              setSheet(true);
            }}
            className='mt-4 border border-foreground/20 px-4 py-3 font-mono text-sm'
          >
            {todayLog ? 'Editar' : 'Registrar'}
          </button>
        </section>

        <ArtCard
          today={today}
          tasks={tasks}
          onResolved={(next) => setTasks((current) => current.map((task) => (task.id === next.id ? next : task)))}
        />
      </div>

      {sheet && (
        <RoutineSheet
          date={today}
          today={today}
          logs={logs}
          onClose={() => setSheet(false)}
          onSaved={(next) => {
            setLogs((current) => [next, ...current.filter((entry) => entry.date !== next.date)]);
            setSheet(false);
          }}
        />
      )}
    </main>
  );
}
