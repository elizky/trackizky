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

export const formatDisplayDate = (date: Date): string => {
  const weekday = date.toLocaleDateString('es-ES', { weekday: 'short' });
  const day = date.getDate();
  const month = date.toLocaleDateString('es-ES', { month: 'short' });
  const year = date.getFullYear();

  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

  return `${capitalizedWeekday}, ${day} ${capitalizedMonth} ${year}`;
};

export const getActivityLabel = (activityId: string, activities: Activity[]): string => {
  const activity = activities.find((a: Activity) => a.id === activityId);
  return activity?.label || '';
};
