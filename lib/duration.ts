export function formatDuration(hours: number): string {
  const total = Math.round(hours * 60);
  const whole = Math.floor(total / 60);
  const minutes = total % 60;
  return `${whole}:${String(minutes).padStart(2, '0')}`;
}

export function parseDuration(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const clock = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (clock) {
    const minutes = Number(clock[2]);
    if (minutes >= 60) return Number.NaN;
    return Number(clock[1]) + minutes / 60;
  }

  const value = Number(trimmed.replace(',', '.'));
  return Number.isFinite(value) ? value : Number.NaN;
}

function assertDuration() {
  const fail = (message: string) => {
    throw new Error(message);
  };

  if (formatDuration(5.2) !== '5:12') fail('5.2');
  if (formatDuration(4.5) !== '4:30') fail('4.5');
  if (formatDuration(7) !== '7:00') fail('7');
  if (parseDuration('5:12') !== 5.2) fail('parse 5:12');
  if (parseDuration('7:30') !== 7.5) fail('parse 7:30');
  if (parseDuration('') !== null) fail('empty');
  if (!Number.isNaN(parseDuration('7:60'))) fail('minutes');
  if (parseDuration('5,2') !== 5.2) fail('comma');
  console.log('duration ok');
}

if (process.argv?.[1]?.endsWith('duration.ts')) {
  assertDuration();
}
