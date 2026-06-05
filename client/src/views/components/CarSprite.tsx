import { useState } from 'react';
import type {
  Car,
  CarClass,
  CarCosmetics,
  PaintType,
  WheelStyle,
  SpoilerStyle,
  IntakeStyle,
} from '../../models/types';
import { DEFAULT_COSMETICS } from '../../models/types';

interface Props {
  car: Car;
  width?: number;
  /** Optional override; falls back to car.image, then to procedural SVG. */
  spriteUrl?: string;
  /** Applied external cosmetics (universal across all cars). */
  cosmetics?: CarCosmetics;
}

type Archetype = 'hatch' | 'sedan' | 'coupe' | 'muscle' | 'supercar' | 'hyper';

const ARCHETYPE_BY_CLASS: Record<CarClass, Archetype> = {
  D: 'hatch',
  C: 'sedan',
  B: 'coupe',
  A: 'muscle',
  S: 'supercar',
  X: 'hyper',
};

function hashHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) % 360;
  }
  return h;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function shade(hex: string, amt: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 255) * amt);
  const g = clamp(((n >> 8) & 255) * amt);
  const b = clamp((n & 255) * amt);
  return `rgb(${r}, ${g}, ${b})`;
}

interface Paint {
  body: string;
  bodyDark: string;
  sheen: 'none' | 'soft' | 'strong';
  chrome: boolean;
}

function resolvePaint(hue: number, type: PaintType, override: string): Paint {
  if (type === 'chrome') {
    return { body: '#d7dde6', bodyDark: '#7c8694', sheen: 'strong', chrome: true };
  }
  const sat = type === 'matte' ? 32 : type === 'metallic' ? 48 : 62;
  const light = type === 'matte' ? 40 : type === 'metallic' ? 56 : 50;
  const body = override || hslToHex(hue, sat, light);
  return {
    body,
    bodyDark: shade(body, 0.66),
    sheen: type === 'matte' ? 'none' : type === 'metallic' ? 'strong' : 'soft',
    chrome: false,
  };
}

// ── Wheels (universal) ───────────────────────────────────────────────────────
function Wheel({ cx, cy, r, style }: { cx: number; cy: number; r: number; style: WheelStyle }) {
  const spokes = [];
  if (style === 'sport') {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      spokes.push(
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={cx + Math.cos(a) * r * 0.62}
          y2={cy + Math.sin(a) * r * 0.62}
          stroke="#c7ced8"
          strokeWidth={r * 0.16}
          strokeLinecap="round"
        />
      );
    }
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#15171f" stroke="#000" strokeWidth="1" />
      {style === 'deepdish' ? (
        <>
          <circle cx={cx} cy={cy} r={r * 0.78} fill="#2a2f3a" />
          <circle cx={cx} cy={cy} r={r * 0.6} fill="#c7ced8" />
          <circle cx={cx} cy={cy} r={r * 0.3} fill="#6b7280" />
        </>
      ) : style === 'sport' ? (
        <>
          <circle cx={cx} cy={cy} r={r * 0.62} fill="#3b4252" />
          {spokes}
          <circle cx={cx} cy={cy} r={r * 0.2} fill="#e8eaf0" />
        </>
      ) : (
        <>
          <circle cx={cx} cy={cy} r={r * 0.55} fill="#3b4252" />
          <circle cx={cx} cy={cy} r={r * 0.18} fill="#8890a8" />
        </>
      )}
    </g>
  );
}

