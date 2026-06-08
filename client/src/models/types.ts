// Re-export all shared domain types so the client imports from a single place.
export * from '@shared/types';

import type {
  CarClass,
  Drivetrain,
  User,
  Car,
  UserCar,
  CarStats,
  UpgradeCategory,
  ShiftQuality,
  RaceResult,
  Achievement,
  ShopCrate,
  Cosmetic,
  CoinPackage,
  Tuning,
  Clan,
  ClanWar,
  ClanMessage,
  Tournament,
  CampaignChapter,
  CampaignNode,
} from '@shared/types';

// ── Auth ─────────────────────────────────────────────────────────────────────
export interface TelegramLoginData {
  telegramId: number;
  username: string;
  firstName: string;
  avatarUrl: string;
}

export interface LoginResponse {
  user: User;
  isNew: boolean;
}

export interface DailyReward {
  day: number;
  coins: number;
  special?: string | null;
}

export interface DailyRewardResponse {
  streak: number;
  reward: DailyReward;
}

// ── Garage ───────────────────────────────────────────────────────────────────
// /garage/my-cars returns UserCar augmented with isSelected.
export interface MyCar extends UserCar {
  isSelected: boolean;
}

export interface UpgradeCategoryView extends UpgradeCategory {
  currentStage: number;
  nextCost: number | null;
  canUpgrade: boolean;
}

export interface UpgradeResult {
  success: boolean;
  newStage: number;
  cost: number;
}

// ── Races ────────────────────────────────────────────────────────────────────
export interface PveRaceRequest {
  chapterId: number;
  nodeId: number;
  playerTime: number;
  playerShifts: ShiftQuality[];
  usedNos: boolean;
  distanceMeters: number;
  opponentTime: number; // visible rival's time — the actual opponent to beat
}

export interface CampaignReward {
  coins: number;
  xp: number;
  special?: string;
}

export interface PveRaceResponse {
  result: RaceResult;
  playerWon: boolean;
  stars: number;
  aiTime: number;
  rewards: CampaignReward | null;
}

// ── Campaign ─────────────────────────────────────────────────────────────────
export interface CampaignNodeView extends CampaignNode {
  stars: number;
  completed: boolean;
  isAvailable: boolean;
}

export interface CampaignChapterListItem extends CampaignChapter {
  isUnlocked: boolean;
  completedNodes: number;
  totalNodes: number;
  totalStars: number;
  maxStars: number;
}

export interface CampaignChapterDetail extends CampaignChapter {
  nodes: CampaignNodeView[];
}

// ── Clans ────────────────────────────────────────────────────────────────────
export interface ClanListItem extends Clan {
  memberCount: number;
}

export interface ClanMemberView {
  clanId: number;
  userId: number;
  role: string;
  contribution: number;
  joinedAt: string;
  username?: string;
  firstName?: string;
  level?: number;
}

export interface ClanDetail extends Clan {
  members: ClanMemberView[];
  wars: ClanWar[];
  messages: ClanMessage[];
}

export interface CreateClanForm {
  name: string;
  tag: string;
  privacy: string;
  icon?: string;
}

// ── Shop ─────────────────────────────────────────────────────────────────────
export interface DailyDeal {
  car: Car;
  discount: number;
  expiresAt: string;
  discountedPrice: number | null;
}

export interface ShopData {
  dailyDeal: DailyDeal | null;
  crates: ShopCrate[];
  cosmetics: Cosmetic[];
  coinPackages: CoinPackage[];
}

export interface CrateResult {
  success: boolean;
  drops: string[];
}

// ── Profile ──────────────────────────────────────────────────────────────────
export interface AchievementView extends Achievement {
  unlocked: boolean;
}

export interface ProfileClan {
  id: number;
  name: string;
  tag: string;
  role: string | null;
}

export interface ProfileData {
  user: User;
  clan: ProfileClan | null;
  achievements: AchievementView[];
  recentRaces: RaceResult[];
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  firstName: string;
  level: number;
  rankPoints: number;
  rankTier: number;
  winRate: number;
  bestTime: number;
}

// ── Clan war (ghost racing) ──────────────────────────────────────────────────
export interface WarGhost {
  userId: number;
  name: string;
  carId: number;
  carName: string;
  carClass: CarClass;
  drivetrain: Drivetrain;
  time: number; // ghost's quarter-mile time (seconds)
}

export interface ClanWarState {
  warId: number;
  clanId: number;
  enemyClanId: number;
  scoreOurs: number;
  scoreTheirs: number;
  ghost: WarGhost | null; // your next opponent ghost
}

export interface WarRaceResult {
  won: boolean;
  playerTime: number;
  ghostTime: number;
  scoreOurs: number;
  scoreTheirs: number;
}

export interface PendingWar {
  clanId: number;
  warId: number;
  ghost: WarGhost;
}

// ── Notifications ────────────────────────────────────────────────────────────
export interface UnreadCountResponse {
  count: number;
}

// ── Misc ─────────────────────────────────────────────────────────────────────
export interface SuccessResponse {
  success: boolean;
}

// Convenience re-exports of types referenced widely in the client.
export type { CarStats, Tuning };
