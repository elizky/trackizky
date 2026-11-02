import Gate from '@/components/Gate';
import Shell from '@/components/Shell';
import { ArtTask } from '@/lib/art';
import { currentCode, getArt, getLogs } from '@/lib/supabase/actions';
import { DailyLog } from '@/lib/types';
import { todayInAR } from '@/lib/utils';

function setupMessage(message: string): string {
  if (message.includes('art_for') || message.includes('art_tasks') || message.includes('art_projects')) {
    return 'Falta correr supabase/art.sql en el SQL editor.';
  }
  if (message.includes('resolve_code') || message.includes('access_codes') || message.includes('logs_for')) {
    return 'Falta correr supabase/access_codes.sql en el SQL editor. Cambiá CAMBIA-ESTE-CODIGO antes.';
  }
  return message;
}

export default async function HomePage() {
  const today = todayInAR();
  let code: string | null = null;
  let logs: DailyLog[] = [];
  let tasks: ArtTask[] = [];
  let errorMessage: string | null = null;

  try {
    code = await currentCode();
    if (code) {
      const [nextLogs, art] = await Promise.all([getLogs(), getArt()]);
      logs = nextLogs;
      tasks = art.tasks;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al cargar';
    errorMessage = setupMessage(message);
  }

  if (errorMessage) {
    return (
      <main className='mx-auto max-w-2xl p-8 font-mono text-sm text-foreground/80'>{errorMessage}</main>
    );
  }

  if (!code) return <Gate today={today} />;

  return <Shell today={today} logs={logs} tasks={tasks} />;
}
