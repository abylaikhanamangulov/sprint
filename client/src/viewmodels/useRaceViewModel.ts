import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../models/api';
import { getErrorMessage } from '../models/errors';
import { useGameStore } from '../models/store';
import { DEFAULT_COSMETICS } from '../models/types';
import type {
  Car,
  CarCosmetics,
  MyCar,
  PendingWar,
  PveRaceResponse,
  ShiftQuality,
  WarGhost,
  WarRaceResult,
} from '../models/types';

export type RacePhase =
  | 'menu'
  | 'select'
  | 'intro'
  | 'burnout'
  | 'countdown'
  | 'racing'
  | 'result';
export type RaceMode = 'race' | 'free' | 'war';

export interface OpponentInfo {
  name: string;
  car: Car;
  cosmetics: CarCosmetics;
  targetTime: number; // seconds to cover the current distance
}

function ghostToCar(g: WarGhost): Car {
  return {
    id: -g.userId - 1,
    name: g.carName,
    class: g.carClass,
    drivetrain: g.drivetrain,
    isStarter: false,
    priceCoins: null,
    unlockCondition: null,
    baseStats: { speed: 220, acceleration: 190, handling: 150, nosPower: 120, weight: 1350 },
    maxGears: 6,
    basePP: 0,
    image: '',
  };
}
export type RaceLength = 'quarter' | 'half' | 'mile';

export const MAX_RPM = 9000;
export const IDLE_RPM = 1000;
export const REDLINE = 8200;

// Three selectable drag distances.
export const RACE_LENGTHS: { id: RaceLength; meters: number; label: string; sub: string }[] = [
  { id: 'quarter', meters: 402, label: '¼ мили', sub: '402 м' },
  { id: 'half', meters: 804, label: '½ мили', sub: '804 м' },
  { id: 'mile', meters: 1609, label: '1 миля', sub: '1609 м' },
];

function metersForLength(l: RaceLength): number {
  return RACE_LENGTHS.find((x) => x.id === l)?.meters ?? 402;
}
export const WARM_MAX_LEVEL = 4;
const NOS_FULL = 100;
const LAUNCH_SPEED = 16; // m/s — below this, launch grip still matters
export const OVERHEAT_LIMIT = 2.0; // seconds in the red before the engine blows

// ── Engine / transmission model ──────────────────────────────────────────────
// RPM is derived from wheel speed in the current gear (like a real gearbox), so
// a car can't sit in 5th at 70 km/h — you only reach a tall gear at real speed.
// Launch acceleration is calibrated to each car's REAL 0-100: the acceleration
// stat = 1000 / (real 0-100 s), and ACCEL_K converts it to m/s². Top speed comes
// straight from the speed stat (km/h). Verified vs real specs (Bugatti ≈ 2.0s).
const ACCEL_K = 0.04;
const TAPER_EXP = 2.2; // acceleration falls off approaching top speed
const ENGINE_BRAKE = 2.4; // coast-down when off throttle

// Pre-start launch rev window (NFS Underground style): rev into this on the
// lights for the best launch.
export const LAUNCH_ZONE: [number, number] = [6500, 7300];

// Speed (m/s) at which a gear hits the redline. Geometric spread: 1st gear is
// short (~0.2 of top → revs sweep fast, you shift often), top gear = top speed.
function gearTopSpeed(topMs: number, gear: number, maxGears: number): number {
  if (maxGears <= 1) return topMs;
  const ratio = Math.pow(5, 1 / (maxGears - 1));
  return topMs * Math.pow(ratio, gear - maxGears);
}

// Quick deterministic sim of a car over a distance (auto perfect shifts) — used
// to give the rival a target time from ITS OWN real performance.
function estimateTime(
  topKmh: number,
  accelStat: number,
  maxGears: number,
  meters: number
): number {
  const topMs = topKmh / 3.6;
  const A = ACCEL_K * accelStat;
  let v = 0;
  let d = 0;
  let t = 0;
  let gear = 1;
  const dt = 0.02;
  while (d < meters && t < 90) {
    const gTop = gearTopSpeed(topMs, gear, maxGears);
    const rpm = rpmForSpeed(v, gTop);
    const isLast = gear >= maxGears;
    if (!isLast && rpm >= REDLINE - 120) gear += 1;
    const taper = Math.max(0, 1 - Math.pow(v / topMs, TAPER_EXP));
    let a = A * Math.max(0.72, torqueAt(rpm)) * taper;
    if (isLast && v < topMs * 0.999) a = Math.max(a, 0.05);
    v = Math.max(0, Math.min(topMs, v + a * dt));
    d += v * dt;
    t += dt;
  }
  return Math.round(t * 1000) / 1000;
}

