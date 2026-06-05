import styled, { css, keyframes } from 'styled-components';
import type { Car, CarCosmetics, Drivetrain } from '../../models/types';
import { CarSprite } from '../components/CarSprite';

interface Props {
  car: Car;
  cosmetics?: CarCosmetics;
  speed: number; // km/h
  distance: number; // metres — drives all parallax (smooth, speed-accurate)
  nosActive: boolean;
  smoke: boolean; // burnout or wheelspin
  opponentCar?: Car | null;
  opponentCosmetics?: CarCosmetics;
  opponentGap?: number; // metres ahead(+)/behind(−) of the player
}

const PX_PER_M = 12;

const Scene = styled.div`
  position: relative;
  width: 100%;
  height: 190px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: linear-gradient(180deg, #0a0f24 0%, #131a3a 45%, #0c1024 100%);
`;

// ── Static bands (the road itself never scrolls) ─────────────────────────────
const Band = styled.div<{ $top: number; $height: number }>`
  position: absolute;
  left: 0;
  right: 0;
  top: ${({ $top }) => $top}px;
  height: ${({ $height }) => $height}px;
`;

const Stands = styled(Band)`
  background-image: repeating-linear-gradient(90deg, #1b2240 0 18px, #232b4a 18px 20px);
  opacity: 0.8;
`;

const TireWall = styled(Band)`
  background-image: repeating-linear-gradient(90deg, #c0392b 0 20px, #ecf0f1 20px 40px);
  border-top: 2px solid #0a0e1a;
  border-bottom: 2px solid #0a0e1a;
`;

const Guardrail = styled(Band)`
  background-image: repeating-linear-gradient(90deg, #6b7280 0 30px, #9aa0ad 30px 34px);
`;

const Asphalt = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 26px;
  height: 70px;
  background: linear-gradient(180deg, #2b2f3a, #1c1f28);
`;

const Grass = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 26px;
  background: repeating-linear-gradient(90deg, #1d3b1f 0 12px, #20431f 12px 24px);
`;

// Lane dashes move via background-position (driven by distance) — no keyframe reset.
const LaneDashes = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 40px;
  height: 6px;
  background-image: repeating-linear-gradient(90deg, #d8dde8 0 34px, transparent 34px 74px);
  background-size: 74px 100%;
`;

// ── Parallax decorations behind the car ──────────────────────────────────────
const DecorLayer = styled.div`
  position: absolute;
  left: 0;
  bottom: 92px;
  height: 60px;
  width: 100%;
  will-change: transform;
`;

const DECOR_SPACING = 150;
const DECOR_COUNT = 16;

const Post = styled.div`
  position: absolute;
  bottom: 0;
  width: 4px;
  height: 52px;
  background: #3a4663;
  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -7px;
    width: 18px;
    height: 8px;
    border-radius: 4px;
    background: #ffd86b;
    box-shadow: 0 0 8px 2px rgba(255, 216, 107, 0.5);
  }
`;

const Billboard = styled.div`
  position: absolute;
  bottom: 6px;
  width: 64px;
  height: 40px;
  border-radius: 4px;
  background: linear-gradient(135deg, #243056, #182142);
  border: 2px solid #0c1024;
  box-shadow: 0 0 0 2px #2c3a66 inset;
`;

// ── Car ──────────────────────────────────────────────────────────────────────
const bob = keyframes`
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-1.5px); }
`;
const shake = keyframes`
  0% { transform: translateX(-50%) translateY(0); }
  25% { transform: translateX(-51%) translateY(1px); }
  75% { transform: translateX(-49%) translateY(-1px); }
  100% { transform: translateX(-50%) translateY(0); }
`;

const CarLayer = styled.div<{ $nos: boolean; $shake: boolean }>`
  position: absolute;
  bottom: 24px;
  left: 44%;
  transform: translateX(-50%);
  z-index: 3;
  animation: ${({ $shake }) => ($shake ? shake : bob)} ${({ $shake }) => ($shake ? '0.12s' : '0.6s')}
    linear infinite;
  ${({ $nos }) =>
    $nos &&
    css`
      filter: drop-shadow(0 0 10px rgba(150, 110, 255, 0.9));
    `}
