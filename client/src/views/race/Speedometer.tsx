interface Props {
  speed: number; // km/h
  maxSpeed?: number;
  size?: number;
}

const START_ANGLE = 135;
const SWEEP = 270;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function valueToAngle(value: number, max: number): number {
  return START_ANGLE + (Math.min(value, max) / max) * SWEEP;
}

export function Speedometer({ speed, maxSpeed = 360, size = 150 }: Props) {
  const cx = 100;
  const cy = 100;
  const r = 88;

  const step = 40;
  const ticks = Array.from({ length: maxSpeed / step + 1 }, (_, i) => i * step);
  const needleAngle = valueToAngle(speed, maxSpeed);
  const needle = polar(cx, cy, r - 16, needleAngle);

  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <defs>
        <radialGradient id="speedoFace" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#16306b" />
          <stop offset="70%" stopColor="#0b1b3f" />
          <stop offset="100%" stopColor="#060d22" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r="96" fill="#0a0e1a" stroke="#222a44" strokeWidth="3" />
      <circle cx={cx} cy={cy} r="92" fill="url(#speedoFace)" />

      {ticks.map((t) => {
        const angle = valueToAngle(t, maxSpeed);
        const outer = polar(cx, cy, r, angle);
        const inner = polar(cx, cy, r - 9, angle);
        const label = polar(cx, cy, r - 24, angle);
        return (
          <g key={t}>
            <line x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="#aeb6d0" strokeWidth="2" />
            <text x={label.x} y={label.y + 4} fill="#cfd6ec" fontSize="11" fontWeight="700" textAnchor="middle">
              {t}
            </text>
          </g>
        );
      })}

      <circle cx={cx} cy={cy} r="30" fill="#0a142e" stroke="#2a3050" strokeWidth="2" />
      <text x={cx} y={cy + 4} fill="#e8eaf0" fontSize="22" fontWeight="900" textAnchor="middle">
        {Math.round(speed)}
      </text>
      <text x={cx} y={cy + 20} fill="#8890a8" fontSize="9" fontWeight="700" textAnchor="middle">
        км/ч
      </text>

      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="#4e7cff" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#4e7cff" />
    </svg>
  );
}
