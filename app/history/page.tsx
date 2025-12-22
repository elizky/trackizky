import { getAllLogs, getActivities } from '@/lib/supabase/actions';
import History from '@/components/History';

export default async function HistoryPage() {
  const [logs, activities] = await Promise.all([getAllLogs(), getActivities()]);
  return <History logs={logs} activities={activities} />;
}
