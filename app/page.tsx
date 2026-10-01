import Home from '@/components/Home';
import { getLogs } from '@/lib/supabase/actions';
import { DailyLog } from '@/lib/types';
import { todayInAR } from '@/lib/utils';

export default async function HomePage() {
  const today = todayInAR();
  let logs: DailyLog[] = [];
  let errorMessage: string | null = null;

  try {
    logs = await getLogs();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al cargar';
    errorMessage = message.includes('daily_logs')
      ? 'Falta la tabla daily_logs. Corré supabase/daily_logs.sql en el SQL editor de Supabase.'
      : message;
  }

  if (errorMessage) {
    return (
      <main className='mx-auto max-w-2xl p-8 font-mono text-sm text-foreground/80'>{errorMessage}</main>
    );
  }

  const initialLog = logs.find((log) => log.date === today) ?? null;
  return <Home today={today} initialLog={initialLog} logs={logs} />;
}
