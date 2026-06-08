import fs from 'fs';
import path from 'path';
import { 
  User, Car, Clan, ClanMember, ClanWar, ClanMessage, 
  Tournament, CampaignChapter, CampaignProgress, 
  RaceResult, Notification, Achievement, ShopCrate, 
  Cosmetic, CoinPackage, UpgradeCategory, 
  UserUpgrade, Tuning 
} from '@drag-racing/shared/types';

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data');

export interface DatabaseSchema {
  'users.json': User[];
  'cars.json': Car[];
  'upgrades.json': {
    categories: UpgradeCategory[];
    userUpgrades: UserUpgrade[];
    userTuning: Tuning[];
    userCosmetics: any[]; 
  };
  'campaign.json': {
    chapters: CampaignChapter[];
    userProgress: CampaignProgress[];
  };
  'clans.json': {
    clans: Clan[];
    members: ClanMember[];
    wars: ClanWar[];
    messages: ClanMessage[];
  };
  'tournaments.json': Tournament[];
  'shop.json': {
    dailyDeal: { carId: number; discount: number; expiresAt: string };
    crates: ShopCrate[];
    cosmetics: Cosmetic[];

    coinPackages: CoinPackage[];
  };
  'achievements.json': Achievement[];
  'races.json': RaceResult[];
  'notifications.json': Notification[];
}

export const FILES = {
  USERS: 'users.json',
  CARS: 'cars.json',
  UPGRADES: 'upgrades.json',
  CAMPAIGN: 'campaign.json',
  CLANS: 'clans.json',
  TOURNAMENTS: 'tournaments.json',
  SHOP: 'shop.json',
  ACHIEVEMENTS: 'achievements.json',
  RACES: 'races.json',
  NOTIFICATIONS: 'notifications.json',
} as const satisfies Record<string, keyof DatabaseSchema>;

class DataStore {
  private cache: Map<string, { data: unknown; mtime: number }> = new Map();

  get<K extends keyof DatabaseSchema>(filename: K): DatabaseSchema[K] {
    const filePath = path.join(DATA_DIR, filename);
    const stat = fs.statSync(filePath);
    const cached = this.cache.get(filename);

    if (cached && cached.mtime === stat.mtimeMs) {
      return cached.data as DatabaseSchema[K];
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw) as DatabaseSchema[K];
    this.cache.set(filename, { data, mtime: stat.mtimeMs });
    
    return data;
  }

  set<K extends keyof DatabaseSchema>(filename: K, data: DatabaseSchema[K]): void {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    this.cache.delete(filename);
  }

  update<K extends keyof DatabaseSchema>(
    filename: K, 
    updater: (data: DatabaseSchema[K]) => DatabaseSchema[K]
  ): DatabaseSchema[K] {
    const current = this.get(filename);
    const updated = updater(current);
    this.set(filename, updated);
    return updated;
  }

  invalidate(filename: string): void {
    this.cache.delete(filename);
  }
}

export const dataStore = new DataStore();
