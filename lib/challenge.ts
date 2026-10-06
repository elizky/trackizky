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

export function activeStreak<T extends { date: string }>(
  logs: T[],
  today: string,
  active: (log: T) => boolean,
): number {
  const dates = new Set(logs.filter(active).map((log) => log.date));
  let count = 0;
  let cursor = addDays(today, -1);

  while (dates.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }

  if (dates.has(today)) count += 1;
  return count;
}

function assertStreak() {
  const fail = (message: string) => {
    throw new Error(message);
  };

  const day = (date: string, on: boolean) => ({ date, on });
  const today = '2026-10-03';
  const on = (log: { on: boolean }) => log.on;
  const check = (actual: number, expected: number, message: string) => {
    if (actual !== expected) fail(`${message}: ${actual} !== ${expected}`);
  };

  check(activeStreak([], today, on), 0, 'empty');
  check(activeStreak([day(today, true)], today, on), 1, 'today only');
  check(activeStreak([day('2026-10-02', true)], today, on), 1, 'yesterday only');
  check(activeStreak([day('2026-10-02', false)], today, on), 0, 'yesterday broken');
  check(activeStreak([day('2026-10-02', false), day(today, true)], today, on), 1, 'broken yesterday, active today');
  check(activeStreak([day('2026-10-01', true), day('2026-10-02', true)], today, on), 2, 'two days, today missing');
  check(activeStreak([day('2026-10-01', true)], today, on), 0, 'gap at yesterday');
  check(activeStreak([day('2026-10-02', true), day(today, false)], today, on), 1, 'inactive today keeps yesterday');
  check(
    activeStreak([day('2026-10-01', true), day('2026-10-02', false), day(today, true)], today, on),
    1,
    'broken yesterday stops the walk',
  );

  const logged = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06'].map(
    (date) => ({ date }),
  );
  check(activeStreak(logged, '2026-10-06', () => true), 6, 'six logged days');
  check(
    activeStreak(
      logged.map((log) => ({ ...log, on: log.date < '2026-10-06' })),
      '2026-10-06',
      (log) => log.on,
    ),
    5,
    'five on, today off',
  );

  console.log('streak ok');
}

if (process.argv?.[1]?.endsWith('challenge.ts')) {
  assertStreak();
}
