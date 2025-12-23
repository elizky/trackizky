import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Activity } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getYesterday = (): Date => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
};

export const getYesterdayDateStr = (): string => {
  return formatDate(getYesterday());
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
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

export const getActivityLabel = (activityId: string, activities: Activity[]): string => {
  const activity = activities.find((a: Activity) => a.id === activityId);
  return activity?.label || '';
};