`;

// Opponent sits in a further lane (higher, smaller, behind the player).
const OpponentLayer = styled.div<{ $shift: number }>`
  position: absolute;
  bottom: 64px;
  left: 44%;
  transform: translateX(calc(-50% + ${({ $shift }) => $shift}px)) scale(0.78);
  z-index: 2;
  opacity: 0.9;
  filter: brightness(0.85);
`;

const nosStreak = keyframes`
  from { transform: translateX(0); opacity: 0.9; }
  to { transform: translateX(-60px); opacity: 0; }
`;
const NosFlame = styled.div`
  position: absolute;
  right: 100%;
  bottom: 6px;
  width: 60px;
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(90deg, transparent, #7c4dff, #c4b5ff);
  animation: ${nosStreak} 0.35s linear infinite;
`;

// ── Tyre smoke ───────────────────────────────────────────────────────────────
const puff = keyframes`
  0% { transform: translateX(0) scale(0.4); opacity: 0.75; }
  100% { transform: translateX(-46px) scale(1.5); opacity: 0; }
`;
const Smoke = styled.div<{ $side: 'rear' | 'front'; $delay: number }>`
  position: absolute;
  bottom: 2px;
  ${({ $side }) => ($side === 'rear' ? 'left: 8px;' : 'right: 8px;')}
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(225, 228, 236, 0.9), rgba(190, 195, 210, 0));
  animation: ${puff} 0.6s ease-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`;

function smokeSides(dt: Drivetrain): ('rear' | 'front')[] {
  if (dt === 'fwd') return ['front'];
  if (dt === 'awd') return ['rear', 'front'];
  return ['rear']; // rwd
}

export function RaceTrack({
  car,
  cosmetics,
  speed,
  distance,
  nosActive,
  smoke,
  opponentCar,
  opponentCosmetics,
  opponentGap = 0,
}: Props) {
  const offset = distance * PX_PER_M;
  const decorShift = -(offset % DECOR_SPACING);
  const cityShift = -((offset * 0.25) % 80);
  const dashShift = -(offset % 74);
  const oppShift = Math.max(-150, Math.min(280, opponentGap * 2.4));

  const decorItems = Array.from({ length: DECOR_COUNT }, (_, i) => i - 1);

  return (
    <Scene>
      {/* distant city — slow parallax */}
      <Band
        $top={20}
        $height={26}
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #11183a 0 14px, #0c1230 14px 16px, #161f44 16px 30px)',
          backgroundPositionX: `${cityShift}px`,
          opacity: 0.6,
        }}
      />
      <Stands $top={44} $height={20} />
      <TireWall $top={62} $height={14} />
      <Guardrail $top={78} $height={8} />

      {/* decorations behind the car */}
      <DecorLayer style={{ transform: `translateX(${decorShift}px)` }}>
        {decorItems.map((i) =>
          i % 4 === 0 ? (
            <Billboard key={i} style={{ left: i * DECOR_SPACING }} />
          ) : (
            <Post key={i} style={{ left: i * DECOR_SPACING + 40 }} />
          )
        )}
      </DecorLayer>

      <Asphalt />
      <LaneDashes style={{ backgroundPositionX: `${dashShift}px` }} />
      <Grass />

      {opponentCar && (
        <OpponentLayer $shift={oppShift}>
          <CarSprite car={opponentCar} width={150} cosmetics={opponentCosmetics} />
        </OpponentLayer>
      )}

      <CarLayer $nos={nosActive} $shake={smoke}>
        {nosActive && <NosFlame />}
        {smoke &&
          smokeSides(car.drivetrain).map((side) => (
            <span key={side}>
              <Smoke $side={side} $delay={0} />
              <Smoke $side={side} $delay={0.3} />
            </span>
          ))}
        <CarSprite car={car} width={170} cosmetics={cosmetics} />
      </CarLayer>

      {/* faint speed lines when quick */}
      {speed > 80 && (
        <Band
          $top={150}
          $height={30}
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 30px, transparent 30px 90px)',
            backgroundPositionX: `${-(offset * 1.5 % 120)}px`,
          }}
        />
      )}
    </Scene>
  );
}