function revBoostFromRpm(rpm: number): number {
  if (rpm >= LAUNCH_ZONE[0] && rpm <= LAUNCH_ZONE[1]) return 1.3; // perfect launch
  if (rpm >= REDLINE) return 0.7; // over-rev → wheelspin
  if (rpm >= 4500) return 1.05; // close
  return 0.82; // bogged — revs too low
}

function rpmForSpeed(speed: number, gearTop: number): number {
  const r = IDLE_RPM + (speed / Math.max(1, gearTop)) * (REDLINE - IDLE_RPM);
  return Math.min(MAX_RPM, Math.max(IDLE_RPM, r));
}

// Normalised torque curve: builds from idle, peaks ~62%, tapers, falls in the red.
function torqueAt(rpm: number): number {
  const x = rpm / MAX_RPM;
  if (x < 0.62) return 0.55 + ((x - 0.1) / 0.52) * 0.45; // 0.55 → 1.0
  if (x < 0.911) return 1.0 - ((x - 0.62) / 0.291) * 0.28; // 1.0 → 0.72
  return Math.max(0.34, 0.72 - ((x - 0.911) / 0.089) * 0.42); // red falloff
}

/**
 * Burnout minigame (ProStreet-style), 10-second timer with a LIVE zone: the
 * throttle drives a needle (0..100). In the green zone warmth fills AND the zone
 * retreats left & shrinks. Out of zone, warmth DROPS and the zone eases back.
 */
export const WARM_TIME = 10; // seconds
const WARM_INIT_CENTER = 76;
const WARM_MIN_CENTER = 20;
const WARM_INIT_HALF = 9; // smaller green zone (was 14)
const WARM_MIN_HALF = 3;

export function warmLevelFromFill(fill: number): number {
  return Math.min(WARM_MAX_LEVEL, Math.max(1, Math.floor(fill / 25) + 1));
}

// Launch grip by warmth level (1 weak … 4 max). Higher = stronger bite.
function gripFromLevel(level: number): number {
  const grip: Record<number, number> = { 1: 0.85, 2: 0.97, 3: 1.08, 4: 1.18 };
  return grip[level] ?? 0.85;
}

export type ShiftZones = {
  perfect: [number, number]; // green — narrow, top edge AT the redline
  good: [number, number]; // blue — wider, also ending at the redline
};

/**
 * Shift windows always END at the redline (so blue & green touch the red, late-
 * shift zone) and tighten with every gear. `gear` is the gear being shifted OUT of.
 */
export function shiftZonesForGear(gear: number): ShiftZones {
  const g = Math.max(1, gear);
  const perfectW = Math.max(230, 720 - (g - 1) * 95);
  const goodW = Math.max(720, 1750 - (g - 1) * 190);
  return {
    perfect: [REDLINE - perfectW, REDLINE],
    good: [REDLINE - goodW, REDLINE],
  };
}

