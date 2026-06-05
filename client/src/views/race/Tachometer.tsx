import { MAX_RPM, REDLINE } from '../../viewmodels/useRaceViewModel';
import type { ShiftZones } from '../../viewmodels/useRaceViewModel';

interface Props {
  rpm: number;
  gear: number;
  zones: ShiftZones;
  size?: number;
}

// Dial sweeps from 135° (min) to 405° (=45°, max), i.e. 270° of arc.
const START_ANGLE = 135;
const SWEEP = 270;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

function valueToAngle(value: number, max: number): number {
  return START_ANGLE + (Math.min(value, max) / max) * SWEEP;
}

export function Tachometer({ rpm, gear, zones, size = 150 }: Props) {
  const cx = 100;
  const cy = 100;
  const r = 88;

  const ticks = Array.from({ length: 10 }, (_, i) => i); // 0..9 (x1000)
  const needleAngle = valueToAngle(rpm, MAX_RPM);
  const needle = polar(cx, cy, r - 16, needleAngle);

  // Two NFS-style windows: blue = good (wider), green = perfect (narrow, on top).
  const goodStart = valueToAngle(zones.good[0], MAX_RPM);
  const goodEnd = valueToAngle(zones.good[1], MAX_RPM);
  const perfectStart = valueToAngle(zones.perfect[0], MAX_RPM);
  const perfectEnd = valueToAngle(zones.perfect[1], MAX_RPM);
  const redStart = valueToAngle(REDLINE, MAX_RPM);
  const redEnd = valueToAngle(MAX_RPM, MAX_RPM);

  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <defs>
        <radialGradient id="tachFace" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#16306b" />
          <stop offset="70%" stopColor="#0b1b3f" />
          <stop offset="100%" stopColor="#060d22" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r="96" fill="#0a0e1a" stroke="#222a44" strokeWidth="3" />
      <circle cx={cx} cy={cy} r="92" fill="url(#tachFace)" />

      {/* good zone (blue), perfect zone (green, on top), redline (red) */}
      <path d={arcPath(cx, cy, r, goodStart, goodEnd)} fill="none" stroke="#2d8cf0" strokeWidth="6" strokeLinecap="round" />
      <path d={arcPath(cx, cy, r, perfectStart, perfectEnd)} fill="none" stroke="#2ed573" strokeWidth="6" strokeLinecap="round" />
      <path d={arcPath(cx, cy, r, redStart, redEnd)} fill="none" stroke="#ff4757" strokeWidth="6" strokeLinecap="round" />

      {/* ticks + numbers */}
      {ticks.map((t) => {
        const angle = valueToAngle(t * 1000, MAX_RPM);
        const outer = polar(cx, cy, r, angle);
        const inner = polar(cx, cy, r - 10, angle);
        const label = polar(cx, cy, r - 24, angle);
        const isRed = t * 1000 >= REDLINE;
        return (
          <g key={t}>
            <line
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke={isRed ? '#ff4757' : '#aeb6d0'}
              strokeWidth="2"
            />
            <text
              x={label.x}
              y={label.y + 4}
              fill={isRed ? '#ff6b78' : '#cfd6ec'}
              fontSize="13"
              fontWeight="700"
              textAnchor="middle"
            >
              {t}
            </text>
          </g>
        );
      })}

      {/* gear in center */}
      <circle cx={cx} cy={cy} r="30" fill="#0a142e" stroke="#2a3050" strokeWidth="2" />
      <text x={cx} y={cy + 9} fill="#e8eaf0" fontSize="30" fontWeight="900" textAnchor="middle">
        {gear === 0 ? 'N' : gear}
      </text>
      <text x={cx} y={cy + 42} fill="#8890a8" fontSize="9" fontWeight="700" textAnchor="middle">
        RPM x1000
      </text>

      {/* needle */}
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="#ff4757" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#ff4757" />
    </svg>
  );
}
