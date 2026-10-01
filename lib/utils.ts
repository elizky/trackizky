import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TZ = 'America/Argentina/Buenos_Aires';

export function todayInAR(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function daysInMonth(date: string): number {
  const [year, month] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function monthDates(date: string): string[] {
  const [year, month] = date.split('-');
  const count = daysInMonth(date);
  return Array.from(
    { length: count },
    (_, index) => `${year}-${month}-${String(index + 1).padStart(2, '0')}`
  );
}