function ProceduralCar({
  car,
  width,
  cosmetics,
}: {
  car: Car;
  width?: number;
  cosmetics: CarCosmetics;
}) {
  const w = width ?? 220;
  const h = w * 0.5;
  const archetype = ARCHETYPE_BY_CLASS[car.class];

  const hue = hashHue(`${car.id}-${car.name}`);
  const paint = resolvePaint(hue, cosmetics.paintType, cosmetics.paintColor);
  const { body, bodyDark } = paint;
  const glass = '#2a3550';

  const speed = car.baseStats.speed;
  const weight = car.baseStats.weight;
  const wheelR = 16 + Math.min(9, (speed - 120) / 28);
  const rideHeight = weight > 1500 ? 6 : weight > 1200 ? 3 : archetype === 'hyper' ? -2 : 1;

  const VB_W = 200;
  const VB_H = 100;
  const baseY = 74 + rideHeight;
  const wheelFrontX = 52;
  const wheelRearX = 150;
  const uid = `${car.id}-${cosmetics.paintType}`;

  const roof = (() => {
    switch (archetype) {
      case 'hatch':
        return 'M40,52 L62,30 L150,30 L170,52 Z';
      case 'sedan':
        return 'M44,52 L66,32 L142,32 L166,52 Z';
      case 'coupe':
        return 'M48,52 L78,30 L138,32 L168,52 Z';
      case 'muscle':
        return 'M40,52 L70,34 L140,34 L176,52 Z';
      case 'supercar':
        return 'M44,54 L86,38 L132,40 L172,54 Z';
      case 'hyper':
        return 'M48,56 L92,42 L128,44 L176,56 Z';
    }
  })();

  const bodyPath = (() => {
    switch (archetype) {
      case 'hyper':
        return `M10,${baseY} L14,60 L40,55 L176,55 L192,62 L194,${baseY} Z`;
      case 'supercar':
        return `M14,${baseY} L18,58 L40,54 L172,54 L188,60 L190,${baseY} Z`;
      case 'muscle':
        return `M12,${baseY} L16,56 L40,52 L176,52 L190,58 L192,${baseY} Z`;
      default:
        return `M16,${baseY} L20,56 L40,52 L168,52 L186,58 L188,${baseY} Z`;
    }
  })();

  const sheenOpacity = paint.sheen === 'strong' ? 0.4 : paint.sheen === 'soft' ? 0.18 : 0;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label={car.name} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={sheenOpacity} />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {paint.chrome && (
          <linearGradient id={`chrome-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4f7fb" />
            <stop offset="50%" stopColor="#aeb6c4" />
            <stop offset="100%" stopColor="#5b6472" />
          </linearGradient>
        )}
      </defs>

      <ellipse cx="100" cy={baseY + wheelR + 4} rx="86" ry="6" fill="rgba(0,0,0,0.35)" />

      {/* GT wing (rear = left side) — drawn behind the body */}
      {cosmetics.spoiler === 'gt' && (
        <g fill={bodyDark}>
          <rect x={22} y={38} width={3} height={baseY - 6 - 38} />
          <rect x={34} y={38} width={3} height={baseY - 6 - 38} />
          <rect x={12} y={34} width={36} height={6} rx={2} fill={body} stroke={bodyDark} strokeWidth={1} />
        </g>
      )}

      {/* body */}
      <path d={bodyPath} fill={paint.chrome ? `url(#chrome-${uid})` : body} stroke={bodyDark} strokeWidth="1.5" strokeLinejoin="round" />
      <path d={`M16,${baseY} L188,${baseY} L186,${baseY - 6} L18,${baseY - 6} Z`} fill={bodyDark} opacity="0.6" />
      <path d={roof} fill={bodyDark} stroke={bodyDark} strokeWidth="1" />
      <path d={bodyPath} fill={`url(#sheen-${uid})`} />

      {/* windows */}
      <path
        d={archetype === 'supercar' || archetype === 'hyper' ? 'M52,52 L88,42 L128,44 L162,52 Z' : 'M50,50 L70,34 L138,34 L162,50 Z'}
        fill={glass}
        opacity="0.85"
      />
      <line x1="104" y1="34" x2="104" y2="50" stroke={bodyDark} strokeWidth="1.5" opacity="0.7" />

      {/* hood scoop / air intake (front area) */}
      {cosmetics.intake === 'hood' && (
        <g>
          <path d="M112,52 L120,46 L140,46 L146,52 Z" fill="#0d0f16" stroke={bodyDark} strokeWidth="1" />
          <rect x="120" y="47" width="18" height="2.5" rx="1" fill="#000" />
        </g>
      )}

      {/* lip spoiler (rear) */}
      {cosmetics.spoiler === 'lip' && (
        <path d={`M16,${baseY - 6} L16,${baseY - 13} L30,${baseY - 9} L40,${baseY - 6} Z`} fill={bodyDark} />
      )}

      {/* headlight + taillight */}
      <circle cx="184" cy={baseY - 12} r="3" fill="#fff4c2" />
      <rect x="15" y={baseY - 16} width="4" height="6" rx="1" fill="#e23b3b" />

      {/* wheels */}
      <Wheel cx={wheelFrontX} cy={baseY + wheelR - 2} r={wheelR} style={cosmetics.wheels} />
      <Wheel cx={wheelRearX} cy={baseY + wheelR - 2} r={wheelR} style={cosmetics.wheels} />
    </svg>
  );
}

export function CarSprite({ car, width, spriteUrl, cosmetics }: Props) {
  const src = spriteUrl ?? car.image;
  const [useFallback, setUseFallback] = useState(!src);
  const cos = cosmetics ?? DEFAULT_COSMETICS;

  if (useFallback) {
    return <ProceduralCar car={car} width={width} cosmetics={cos} />;
  }

  return (
    <img
      src={src}
      alt={car.name}
      width={width ?? 220}
      onError={() => setUseFallback(true)}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  );
}

// Re-exported for tuning UI option lists.
export type { WheelStyle, SpoilerStyle, IntakeStyle, PaintType };
