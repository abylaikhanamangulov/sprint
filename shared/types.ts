export type CarClass = 'D' | 'C' | 'B' | 'A' | 'S' | 'X';
export type Drivetrain = 'fwd' | 'rwd' | 'awd';

// ── External cosmetics (universal — render on any car, Lada → Bugatti) ──
export type WheelStyle = 'stock' | 'sport' | 'deepdish';
export type SpoilerStyle = 'none' | 'lip' | 'gt';
export type IntakeStyle = 'none' | 'hood';
export type PaintType = 'gloss' | 'metallic' | 'matte' | 'chrome';

export interface CarCosmetics {
  paintType: PaintType;
  paintColor: string; // hex; '' = car's default hue
  wheels: WheelStyle;
  spoiler: SpoilerStyle;
  intake: IntakeStyle;
}

export const DEFAULT_COSMETICS: CarCosmetics = {
  paintType: 'gloss',
  paintColor: '',
  wheels: 'stock',
  spoiler: 'none',
  intake: 'none',
};
export type ClanRole = 'leader' | 'officer' | 'racer' | 'recruit';
export type ClanPrivacy = 'open' | 'invite_only' | 'closed';
export type RaceType = 'pvp' | 'campaign' | 'friendly' | 'bet';
export type RaceDistance = 'eighth' | 'quarter' | 'half';
export type ShiftQuality = 'perfect' | 'good' | 'miss';
export type NosDuration = 'short' | 'medium' | 'long';
export type GraphicsQuality = 'low' | 'medium' | 'high';
export type TournamentStatus = 'upcoming' | 'active' | 'completed';
export type WarStatus = 'pending' | 'active' | 'completed';
export type Currency = 'coins' | 'stars';
export type NotificationType = 'clan_war' | 'daily_reward' | 'tournament' | 'challenge' | 'upgrade' | 'nft_drop' | 'clan_invite';

export interface CarStats {
  speed: number;
  acceleration: number;
  handling: number;
  nosPower: number;
  weight: number;
}

export interface Car {
  id: number;
  name: string;
  class: CarClass;
  drivetrain: Drivetrain;
  isStarter: boolean;
  priceCoins: number | null;
  unlockCondition: string | null;
  baseStats: CarStats;
  maxGears: number;
  basePP: number;
  image: string;
}

export interface UserSettings {
  language: string;
  soundEffects: boolean;
  music: boolean;
  musicVolume: number;
  vibration: boolean;
  graphicsQuality: GraphicsQuality;
  notifications: boolean;
  showFps: boolean;
}

export interface UserStats {
  totalRaces: number;
  pvpWins: number;
  pvpLosses: number;
  bestTime: number;
  perfectShifts: number;
  longestWinStreak: number;
  coinsEarned: number;
}

export interface User {
  id: number;
  telegramId: number;
  username: string;
  firstName: string;
  avatarUrl: string;
  level: number;
  xp: number;
  xpToNext: number;
  coins: number;
  energy: number;
  maxEnergy: number;
  lastEnergyRegen: string;
  rankPoints: number;
  rankTier: number;
  selectedCarId: number | null;
  ownedCars: number[];
  clanId: number | null;
  dailyStreak: number;
  lastDailyReward: string | null;
  stats: UserStats;
  settings: UserSettings;
  createdAt: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  lastLoginAt?: string;
}

export interface Tuning {
  userId: number;
  carId: number;
  finalDrive: number;
  tirePressure: number;
  nosDuration: NosDuration;
  suspensionStiffness: number;
  turboBoost: number;
}

export interface UserUpgrade {
  userId: number;
  carId: number;
  category: string;
  stage: number;
}

export interface UpgradeCategory {
  id: string;
  name: string;
  icon: string;
  maxStage: number;
  currency: Currency;
  baseCost: number;
  costMultiplier: number;
  statsBoost: Partial<CarStats>;
}

export interface UserCar {
  userId: number;
  carId: number;
  car: Car;
  upgrades: UserUpgrade[];
  tuning: Tuning | null;
  cosmetics: CarCosmetics;
  currentPP: number;
  currentStats: CarStats;
}

