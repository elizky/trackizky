import { addDays } from './challenge';

export const ART_MONTH = '2026-11-01';

export type ArtStatus = 'pending' | 'done' | 'cancelled';

export type ArtProject = {
  id: string;
  name: string;
  target: number;
  position: number;
};

export type ArtTask = {
  id: string;
  projectId: string;
  title: string;
  plannedDate: string;
  position: number;
  counts: boolean;
  status: ArtStatus;
  note: string | null;
};

export function noteReady(note: string): boolean {
  return note.trim().length > 0;
}

export function artWhen(date: string, today: string): string {
  if (date === today) return 'Hoy';
  if (date === addDays(today, -1)) return 'Ayer';
  return date;
}

export function statusLabel(status: ArtStatus): string {
  if (status === 'done') return 'Hecha';
  if (status === 'cancelled') return 'Cancelada';
  return 'Pendiente';
}

export function mondayIndex(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (utc.getUTCDay() + 6) % 7;
}

export function artWindow(tasks: readonly ArtTask[], today: string): ArtTask[] {
  const yesterday = addDays(today, -1);
  return tasks
    .filter((task) => task.plannedDate === yesterday || task.plannedDate === today)
    .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate) || a.position - b.position);
}

export function tasksOn(tasks: readonly ArtTask[], date: string): ArtTask[] {
  return tasks.filter((task) => task.plannedDate === date).sort((a, b) => a.position - b.position);
}

export function countDone(tasks: readonly ArtTask[], projectId: string): number {
  return tasks.reduce((total, task) => {
    if (task.projectId === projectId && task.counts && task.status === 'done') return total + 1;
    return total;
  }, 0);
}

export function dayTone(tasks: readonly ArtTask[]): 'empty' | 'open' | 'closed' {
  if (tasks.length === 0) return 'empty';
  if (tasks.some((task) => task.status === 'pending')) return 'open';
  return 'closed';
}

function task(partial: ArtTask): ArtTask {
  return partial;
}

function assertArt() {
  const fail = (message: string) => {
    throw new Error(message);
  };
  const check = (actual: unknown, expected: unknown, message: string) => {
    if (actual !== expected) fail(`${message}: ${String(actual)} !== ${String(expected)}`);
  };

  const sample: ArtTask[] = [
    task({ id: 'a', projectId: 'vlog', title: 'Definir', plannedDate: '2026-11-02', position: 1, counts: false, status: 'pending', note: null }),
    task({ id: 'b', projectId: 'escritura', title: 'Cuento', plannedDate: '2026-11-02', position: 2, counts: false, status: 'pending', note: null }),
    task({ id: 'c', projectId: 'dibujo', title: 'Dibujo 1', plannedDate: '2026-11-03', position: 1, counts: true, status: 'pending', note: null }),
    task({ id: 'd', projectId: 'lectura', title: 'Lectura', plannedDate: '2026-11-03', position: 2, counts: false, status: 'pending', note: null }),
    task({ id: 'e', projectId: 'dibujo', title: 'Dibujo 2', plannedDate: '2026-11-04', position: 1, counts: true, status: 'pending', note: null }),
  ];

  const third = artWindow(sample, '2026-11-03');
  check(third.length, 4, 'window on the 3rd');
  check(third.map((item) => item.id).join(''), 'abcd', 'window order');
  check(artWindow(sample, '2026-11-02').length, 2, 'window on the 2nd');
  check(artWindow(sample, '2026-11-13').length, 0, 'travel day');
  check(artWhen('2026-11-03', '2026-11-03'), 'Hoy', 'today label');
  check(artWhen('2026-11-02', '2026-11-03'), 'Ayer', 'yesterday label');

  const closed: ArtTask[] = [
    task({ id: 'done', projectId: 'dibujo', title: 'Dibujo 1', plannedDate: '2026-11-03', position: 1, counts: true, status: 'done', note: 'ok' }),
    task({ id: 'drop', projectId: 'dibujo', title: 'Dibujo 8', plannedDate: '2026-11-23', position: 1, counts: true, status: 'cancelled', note: 'lo dejo' }),
    task({ id: 'session', projectId: 'dibujo', title: 'Bosquejo', plannedDate: '2026-11-03', position: 2, counts: false, status: 'done', note: 'ok' }),
  ];
  check(countDone(closed, 'dibujo'), 1, 'cancelled and sessions stay out');
  check(countDone(closed, 'vlog'), 0, 'other project');
  check(noteReady('  '), false, 'blank note');
  check(noteReady('cuaderno'), true, 'note');
  check(mondayIndex('2026-11-01'), 6, 'nov 1 is sunday');
  check(mondayIndex('2026-11-02'), 0, 'nov 2 is monday');
  check(dayTone([]), 'empty', 'empty day');
  check(dayTone(sample.filter((item) => item.plannedDate === '2026-11-03')), 'open', 'pending day');
  check(dayTone(closed), 'closed', 'resolved day');
  check(statusLabel('done'), 'Hecha', 'done label');
  check(statusLabel('cancelled'), 'Cancelada', 'cancelled label');

  console.log('art ok');
}

if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('art.ts')) {
  assertArt();
}