interface RaceViewModel {
  phase: RacePhase;
  mode: RaceMode;
  raceLength: RaceLength;
  distanceMeters: number;
  selectMode: RaceMode; // what the distance-select screen will start
  lights: number; // F1 start lights lit (0..5)
  lightsOut: boolean; // lights went out → GO
  rpm: number;
  speed: number; // km/h
  gear: number;
  maxGears: number;
  distance: number;
  raceTime: number;
  nosCharge: number; // 0..100
  nosActive: boolean;
  throttle: boolean;
  shifts: ShiftQuality[];
  shiftZones: ShiftZones;
  inPerfect: boolean;
  inGood: boolean;
  overRev: boolean;
  redTime: number; // cumulative seconds in the red zone
  dnf: boolean; // did-not-finish — engine overheated
  // burnout / launch
  warmNeedle: number; // 0..100 — throttle-driven marker
  warmFill: number; // 0..100 — warmth filled
  warmZone: [number, number]; // live green zone (0..100), retreats & shrinks when hit
  warmLevel: number; // 1..4
  warmTime: number; // seconds left in the 10s burnout
  wheelspin: boolean;
  nosInstalled: boolean; // NOS available only if bought/installed
  transmissionStage: number; // 0..6 — affects RPM drop on shift
  launchZone: [number, number]; // rev target on the start lights
  inLaunchZone: boolean; // rpm currently in the launch window (during lights)
  // free-run telemetry
  maxSpeedKmh: number;
  time100: number | null;
  time200: number | null;
  // opponent (PvE rival / clan-war ghost)
  opponent: OpponentInfo | null;
  opponentDistance: number; // metres covered by the opponent
  warOutcome: WarRaceResult | null;
  result: PveRaceResponse | null;
  error: string | null;
  selectedCar: MyCar | undefined;
  // actions
  chooseRace: () => void; // → distance selection (race)
  chooseFree: () => void; // → distance selection (free run)
  cancelSelect: () => void; // selection → menu
  startSelected: (length: RaceLength) => void; // start race or free per selectMode
  startRace: (length?: RaceLength) => void; // chosen distance → intro → burnout
  startFree: (length?: RaceLength) => void; // free run over a chosen distance
  startWar: (pending: PendingWar) => void; // clan-war ghost race
  goToBurnout: () => void; // intro → burnout
  launch: () => void; // finish burnout → countdown
  resetRun: () => void; // restart current run
  toMenu: () => void;
  setThrottle: (on: boolean) => void;
  shiftUp: () => void;
  shiftDown: () => void;
  activateNos: () => void;
}

interface SimState {
  rpm: number;
  speed: number; // m/s internally
  gear: number;
  distance: number;
  throttle: boolean;
  nosCharge: number;
  nosActive: boolean;
  nosTimer: number;
  lastShift: ShiftQuality | null;
  warmNeedle: number;
  warmFill: number;
  warmZoneCenter: number;
  warmZoneHalf: number;
  warmTimer: number;
  warmGrip: number; // grip from burnout, before the rev-launch multiplier
  launchGrip: number;
  launchRpm: number;
  wheelspin: boolean;
  redTime: number;
  maxSpeed: number; // m/s
  t100: number | null;
  t200: number | null;
}

function freshSim(): SimState {
  return {
    rpm: IDLE_RPM,
    speed: 0,
    gear: 0,
    distance: 0,
    throttle: false,
    nosCharge: NOS_FULL,
    nosActive: false,
    nosTimer: 0,
    lastShift: null,
    warmNeedle: 0,
    warmFill: 0,
    warmZoneCenter: WARM_INIT_CENTER,
    warmZoneHalf: WARM_INIT_HALF,
    warmTimer: WARM_TIME,
    warmGrip: 1,
    launchGrip: 1,
    launchRpm: 0,
    wheelspin: false,
    redTime: 0,
    maxSpeed: 0,
    t100: null,
    t200: null,
  };
}

