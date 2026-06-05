interface Props {
  needle: number; // 0..100
  zone: [number, number]; // 0..100 green window
  timeLeft: number; // seconds
  fill: number; // 0..100 warmth percent
  size?: number;
}

// Top semicircle: value 0 → left (180°), 100 → right (360°).
function angleFor(v: number): number {
  return 180 + (Math.min(100, Math.max(0, v)) / 100) * 180;
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

export function BurnoutGauge({ needle, zone, timeLeft, fill, size = 220 }: Props) {
  const cx = 110;
  const cy = 116;
  const r = 92;

  const zStartA = angleFor(zone[0]);
  const zEndA = angleFor(zone[1]);
  const needleA = angleFor(needle);
  const inZone = needle >= zone[0] && needle <= zone[1];

  const nOuter = polar(cx, cy, r + 6, needleA);
  const nInner = polar(cx, cy, r - 18, needleA);

  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 220 134" style={{ display: 'block', margin: '0 auto' }}>
      <defs>
        <linearGradient id="grTrack" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2d8cf0" />
          <stop offset="55%" stopColor="#2ed573" />
          <stop offset="100%" stopColor="#ff4757" />
        </linearGradient>
      </defs>

      {/* track */}
      <path d={arc(cx, cy, r, 180, 360)} fill="none" stroke="#11162a" strokeWidth="18" strokeLinecap="round" />
      <path d={arc(cx, cy, r, 180, 360)} fill="none" stroke="url(#grTrack)" strokeWidth="4" strokeLinecap="round" opacity="0.35" />

      {/* green zone */}
      <path
        d={arc(cx, cy, r, zStartA, zEndA)}
        fill="none"
        stroke="#2ed573"
        strokeWidth="18"
        strokeLinecap="round"
        opacity={inZone ? 1 : 0.7}
      />

      {/* needle */}
      <line
        x1={nInner.x}
        y1={nInner.y}
        x2={nOuter.x}
        y2={nOuter.y}
        stroke={inZone ? '#2ed573' : '#fff'}
        strokeWidth="4"
        strokeLinecap="round"
        style={{ filter: inZone ? 'drop-shadow(0 0 5px rgba(46,213,115,0.9))' : 'none' }}
      />
      <circle cx={cx} cy={cy} r="6" fill="#e8eaf0" />

      {/* centre readout */}
      <text x={cx} y={cy - 30} textAnchor="middle" fontSize="34" fontWeight="900" fill={timeLeft <= 3 ? '#ff4757' : '#e8eaf0'}>
        {timeLeft.toFixed(1)}
      </text>
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize="11" fontWeight="800" fill="#2ed573">
        ПРОГРЕВ {Math.round(fill)}%
      </text>
    </svg>
  );
}
