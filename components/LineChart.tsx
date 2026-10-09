function formatTick(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function LineChart({
  points,
  domain,
  format = formatTick,
}: {
  points: { date: string; value: number }[];
  domain?: [number, number];
  format?: (value: number) => string;
}) {
  if (points.length === 0) {
    return <p className='font-mono text-sm text-foreground/50'>Sin datos</p>;
  }

  const values = points.map((point) => point.value);
  const low = domain ? domain[0] : Math.min(...values);
  const high = domain ? domain[1] : Math.max(...values);
  const span = high - low || 1;
  const pad = domain ? 0 : span * 0.2;
  const y0 = low - pad;
  const y1 = high + pad;
  const width = 320;
  const height = 120;
  const top = 12;
  const bottom = 28;
  const left = 44;
  const yAt = (value: number) => top + (1 - (value - y0) / (y1 - y0)) * (height - top - bottom);
  const ticks = domain
    ? [domain[1], Math.round((domain[0] + domain[1]) / 2), domain[0]]
    : [y1, (y0 + y1) / 2, y0];

  const coords = points.map((point, index) => {
    const x =
      points.length === 1 ? (left + width) / 2 : left + (index / (points.length - 1)) * (width - left - 8);
    return { ...point, x, y: yAt(point.value) };
  });
  const path = coords.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className='w-full text-primary'>
      {ticks.map((tick) => (
        <text
          key={tick}
          x={left - 6}
          y={yAt(tick) + 3}
          textAnchor='end'
          className='fill-foreground/50'
          fontSize='10'
          fontFamily='ui-monospace, monospace'
        >
          {format(tick)}
        </text>
      ))}
      <path d={path} fill='none' stroke='currentColor' strokeWidth='2' />
      {coords.map((point) => (
        <g key={point.date}>
          <circle cx={point.x} cy={point.y} r='3' fill='currentColor' />
          <text
            x={point.x}
            y={height - 6}
            textAnchor='middle'
            className='fill-foreground/50'
            fontSize='10'
            fontFamily='ui-monospace, monospace'
          >
            {Number(point.date.slice(8))}
          </text>
        </g>
      ))}
    </svg>
  );
}