export function useRaceViewModel(): RaceViewModel {
  const navigate = useNavigate();
  const { myCars, setScreen, fetchUser, fetchMyCars } = useGameStore();
  const pendingWar = useGameStore((s) => s.pendingWar);
  const setPendingWar = useGameStore((s) => s.setPendingWar);

  useEffect(() => {
    if (myCars.length === 0) {
      fetchMyCars();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCar = myCars.find((c) => c.isSelected) ?? myCars[0];
  const maxGears = selectedCar?.car.maxGears ?? 5;

  const [phase, setPhase] = useState<RacePhase>('menu');
  const [mode, setMode] = useState<RaceMode>('race');
  const [selectMode, setSelectMode] = useState<RaceMode>('race');
  const [raceLength, setRaceLength] = useState<RaceLength>('quarter');
  const [lights, setLights] = useState(0);
  const [lightsOut, setLightsOut] = useState(false);
  const [catalog, setCatalog] = useState<Car[]>([]);
  const [result, setResult] = useState<PveRaceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shifts, setShifts] = useState<ShiftQuality[]>([]);

  // Display state (written once per frame).
  const [rpm, setRpm] = useState(IDLE_RPM);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [gear, setGear] = useState(0);
  const [distance, setDistance] = useState(0);
  const [raceTime, setRaceTime] = useState(0);
  const [nosCharge, setNosCharge] = useState(NOS_FULL);
  const [nosActive, setNosActive] = useState(false);
  const [throttle, setThrottleState] = useState(false);
  const [warmNeedle, setWarmNeedle] = useState(0);
  const [warmFill, setWarmFill] = useState(0);
  const [warmZone, setWarmZone] = useState<[number, number]>([
    WARM_INIT_CENTER - WARM_INIT_HALF,
    WARM_INIT_CENTER + WARM_INIT_HALF,
  ]);
  const [warmTime, setWarmTime] = useState(WARM_TIME);
  const [wheelspin, setWheelspin] = useState(false);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState(0);
  const [time100, setTime100] = useState<number | null>(null);
  const [time200, setTime200] = useState<number | null>(null);
  const [opponent, setOpponent] = useState<OpponentInfo | null>(null);
  const [opponentDistance, setOpponentDistance] = useState(0);
  const [warOutcome, setWarOutcome] = useState<WarRaceResult | null>(null);
  const [redTime, setRedTime] = useState(0);
  const [dnf, setDnf] = useState(false);

  const sim = useRef<SimState>(freshSim());
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const phaseRef = useRef<RacePhase>('menu');
  const modeRef = useRef<RaceMode>('race');
  const distanceMetersRef = useRef<number>(402);
  const opponentRef = useRef<OpponentInfo | null>(null);
  const warCtxRef = useRef<{ clanId: number; warId: number; ghostTime: number } | null>(null);
  const maxGearsRef = useRef<number>(5);
  phaseRef.current = phase;
  modeRef.current = mode;
  distanceMetersRef.current = metersForLength(raceLength);
  opponentRef.current = opponent;
  maxGearsRef.current = maxGears;

  const accelStat = selectedCar?.currentStats.acceleration ?? 100;
  const speedStat = selectedCar?.currentStats.speed ?? 150;
  const nosStat = selectedCar?.currentStats.nosPower ?? 80;
  // NOS is only usable if it's been installed (bought) on this car.
  const nosInstalled = (selectedCar?.upgrades ?? []).some(
    (u) => u.category === 'nos' && u.stage >= 1
  );
  const transmissionStage = (selectedCar?.upgrades ?? []).find(
    (u) => u.category === 'transmission'
  )?.stage ?? 0;
  // Stage 0 → RPM drop 2100 on good shift, ×0.97 speed on miss.
  // Stage 6 → RPM drop 1300 on good shift, ×1.00 (no speed penalty) on miss.
  const rpmRetention = Math.round(2100 - transmissionStage * 133); // 2100 → 1302
  const missRetention = 1 - Math.max(0, 0.03 - transmissionStage * 0.005); // 0.97 → 1.00

  const topSpeedMs = speedStat / 3.6; // stat reads as top speed in km/h

  // Car catalog (for picking a distinct PvE rival car).
  useEffect(() => {
    api.cars.list().then(setCatalog).catch(() => undefined);
  }, []);

  const finishRace = useCallback(
    async (timeSec: number, finalShifts: ShiftQuality[], usedNos: boolean) => {
      try {
        const res = await api.races.pve({
          chapterId: 1,
          nodeId: 1,
          playerTime: Math.round(timeSec * 1000) / 1000,
          playerShifts: finalShifts,
          usedNos,
          distanceMeters: distanceMetersRef.current,
          opponentTime: opponentRef.current?.targetTime ?? 0,
        });
        setResult(res);
        fetchUser();
      } catch (e: unknown) {
        setError(getErrorMessage(e));
      }
    },
    [fetchUser]
  );

  const finishWar = useCallback(
    async (timeSec: number) => {
      const ctx = warCtxRef.current;
      if (!ctx) return;
      try {
        const res = await api.clans.warRace(
          ctx.clanId,
          ctx.warId,
          Math.round(timeSec * 1000) / 1000,
          ctx.ghostTime
        );
        setWarOutcome(res);
        fetchUser();
      } catch (e: unknown) {
        setError(getErrorMessage(e));
      }
    },
    [fetchUser]
  );

  // Main loop — handles both burnout (tyre warming) and racing (physics).
  const tick = useCallback(
    (ts: number) => {
      const s = sim.current;
      if (lastTsRef.current === 0) lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      // ── BURNOUT: 10s to warm tyres; chase the live, retreating green zone ─
      if (phaseRef.current === 'burnout') {
        s.warmTimer = Math.max(0, s.warmTimer - dt);
        // throttle drives the needle right; lifting lets it fall left
        s.warmNeedle = s.throttle
          ? Math.min(100, s.warmNeedle + 95 * dt)
          : Math.max(0, s.warmNeedle - 72 * dt);

        const zStart = s.warmZoneCenter - s.warmZoneHalf;
        const zEnd = s.warmZoneCenter + s.warmZoneHalf;
        if (s.warmNeedle >= zStart && s.warmNeedle <= zEnd) {
          // in the green: warm up; the zone clearly drifts LEFT and gradually shrinks
          s.warmFill = Math.min(100, s.warmFill + 18 * dt);
          s.warmZoneCenter = Math.max(WARM_MIN_CENTER, s.warmZoneCenter - 9 * dt);
          s.warmZoneHalf = Math.max(WARM_MIN_HALF, s.warmZoneHalf - 1.5 * dt);
        } else {
          // out of zone: warmth drops and the zone eases BACK to its start position
          s.warmFill = Math.max(0, s.warmFill - 10 * dt);
          const k = Math.min(1, 3 * dt);
          s.warmZoneCenter += (WARM_INIT_CENTER - s.warmZoneCenter) * k;
          s.warmZoneHalf += (WARM_INIT_HALF - s.warmZoneHalf) * k;
        }

        s.rpm = IDLE_RPM + (s.warmNeedle / 100) * (REDLINE - IDLE_RPM);
        setRpm(s.rpm);
        setWarmNeedle(s.warmNeedle);
        setWarmFill(s.warmFill);
        setWarmZone([s.warmZoneCenter - s.warmZoneHalf, s.warmZoneCenter + s.warmZoneHalf]);
        setWarmTime(s.warmTimer);

        // Time's up → grip locked from the burnout; go to the start lights.
        if (s.warmTimer <= 0) {
          s.warmGrip = gripFromLevel(warmLevelFromFill(s.warmFill));
          s.throttle = false;
          setThrottleState(false);
          setPhase('countdown');
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // ── STAGING (F1 lights): rev the engine; aim for the launch zone ─────
      if (phaseRef.current === 'countdown') {
        s.rpm = s.throttle
          ? Math.min(MAX_RPM, s.rpm + 7200 * dt) // punchy free-rev
          : Math.max(IDLE_RPM, s.rpm - 5600 * dt);
        setRpm(s.rpm);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const maxG = maxGearsRef.current;
      const isLast = s.gear >= maxG;
      const gTop = gearTopSpeed(topSpeedMs, s.gear, maxG);

      // RPM is derived from wheel speed in the current gear (real gearbox).
      let mechRpm = rpmForSpeed(s.speed, gTop);

      // Simulate clutch slip or wheelspin on launch so RPM doesn't drop to idle
      if (s.speed < LAUNCH_SPEED && s.gear === 1) {
        const k = s.speed / LAUNCH_SPEED;
        let slipRpm = s.wheelspin ? REDLINE : Math.max(mechRpm, s.launchRpm * 0.7);
        s.rpm = slipRpm * (1 - k) + mechRpm * k;
      } else {
        s.rpm = mechRpm;
      }

      // Cumulative time in the red (over-rev) zone — blows the engine, except on
      // the last gear (nowhere to shift, so flooring it is allowed).
      if (s.rpm >= REDLINE && !isLast) s.redTime += dt;

      // Acceleration from the car's real 0-100 (A), shaped by the torque curve
      // and tapering toward the real top speed.
      const A = ACCEL_K * accelStat;
      const overRevCut = s.rpm >= REDLINE && !isLast; // hitting the limiter in a low gear
      const tqEff = overRevCut ? 0 : Math.max(0.72, torqueAt(s.rpm)); // launch torque floor
      const v = s.speed / topSpeedMs;
      const taper = Math.max(0, 1 - Math.pow(v, TAPER_EXP));
      let accel: number;

      if (s.throttle && !overRevCut) {
        accel = A * tqEff * taper;
        // launch grip from the burnout (fades in over the first metres)
        if (s.speed < LAUNCH_SPEED) {
          const k = s.speed / LAUNCH_SPEED;
          accel *= s.launchGrip + (1 - s.launchGrip) * k;
        } else if (s.wheelspin) {
          s.wheelspin = false; // hooked up
        }
        if (s.nosActive) accel *= 1 + nosStat / 140;
        // last gear, full throttle: speed never drops — pull to top speed
        if (isLast && s.speed < topSpeedMs * 0.999) accel = Math.max(accel, 0.05);
      } else if (overRevCut) {
        // bouncing off the limiter in a non-final gear: drive cuts, speed bleeds
        accel = -3.5 - 1.5 * v;
      } else {
        accel = -ENGINE_BRAKE - 2 * v; // coast down
      }

      // NOS bookkeeping (independent of throttle).
      if (s.nosActive) {
        s.nosTimer -= dt;
        s.nosCharge = Math.max(0, s.nosCharge - (100 / 3) * dt);
        if (s.nosTimer <= 0 || s.nosCharge <= 0) s.nosActive = false;
      } else if (s.nosCharge < NOS_FULL) {
        s.nosCharge = Math.min(NOS_FULL, s.nosCharge + 7 * dt);
      }

      s.speed = Math.max(0, Math.min(topSpeedMs, s.speed + accel * dt));
      s.distance += s.speed * dt;

      // Telemetry.
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const kmh = s.speed * 3.6;
      if (s.t100 === null && kmh >= 100) s.t100 = elapsed;
      if (s.t200 === null && kmh >= 200) s.t200 = elapsed;
      if (s.speed > s.maxSpeed) s.maxSpeed = s.speed;

      // Opponent (rival / ghost) progress — paced to its target time.
      const opp = opponentRef.current;
      if (opp) {
        const prog = Math.min(1, Math.pow(elapsed / opp.targetTime, 1.25));
        setOpponentDistance(distanceMetersRef.current * prog);
      }

      // Commit to display state.
      setRpm(s.rpm);
      setSpeedKmh(kmh);
      setGear(s.gear);
      setDistance(s.distance);
      setNosCharge(s.nosCharge);
      setNosActive(s.nosActive);
      setWheelspin(s.wheelspin);
      setMaxSpeedKmh(s.maxSpeed * 3.6);
      setTime100(s.t100);
      setTime200(s.t200);
      setRedTime(s.redTime);
      setRaceTime(elapsed);

      // Engine blown — held the red zone too long (not in free run).
      if (modeRef.current !== 'free' && s.redTime > OVERHEAT_LIMIT) {
        setDnf(true);
        setPhase('result');
        if (modeRef.current === 'war') finishWar(9999);
        return;
      }

      // Finish in timed/war mode; free run never ends on its own.
      if (modeRef.current !== 'free' && s.distance >= distanceMetersRef.current) {
        setRaceTime(elapsed);
        setPhase('result');
        if (modeRef.current === 'war') {
          finishWar(elapsed);
        } else {
          const used = s.nosCharge < NOS_FULL;
          setShifts((prev) => {
            finishRace(elapsed, prev, used);
            return prev;
          });
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [accelStat, nosStat, topSpeedMs, finishRace, finishWar]
  );

  // Run the loop during burnout, staging (lights) and racing.
  useEffect(() => {
    if (phase !== 'burnout' && phase !== 'racing' && phase !== 'countdown') return;
    lastTsRef.current = 0;
    if (phase === 'racing') startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [phase, tick]);

  // F1 start lights: 5 reds light up one by one, then go out at a RANDOM time → GO.
  useEffect(() => {
    if (phase !== 'countdown') return;
    setLights(0);
    setLightsOut(false);
    let n = 0;
    let goTimer: ReturnType<typeof setTimeout> | undefined;
    const seq = setInterval(() => {
      n += 1;
      setLights(n);
      if (n >= 5) {
        clearInterval(seq);
        const hold = 400 + Math.random() * 1700; // random hold like real F1
        goTimer = setTimeout(() => {
          // Launch quality = burnout grip × where the tach was on the lights.
          const s = sim.current;
          const boost = revBoostFromRpm(s.rpm);
          s.launchGrip = Math.max(0.5, Math.min(1.6, s.warmGrip * boost));
          s.launchRpm = s.rpm;
          s.wheelspin = s.launchGrip < 0.85;
          s.gear = 1;
          setLightsOut(true);
          setPhase('racing');
        }, hold);
      }
    }, 550);
    return () => {
      clearInterval(seq);
      if (goTimer) clearTimeout(goTimer);
    };
  }, [phase]);

  const resetDisplay = useCallback(() => {
    setRpm(IDLE_RPM);
    setSpeedKmh(0);
    setGear(0);
    setDistance(0);
    setRaceTime(0);
    setNosCharge(NOS_FULL);
    setNosActive(false);
    setThrottleState(false);
    setWarmNeedle(0);
    setWarmFill(0);
    setWarmZone([WARM_INIT_CENTER - WARM_INIT_HALF, WARM_INIT_CENTER + WARM_INIT_HALF]);
    setWarmTime(WARM_TIME);
    setWheelspin(false);
    setMaxSpeedKmh(0);
    setTime100(null);
    setTime200(null);
    setOpponentDistance(0);
    setWarOutcome(null);
    setRedTime(0);
    setDnf(false);
    setShifts([]);
    setResult(null);
    setError(null);
  }, []);

  const RIVAL_NAMES = ['Кенджи', 'Виктор', 'Макс', 'Лео', 'Дитер', 'Хуан'];
  const makeRival = useCallback(
    (length: RaceLength): OpponentInfo => {
      const meters = metersForLength(length);
      // Pick a DIFFERENT real car, closest in PP to the player, so the opponent
      // is visibly its own model (not a clone of the player's car).
      const myPP = selectedCar?.currentPP ?? 150;
      const pool = catalog.filter((c) => c.id !== selectedCar?.car.id);
      let rivalCar: Car | undefined = pool[0];
      let best = Infinity;
      for (const c of pool) {
        const d = Math.abs(c.basePP - myPP);
        if (d < best) {
          best = d;
          rivalCar = c;
        }
      }
      const car = rivalCar ?? { ...(selectedCar?.car as Car), id: -999, name: 'Соперник' };
      // Rival drives ITS OWN car's real performance (a weaker car loses).
      const rivalTime = estimateTime(
        car.baseStats.speed,
        car.baseStats.acceleration,
        car.maxGears,
        meters
      );
      return {
        name: RIVAL_NAMES[Math.floor(Math.random() * RIVAL_NAMES.length)],
        car,
        cosmetics: { ...DEFAULT_COSMETICS, paintType: 'matte', paintColor: '#e23b3b' },
        targetTime: rivalTime * (0.97 + Math.random() * 0.06),
      };
    },
    [selectedCar, catalog]
  );

  const chooseRace = useCallback(() => {
    setSelectMode('race');
    setPhase('select');
  }, []);
  const chooseFree = useCallback(() => {
    setSelectMode('free');
    setPhase('select');
  }, []);
  const cancelSelect = useCallback(() => setPhase('menu'), []);

  const startRace = useCallback(
    (length: RaceLength = raceLength) => {
      sim.current = freshSim();
      resetDisplay();
      setRaceLength(length);
      distanceMetersRef.current = metersForLength(length);
      setMode('race');
      setOpponent(makeRival(length));
      setPhase('intro'); // show the "vs" panel first
    },
    [resetDisplay, raceLength, makeRival]
  );

  const goToBurnout = useCallback(() => setPhase('burnout'), []);

  const startFree = useCallback(
    (length: RaceLength = raceLength) => {
      sim.current = freshSim();
      resetDisplay();
      setRaceLength(length);
      distanceMetersRef.current = metersForLength(length);
      setMode('free');
      setOpponent(null);
      startTimeRef.current = performance.now();
      setPhase('racing'); // straight to driving — no countdown, no finish
    },
    [resetDisplay, raceLength]
  );

  const startSelected = useCallback(
    (length: RaceLength) => {
      if (selectMode === 'free') startFree(length);
      else startRace(length);
    },
    [selectMode, startFree, startRace]
  );

  const startWar = useCallback(
    (pending: PendingWar) => {
      sim.current = freshSim();
      resetDisplay();
      setRaceLength('quarter'); // clan war = quarter mile
      distanceMetersRef.current = 402;
      setMode('war');
      warCtxRef.current = {
        clanId: pending.clanId,
        warId: pending.warId,
        ghostTime: pending.ghost.time,
      };
      setOpponent({
        name: pending.ghost.name,
        car: ghostToCar(pending.ghost),
        cosmetics: { ...DEFAULT_COSMETICS, paintType: 'matte', paintColor: '#9b59b6' },
        targetTime: pending.ghost.time,
      });
      setPhase('intro');
    },
    [resetDisplay]
  );

  // Consume a war race queued from the clan screen.
  useEffect(() => {
    if (pendingWar) {
      startWar(pendingWar);
      setPendingWar(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingWar]);

  const launch = useCallback(() => {
    const s = sim.current;
    s.warmGrip = gripFromLevel(warmLevelFromFill(s.warmFill)); // grip from burnout
    s.throttle = false;
    setThrottleState(false);
    setPhase('countdown'); // F1 lights + rev launch decide the final grip
  }, []);

  const resetRun = useCallback(() => {
    const m = modeRef.current;
    sim.current = freshSim();
    resetDisplay();
    if (m === 'free') {
      startTimeRef.current = performance.now();
      setPhase('racing');
    } else {
      setPhase('burnout');
    }
  }, [resetDisplay]);

  const toMenu = useCallback(() => {
    setPhase('menu');
    navigate('/hub');
  }, [navigate]);

  const setThrottle = useCallback((on: boolean) => {
    sim.current.throttle = on;
    setThrottleState(on);
  }, []);

  const shiftUp = useCallback(() => {
    const s = sim.current;
    if (phaseRef.current !== 'racing' || s.gear >= maxGears) return;
    const zones = shiftZonesForGear(s.gear);
    let quality: ShiftQuality;
    if (s.rpm >= zones.perfect[0]) {
      quality = 'perfect'; // at/near the redline — no RPM penalty, full momentum
    } else if (s.rpm >= zones.good[0]) {
      quality = 'good';
      // Speed dips proportionally to how much RPM falls below the power band.
      // Better transmission = smaller RPM drop = speed bleeds less.
      const overshoot = Math.max(0, zones.perfect[0] - s.rpm) / (REDLINE - IDLE_RPM);
      s.speed *= 1 - overshoot * 0.04;
    } else {
      quality = 'miss'; // shifted way too early
      s.speed *= missRetention; // transmission stage 6 = no penalty
    }
    s.gear += 1;
    s.lastShift = quality;
    setShifts((prev) => [...prev, quality]);
  }, [maxGears, missRetention]);

  const shiftDown = useCallback(() => {
    const s = sim.current;
    if (phaseRef.current !== 'racing' || s.gear <= 1) return;
    s.gear -= 1; // rpm jumps up next tick (shorter gear) — useful to recover torque
  }, []);

  const activateNos = useCallback(() => {
    const s = sim.current;
    if (!nosInstalled || phaseRef.current !== 'racing' || s.nosActive || s.nosCharge < 25) return;
    s.nosActive = true;
    s.nosTimer = 3;
  }, [nosInstalled]);

  const shiftZones = shiftZonesForGear(gear);
  const overRev = rpm >= REDLINE;
  const inPerfect = rpm >= shiftZones.perfect[0] && rpm < REDLINE;
  const inGood = !inPerfect && !overRev && rpm >= shiftZones.good[0];

  return {
    phase,
    mode,
    raceLength,
    distanceMeters: metersForLength(raceLength),
    selectMode,
    lights,
    lightsOut,
    rpm,
    speed: speedKmh,
    gear,
    maxGears,
    distance,
    raceTime,
    nosCharge,
    nosActive,
    throttle,
    shifts,
    shiftZones,
    inPerfect,
    inGood,
    overRev,
    redTime,
    dnf,
    warmNeedle,
    warmFill,
    warmZone,
    warmLevel: warmLevelFromFill(warmFill),
    warmTime,
    wheelspin,
    nosInstalled,
    launchZone: LAUNCH_ZONE,
    inLaunchZone: rpm >= LAUNCH_ZONE[0] && rpm <= LAUNCH_ZONE[1],
    transmissionStage,
    maxSpeedKmh,
    time100,
    time200,
    opponent,
    opponentDistance,
    warOutcome,
    result,
    error,
    selectedCar,
    chooseRace,
    chooseFree,
    cancelSelect,
    startSelected,
    startRace,
    startFree,
    startWar,
    goToBurnout,
    launch,
    resetRun,
    toMenu,
    setThrottle,
    shiftUp,
    shiftDown,
    activateNos,
  };
}
