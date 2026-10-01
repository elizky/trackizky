export interface RuleLog {
  date: string;
  noAlcohol: boolean;
  food: boolean;
  water: boolean;
  noScreens: boolean;
  noDelivery: boolean;
  noVice: boolean;
  exTennis: boolean;
  exFootball: boolean;
  exWalk: boolean;
  exGym: boolean;
}

export function isPerfect(log: RuleLog): boolean {
  return (
    log.noAlcohol &&
    log.food &&
    log.water &&
    log.noScreens &&
    log.noDelivery &&
    log.noVice &&
    (log.exTennis || log.exFootball || log.exWalk || log.exGym)
  );
}

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  const y = utc.getUTCFullYear();
  const m = String(utc.getUTCMonth() + 1).padStart(2, '0');
  const d = String(utc.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function streak(logs: RuleLog[], today: string): number {
  const perfect = new Set(logs.filter(isPerfect).map((log) => log.date));
  let count = 0;
  let cursor = addDays(today, -1);

  while (perfect.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }

  if (perfect.has(today)) count += 1;
  return count;
}

function assertStreak() {
  const fail = (message: string) => {
    throw new Error(message);
  };

  const perfect = (date: string): RuleLog => ({
    date,
    noAlcohol: true,
    food: true,
    water: true,
    noScreens: true,
    noDelivery: true,
    noVice: true,
    exTennis: true,
    exFootball: false,
    exWalk: false,
    exGym: false,
  });
  const broken = (date: string): RuleLog => ({ ...perfect(date), water: false });

  const today = '2026-10-03';
  const check = (actual: number, expected: number, message: string) => {
    if (actual !== expected) fail(`${message}: ${actual} !== ${expected}`);
  };

  check(streak([], today), 0, 'empty');
  check(streak([perfect(today)], today), 1, 'today only');
  check(streak([perfect('2026-10-02')], today), 1, 'yesterday only');
  check(streak([broken('2026-10-02')], today), 0, 'yesterday broken');
  check(streak([broken('2026-10-02'), perfect(today)], today), 1, 'broken yesterday, perfect today');
  check(streak([perfect('2026-10-01'), perfect('2026-10-02')], today), 2, 'two days, today missing');
  check(streak([perfect('2026-10-01')], today), 0, 'gap at yesterday');
  check(streak([perfect('2026-10-02'), broken(today)], today), 1, 'partial today keeps yesterday');
  check(streak([perfect('2026-10-01'), broken('2026-10-02'), perfect(today)], today), 1, 'broken yesterday stops the walk');

  console.log('streak ok');
}

if (process.argv?.[1]?.endsWith('challenge.ts')) {
  assertStreak();
}
