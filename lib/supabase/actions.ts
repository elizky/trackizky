'use server';

import { createClient } from './server';
import { cookies } from 'next/headers';
import { Activity, LogEntry } from '@/lib/types';

export async function getActivities(): Promise<Activity[]> {
  const supabase = createClient(await cookies());

  const { data, error } = await supabase.from('activities').select('id, label, category');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function saveLog(date: string, activityIds: string[]): Promise<void> {
  const supabase = createClient(await cookies());

  const { data: dayLog, error: dayLogError } = await supabase
    .from('day_logs')
    .upsert({ date }, { onConflict: 'date' })
    .select('id')
    .single();

  if (dayLogError) throw new Error(dayLogError.message);

  const { error: deleteError } = await supabase
    .from('day_log_activities')
    .delete()
    .eq('day_log_id', dayLog.id);

  if (deleteError) throw new Error(deleteError.message);

  if (activityIds.length > 0) {
    const { error: insertError } = await supabase.from('day_log_activities').insert(
      activityIds.map((activityId) => ({
        day_log_id: dayLog.id,
        activity_id: activityId,
      }))
    );

    if (insertError) throw new Error(insertError.message);
  }
}

export async function getLogByDate(date: string): Promise<LogEntry | null> {
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from('day_logs')
    .select('date, day_log_activities(activity_id)')
    .eq('date', date)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(error.message);
  }

  return {
    date: data.date,
    activities: data.day_log_activities.map((a: { activity_id: string }) => a.activity_id),
  };
}

export async function getAllLogs(): Promise<LogEntry[]> {
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from('day_logs')
    .select('date, day_log_activities(activity_id)')
    .order('date', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((log) => ({
    date: log.date,
    activities: log.day_log_activities.map((a: { activity_id: string }) => a.activity_id),
  }));
}
