'use client';

import { useState } from 'react';
import { artWhen, artWindow, ArtTask, noteReady, statusLabel } from '@/lib/art';
import { resolveArtTask } from '@/lib/supabase/actions';

export default function ArtCard({
  today,
  tasks,
  onResolved,
}: {
  today: string;
  tasks: ArtTask[];
  onResolved: (task: ArtTask) => void;
}) {
  const windowTasks = artWindow(tasks, today);
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (windowTasks.length === 0) {
    return (
      <section className='border border-foreground/20 p-4'>
        <h2 className='mb-3 font-mono text-xs uppercase tracking-widest text-foreground/50'>Arte</h2>
        <p className='font-mono'>Sin tarea</p>
      </section>
    );
  }

  const safeIndex = Math.min(index, windowTasks.length - 1);
  const task = windowTasks[safeIndex];
  const ready = noteReady(note) && !saving;

  const go = (next: number) => {
    setIndex(next);
    setNote('');
    setError(null);
  };

  const resolve = async (status: 'done' | 'cancelled') => {
    const text = note.trim();
    if (!text || saving) return;
    setSaving(true);
    setError(null);
    const message = await resolveArtTask(task.id, status, text);
    setSaving(false);
    if (message) {
      setError(message);
      return;
    }
    onResolved({ ...task, status, note: text });
    setNote('');
  };

  return (
    <section className='border border-foreground/20 p-4'>
      <div className='mb-3 flex items-center justify-between gap-3'>
        <h2 className='font-mono text-xs uppercase tracking-widest text-foreground/50'>Arte</h2>
        {windowTasks.length > 1 && (
          <div className='flex items-center gap-3 font-mono text-sm'>
            <button
              type='button'
              aria-label='Anterior'
              disabled={safeIndex === 0}
              onClick={() => go(safeIndex - 1)}
              className='disabled:text-foreground/30'
            >
              ‹
            </button>
            <span>
              {safeIndex + 1}/{windowTasks.length}
            </span>
            <button
              type='button'
              aria-label='Siguiente'
              disabled={safeIndex === windowTasks.length - 1}
              onClick={() => go(safeIndex + 1)}
              className='disabled:text-foreground/30'
            >
              ›
            </button>
          </div>
        )}
      </div>
      <p className='font-mono'>
        {artWhen(task.plannedDate, today)} · {task.title}
      </p>
      {task.status === 'pending' ? (
        <>
          <label className='mt-4 block'>
            <span className='mb-2 block font-mono text-sm'>Nota</span>
            <textarea
              value={note}
              rows={3}
              onChange={(event) => setNote(event.target.value)}
              className='w-full border border-foreground/20 bg-transparent px-3 py-2 font-mono outline-none focus:border-primary'
            />
          </label>
          {error && <p className='mt-3 font-mono text-sm text-destructive'>{error}</p>}
          <div className='mt-4 flex gap-3'>
            <button
              type='button'
              disabled={!ready}
              onClick={() => resolve('done')}
              className='flex-1 bg-primary px-4 py-3 font-mono text-sm text-primary-foreground disabled:opacity-50'
            >
              {saving ? 'Guardando...' : 'Hecha'}
            </button>
            <button
              type='button'
              disabled={!ready}
              onClick={() => resolve('cancelled')}
              className='flex-1 border border-foreground/20 px-4 py-3 font-mono text-sm disabled:opacity-50'
            >
              Cancelada
            </button>
          </div>
        </>
      ) : (
        <div className='mt-3 font-mono text-sm text-foreground/70'>
          <p>{statusLabel(task.status)}</p>
          {task.note && <p className='mt-1'>{task.note}</p>}
        </div>
      )}
    </section>
  );
}
