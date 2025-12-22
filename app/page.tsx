import { getActivities, getLogByDate } from '@/lib/supabase/actions';
import Home from '@/components/Home';
import { getYesterdayDateStr } from '@/lib/utils';

export default async function HomePage() {
  const yesterdayDateStr = getYesterdayDateStr();
  const [activities, initialLog] = await Promise.all([
    getActivities(),
    getLogByDate(yesterdayDateStr),
  ]);

  return <Home activities={activities} initialLog={initialLog} />;
}
