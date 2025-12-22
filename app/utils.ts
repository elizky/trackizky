import { ACTIVITIES } from './consts';
import { Activity, LogEntry } from './types';

export const getYesterday = (): Date => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDisplayDate = (date: Date): string => {
  const weekday = date.toLocaleDateString('es-ES', { weekday: 'short' });
  const day = date.getDate();
  const month = date.toLocaleDateString('es-ES', { month: 'short' });
  const year = date.getFullYear();
  
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  
  return `${capitalizedWeekday}, ${day} ${capitalizedMonth} ${year}`;
};

export const getInitialState = (yesterdayDateStr: string) => {
  if (typeof window === 'undefined') return { activities: [], saved: false };

  const savedLogs = localStorage.getItem('trackizky-logs');
  if (savedLogs) {
    const logs = JSON.parse(savedLogs);
    const log = logs.find((l: { date: string }) => l.date === yesterdayDateStr);
    if (log) {
      return { activities: log.activities || [], saved: true };
    }
  }
  return { activities: [], saved: false };
};

export const getActivityLabel = (activityId: string): string => {
  console.log('activityId', activityId)
  console.log('ACTIVITIES', ACTIVITIES)
  const activity = ACTIVITIES.find((a: Activity) => a.id === activityId);
  console.log('activity', activity)
  return activity?.label || '';
};

export const getLogs = (): LogEntry[] => {
  if (typeof window === 'undefined') return [];
  const savedLogs = localStorage.getItem('trackizky-logs');
  if (!savedLogs) return [];
  const parsedLogs = JSON.parse(savedLogs);
  parsedLogs.sort((a: LogEntry, b: LogEntry) => b.date.localeCompare(a.date));
  return parsedLogs;
};