export interface CampaignNode {
  id: number;
  type: 'race' | 'boss';
  bossName?: string;
  bossDialogue?: string;
  opponentCar: {
    name: string;
    class: CarClass;
    pp: number;
    image: string;
  };
  recommendedPP: number;
  energyCost: number;
  rewards: { coins: number; xp: number; special?: string };
  starThresholds: number[];
}

export interface CampaignChapter {
  id: number;
  name: string;
  city: string;
  unlockCondition?: string;
  nodes: CampaignNode[];
}

export interface CampaignProgress {
  userId: number;
  chapterId: number;
  nodeId: number;
  stars: number;
  completed: boolean;
}

export interface Clan {
  id: number;
  name: string;
  tag: string;
  icon: string;
  privacy: ClanPrivacy;
  level: number;
  xp: number;
  xpToNext: number;
  treasury: number;
  leaderId: number;
  createdAt: string;
}

export interface ClanMember {
  clanId: number;
  userId: number;
  role: ClanRole;
  contribution: number;
  joinedAt: string;
}

export interface ClanWar {
  id: number;
  clanA: number;
  clanB: number;
  scoreA: number;
  scoreB: number;
  status: WarStatus;
  startedAt: string;
  endedAt: string;
  winner: number | null;
}

export interface ClanMessage {
  clanId: number;
  userId: number;
  text: string;
  timestamp: string;
}

export interface Tournament {
  id: number;
  name: string;
  type: 'bracket' | 'time_attack';
  bracketSize: number | null;
  entryFee: { currency: Currency; amount: number };
  prizePool: { place: number; coins: number }[];
  classRestriction: CarClass | null;
  status: TournamentStatus;
  startsAt: string;
  endsAt: string;
  participants: number[];
  banner: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  condition: { type: string; value: number };
  rewardXp: number;
  rewardCoins: number;
}

export interface RaceResult {
  id: number;
  type: RaceType;
  player1: { userId: number; carId: number; time: number; shifts: ShiftQuality[] };
  player2: { userId: number | null; carId: number | null; time: number; shifts: ShiftQuality[] };
  winnerId: number;
  distance: RaceDistance;
  rewards: Record<string, { coins: number; xp: number }>;
  createdAt: string;
}

export interface ShopCrate {
  id: string;
  name: string;
  description: string;
  price: { currency: Currency; amount: number };
  contents: Record<string, number>;
  image: string;
}

export interface Cosmetic {
  id: string;
  type: 'paint' | 'vinyl' | 'wheels' | 'underglow' | 'exhaust';
  name: string;
  price: { currency: Currency; amount: number };
  value?: string;
  image?: string;
}

export interface CoinPackage {
  id: string;
  name: string;
  priceStars: number;
  coins: number;
}

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionType: string;
  actionTarget: string;
  createdAt: string;
}

export interface RankTier {
  tier: number;
  name: string;
  minPoints: number;
  maxPoints: number;
}

export const RANK_TIERS: RankTier[] = [
  { tier: 1, name: 'Уличный новичок', minPoints: 0, maxPoints: 200 },
  { tier: 2, name: 'Подпольный гонщик', minPoints: 201, maxPoints: 400 },
  { tier: 3, name: 'Про дрифтер', minPoints: 401, maxPoints: 600 },
  { tier: 4, name: 'Элитный райдер', minPoints: 601, maxPoints: 800 },
  { tier: 5, name: 'Драг-Кинг', minPoints: 801, maxPoints: 1000 },
  { tier: 6, name: 'Легенда', minPoints: 1001, maxPoints: 99999 },
];

export const DAILY_REWARDS = [
  { day: 1, silver: 100, gold: 0, special: null },
  { day: 2, silver: 150, gold: 0, special: null },
  { day: 3, silver: 200, gold: 5, special: null },
  { day: 4, silver: 300, gold: 0, special: null },
  { day: 5, silver: 400, gold: 10, special: null },
  { day: 6, silver: 500, gold: 0, special: null },
  { day: 7, silver: 1000, gold: 25, special: 'rare_crate' },
];
