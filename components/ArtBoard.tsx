'use client';

import { useState } from 'react';
import { ART_MONTH, ArtProject, ArtTask, countDone, dayTone, mondayIndex, statusLabel, tasksOn } from '@/lib/art';
import { cn, monthDates } from '@/lib/utils';

const WEEKDAYS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sa', 'do'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function dayLabel(date: string): string {
  return `${Number(date.slice(8))} ${MONTHS[Number(date.slice(5, 7)) - 1]}`;
}

export default function ArtBoard({
  today,
  projects,
  tasks,
}: {
  today: string;
  projects: ArtProject[];
  tasks: ArtTask[];
}) {
  const dates = monthDates(ART_MONTH);
  const [selected, setSelected] = useState(today.startsWith('2026-11') ? today : ART_MONTH);
  const lead = mondayIndex(dates[0]);
  const visible = tasksOn(tasks, selected);

  return (
    <div>
      <section className='mb-8'>
        <h2 className='mb-4 font-mono'>Noviembre</h2>
        <div className='flex flex-col gap-4'>
          {projects.map((project) => {
            const done = countDone(tasks, project.id);
            const width = Math.min(100, Math.round((done / project.target) * 100));
            return (
              <div key={project.id}>
                <div className='mb-1 flex justify-between font-mono text-sm'>
                  <span>{project.name}</span>
                  <span>
                    {done}/{project.target}
                  </span>
                </div>
                <div className='h-1 bg-foreground/15'>
                  <div className='h-1 bg-primary' style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className='grid grid-cols-7 gap-1'>
        {WEEKDAYS.map((day) => (
          <div key={day} className='pb-1 text-center font-mono text-xs text-foreground/50'>
            {day}
          </div>
        ))}
        {Array.from({ length: lead }, (_, index) => (
          <div key={`blank-${index}`} />
        ))}
        {dates.map((date) => {
          const tone = dayTone(tasksOn(tasks, date));
          return (
            <button
              key={date}
              type='button'
              aria-pressed={date === selected}
              onClick={() => setSelected(date)}
              className={cn(
                'flex h-8 items-center justify-center font-mono text-xs',
                date === selected && 'ring-1 ring-foreground',
                tone === 'empty' && 'text-foreground/35',
                tone === 'open' && 'border border-primary/60 text-primary',
                tone === 'closed' && 'bg-primary text-primary-foreground'
              )}
            >
              {Number(date.slice(8))}
            </button>
          );
        })}
      </div>

      <section className='mt-6' aria-label={dayLabel(selected)}>
        <h2 className='mb-3 font-mono text-primary'>{dayLabel(selected)}</h2>
        {visible.length === 0 ? (
          <p className='font-mono text-sm text-foreground/60'>Sin tarea</p>
        ) : (
          <ul>
            {visible.map((task) => (
              <li key={task.id} className='border-t border-foreground/20 py-3 font-mono text-sm'>
                <p>{task.title}</p>
                <p className='mt-1 text-foreground/70'>{statusLabel(task.status)}</p>
                {task.note && <p className='mt-1 text-foreground/70'>{task.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
