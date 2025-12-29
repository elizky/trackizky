import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Activity, LogEntry } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getYesterday = (): Date => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return yesterday;
};

export const getYesterdayDateStr = (): string => {
  return formatDate(getYesterday());
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatDisplayDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseDateString(date) : date;
  const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' });
  const day = d.getDate();
  const month = d.toLocaleDateString('es-ES', { month: 'short' });
  const year = d.getFullYear();

  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

  return `${capitalizedWeekday}, ${day} ${capitalizedMonth} ${year}`;
};

export const formatMonthYear = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseDateString(date) : date;
  const monthYear = d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
};

export const getActivityLabel = (activityId: string, activities: Activity[]): string => {
  const activity = activities.find((a: Activity) => a.id === activityId);
  return activity?.label || '';
};

export const groupLogsByMonthYear = (logs: LogEntry[]): Map<string, LogEntry[]> => {
  const grouped = new Map<string, LogEntry[]>();

  logs.forEach((log) => {
    const monthYear = formatMonthYear(log.date);

    if (!grouped.has(monthYear)) {
      grouped.set(monthYear, []);
    }
    grouped.get(monthYear)!.push(log);
  });

  return grouped;
};

export const generateHeatmapDays = (
  logs: LogEntry[]
): {
  days: Array<{ date: Date; dateStr: string }>;
  activityPresence: Map<string, Set<string>>;
} => {
  if (logs.length === 0) {
    return { days: [], activityPresence: new Map<string, Set<string>>() };
  }

  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const firstDate = parseDateString(sortedLogs[0].date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDate(today);
  const oneYearFromFirst = new Date(firstDate);
  oneYearFromFirst.setFullYear(firstDate.getFullYear() + 1);

  const daysArray: Array<{ date: Date; dateStr: string }> = [];
  const presenceMap = new Map<string, Set<string>>();

  const currentDate = new Date(firstDate);
  currentDate.setHours(0, 0, 0, 0);
  
  while (currentDate <= oneYearFromFirst) {
    const dateStr = formatDate(currentDate);
    if (dateStr >= todayStr) break;
    
    daysArray.push({ date: new Date(currentDate), dateStr });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  logs.forEach((log) => {
    if (!presenceMap.has(log.date)) {
      presenceMap.set(log.date, new Set());
    }
    log.activities.forEach((activityId) => {
      presenceMap.get(log.date)!.add(activityId);
    });
  });

  return { days: daysArray, activityPresence: presenceMap };
};

export const groupDaysByMonth = (
  days: Array<{ date: Date; dateStr: string }>
): Array<{ month: string; days: Array<{ date: Date; dateStr: string }> }> => {
  if (days.length === 0) return [];

  const monthGroups: Array<{ month: string; days: Array<{ date: Date; dateStr: string }> }> = [];
  let currentMonth: string | null = null;
  let currentGroup: Array<{ date: Date; dateStr: string }> = [];

  days.forEach((day) => {
    const monthYear = formatMonthYear(day.date);

    if (currentMonth !== monthYear) {
      if (currentMonth !== null && currentGroup.length > 0) {
        monthGroups.push({ month: currentMonth, days: currentGroup });
      }
      currentMonth = monthYear;
      currentGroup = [day];
    } else {
      currentGroup.push(day);
    }
  });

  if (currentMonth !== null && currentGroup.length > 0) {
    monthGroups.push({ month: currentMonth, days: currentGroup });
  }

  return monthGroups;
};
