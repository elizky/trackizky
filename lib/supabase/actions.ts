'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { DailyLog } from '@/lib/types';
import { todayInAR } from '@/lib/utils';
import { createClient } from './server';

type DailyLogRow = {
  date: string;
  no_alcohol: boolean;
  food: boolean;
  water: boolean;
  no_screens: boolean;
  no_delivery: boolean;
  no_vice: boolean;
  ex_tennis: boolean;
  ex_football: boolean;
  ex_walk: boolean;
  ex_gym: boolean;
  art_write: boolean;
  art_draw: boolean;
  art_read: boolean;
  art_music: boolean;
  weight: number | string | null;
  sleep_hours: number | string | null;
  energy: number | null;
  mood: number | null;
};

const COLUMNS =
  'date, no_alcohol, food, water, no_screens, no_delivery, no_vice, ex_tennis, ex_football, ex_walk, ex_gym, art_write, art_draw, art_read, art_music, weight, sleep_hours, energy, mood';

function numberOrNull(value: number | string | null): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function fromRow(row: DailyLogRow): DailyLog {
  return {
    date: row.date.slice(0, 10),
    noAlcohol: row.no_alcohol,
    food: row.food,
    water: row.water,
    noScreens: row.no_screens,
    noDelivery: row.no_delivery,
    noVice: row.no_vice,
    exTennis: row.ex_tennis,
    exFootball: row.ex_football,
    exWalk: row.ex_walk,
    exGym: row.ex_gym,
    artWrite: row.art_write,
    artDraw: row.art_draw,
    artRead: row.art_read,
    artMusic: row.art_music,
    weight: numberOrNull(row.weight),
    sleepHours: numberOrNull(row.sleep_hours),
    energy: row.energy,
    mood: row.mood,
  };
}

function measure(value: number | null, max: number, label: string): number | null {
  if (value == null) return null;
  if (!Number.isFinite(value) || value < 0 || value > max) {
    throw new Error(`${label} inválido`);
  }
  return Math.round(value * 10) / 10;
}

function score(value: number | null, label: string): number | null {
  if (value == null) return null;
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    throw new Error(`${label} inválido`);
  }
  return value;
}

export async function getLogs(): Promise<DailyLog[]> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from('daily_logs')
    .select(COLUMNS)
    .order('date', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(fromRow);
}

export async function saveLog(input: Omit<DailyLog, 'date'>): Promise<string | null> {
  const date = todayInAR();
  let row;
  try {
    row = {
      date,
      no_alcohol: input.noAlcohol,
      food: input.food,
      water: input.water,
      no_screens: input.noScreens,
      no_delivery: input.noDelivery,
      no_vice: input.noVice,
      ex_tennis: input.exTennis,
      ex_football: input.exFootball,
      ex_walk: input.exWalk,
      ex_gym: input.exGym,
      art_write: input.artWrite,
      art_draw: input.artDraw,
      art_read: input.artRead,
      art_music: input.artMusic,
      weight: measure(input.weight, 400, 'Peso'),
      sleep_hours: measure(input.sleepHours, 24, 'Sueño'),
      energy: score(input.energy, 'Energía'),
      mood: score(input.mood, 'Ánimo'),
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    return error instanceof Error ? error.message : 'Error al guardar';
  }

  const supabase = createClient(await cookies());
  const { error } = await supabase.from('daily_logs').upsert(row, { onConflict: 'date' });

  if (error) return error.message;
  revalidatePath('/');
  return null;
}
