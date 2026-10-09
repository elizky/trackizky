import Link from 'next/link';
import Gate from '@/components/Gate';
import { LineChart } from '@/components/LineChart';
import LogoutButton from '@/components/LogoutButton';
import { formatDuration } from '@/lib/duration';
import { currentCode, getLogs } from '@/lib/supabase/actions';
import { DailyLog } from '@/lib/types';
import { todayInAR } from '@/lib/utils';

function points(logs: DailyLog[], value: (log: DailyLog) => number | null) {
  return logs
    .filter((log) => value(log) != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({ date: log.date, value: value(log) as number }));
}

function Series({
  title,
  unit,
  data,
  domain,
  format,
}: {
  title: string;
  unit: (value: number) => string;
  data: { date: string; value: number }[];
  domain?: [number, number];
  format?: (value: number) => string;
}) {
  const last = data.at(-1);
  const mean =
    data.length === 0 ? null : data.reduce((total, point) => total + point.value, 0) / data.length;
  const average = mean == null ? '---' : format ? format(mean) : unit(Math.round(mean * 10) / 10);

  return (
    <section className='mb-8'>
      <div className='mb-2 flex items-baseline justify-between gap-4 font-mono'>
        <h2>{title}</h2>
        <span className='text-foreground/70'>
          {last ? unit(last.value) : '---'}
          <span className='ml-3'>prom {average}</span>
        </span>
      </div>
      <LineChart points={data} domain={domain} format={format} />
    </section>
  );
}

export default async function StatsPage() {
  let logs: DailyLog[] = [];
  let errorMessage: string | null = null;
  let code: string | null = null;

  try {
    code = await currentCode();
    if (code) logs = await getLogs();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Error al cargar';
  }

  if (!errorMessage && !code) return <Gate today={todayInAR()} />;

  return (
    <main className='mx-auto min-h-screen max-w-2xl px-4 py-8 md:px-8'>
      <header className='mb-8 flex items-center justify-between'>
        <h1 className='font-mono text-2xl text-primary'>Stats</h1>
        <div className='flex items-center gap-4'>
          <Link href='/' className='font-mono text-sm text-foreground/70 underline'>
            Volver
          </Link>
          <LogoutButton />
        </div>
      </header>
      {errorMessage ? (
        <p className='font-mono text-sm text-foreground/80'>{errorMessage}</p>
      ) : (
        <>
          <Series title='Peso' unit={(value) => String(value)} data={points(logs, (log) => log.weight)} />
          <Series
            title='Energía'
            unit={(value) => `${value}/10`}
            data={points(logs, (log) => log.energy)}
            domain={[1, 10]}
          />
          <Series
            title='Sueño'
            unit={formatDuration}
            format={formatDuration}
            data={points(logs, (log) => log.sleepHours)}
          />
          <Series
            title='Ánimo'
            unit={(value) => `${value}/10`}
            data={points(logs, (log) => log.mood)}
            domain={[1, 10]}
          />
        </>
      )}
    </main>
  );
}
