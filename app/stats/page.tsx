import Link from 'next/link';
import { LineChart } from '@/components/LineChart';
import { getLogs } from '@/lib/supabase/actions';
import { DailyLog } from '@/lib/types';

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
}: {
  title: string;
  unit: (value: number) => string;
  data: { date: string; value: number }[];
  domain?: [number, number];
}) {
  const last = data.at(-1);

  return (
    <section className='mb-8'>
      <div className='mb-2 flex items-baseline justify-between font-mono'>
        <h2>{title}</h2>
        <span className='text-foreground/70'>{last ? unit(last.value) : '---'}</span>
      </div>
      <LineChart points={data} domain={domain} />
    </section>
  );
}

export default async function StatsPage() {
  let logs: DailyLog[] = [];
  let errorMessage: string | null = null;

  try {
    logs = await getLogs();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Error al cargar';
  }

  return (
    <main className='mx-auto min-h-screen max-w-2xl px-4 py-8 md:px-8'>
      <header className='mb-8 flex items-center justify-between'>
        <h1 className='font-mono text-2xl text-primary'>Stats</h1>
        <Link href='/' className='font-mono text-sm text-foreground/70 underline'>
          Volver
        </Link>
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
          <Series title='Sueño' unit={(value) => String(value)} data={points(logs, (log) => log.sleepHours)} />
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
