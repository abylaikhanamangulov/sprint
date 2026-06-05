import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data');

function loadJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function saveJson<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

class DataStore {
  private cache: Map<string, { data: any; mtime: number }> = new Map();

  get<T>(filename: string): T {
    const filePath = path.join(DATA_DIR, filename);
    const stat = fs.statSync(filePath);
    const cached = this.cache.get(filename);

    if (cached && cached.mtime === stat.mtimeMs) {
      return cached.data as T;
    }

    const data = loadJson<T>(filename);
    this.cache.set(filename, { data, mtime: stat.mtimeMs });
    return data;
  }

  set<T>(filename: string, data: T): void {
    saveJson(filename, data);
    this.cache.delete(filename);
  }

  update<T>(filename: string, updater: (data: T) => T): T {
    const current = this.get<T>(filename);
    const updated = updater(current);
    this.set(filename, updated);
    return updated;
  }

  invalidate(filename: string): void {
    this.cache.delete(filename);
  }
}

export const dataStore = new DataStore();

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
} as const;
