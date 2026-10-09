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

const CODE_COOKIE = 'october_code';

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 400,
    secure: process.env.NODE_ENV === 'production',
  };
}

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

export async function currentCode(): Promise<string | null> {
  const raw = (await cookies()).get(CODE_COOKIE)?.value;
  if (!raw) return null;

  const supabase = createClient(await cookies());
  const { data, error } = await supabase.rpc('resolve_code', { p_code: raw });
  if (error) throw new Error(error.message);
  return data || null;
}

export async function unlock(code: string): Promise<string | null> {
  const trimmed = code.trim();
  if (!trimmed) return 'Ingresá un código';

  const supabase = createClient(await cookies());
  const { data, error } = await supabase.rpc('resolve_code', { p_code: trimmed });
  if (error) return 'No se pudo verificar el código';
  if (!data) return 'Código inválido';

  (await cookies()).set(CODE_COOKIE, data, cookieOptions());
  revalidatePath('/');
  revalidatePath('/stats');
  return null;
}

export async function logout(): Promise<void> {
  (await cookies()).delete(CODE_COOKIE);
  revalidatePath('/');
  revalidatePath('/stats');
}

export async function getLogs(): Promise<DailyLog[]> {
  const code = (await cookies()).get(CODE_COOKIE)?.value;
  if (!code) return [];

  const supabase = createClient(await cookies());
  const { data, error } = await supabase.rpc('logs_for', { p_code: code });

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

  const code = (await cookies()).get(CODE_COOKIE)?.value;
  if (!code) return 'Entrá con tu código';

  const supabase = createClient(await cookies());
  const { error } = await supabase.rpc('save_log', {
    p_code: code,
    p_date: row.date,
    p_no_alcohol: row.no_alcohol,
    p_food: row.food,
    p_water: row.water,
    p_no_screens: row.no_screens,
    p_no_delivery: row.no_delivery,
    p_no_vice: row.no_vice,
    p_ex_tennis: row.ex_tennis,
    p_ex_football: row.ex_football,
    p_ex_walk: row.ex_walk,
    p_ex_gym: row.ex_gym,
    p_art_write: row.art_write,
    p_art_draw: row.art_draw,
    p_art_read: row.art_read,
    p_art_music: row.art_music,
    p_weight: row.weight,
    p_sleep_hours: row.sleep_hours,
    p_energy: row.energy,
    p_mood: row.mood,
  });

  if (error) return error.message;
  revalidatePath('/');
  revalidatePath('/stats');
  return null;
}
