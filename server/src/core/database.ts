import { MongoClient, Db, Collection } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import {
  User,
  Car,
  Clan,
  ClanMember,
  ClanWar,
  ClanMessage,
  Tournament,
  CampaignChapter,
  CampaignProgress,
  RaceResult,
  Notification,
  Achievement,
  ShopCrate,
  Cosmetic,
  CoinPackage,
  UpgradeCategory,
  UserUpgrade,
  Tuning,
  CarCosmetics,
} from '@drag-racing/shared/types';
import { logger } from './logger';

dotenv.config();

export let client: MongoClient;
export let mongoMemoryServer: MongoMemoryServer | null = null;

export let db: Db;
export let usersCol: Collection<User>;
export let carsCol: Collection<Car>;
export let clansCol: Collection<Clan>;
export let clanMembersCol: Collection<ClanMember>;
export let clanWarsCol: Collection<ClanWar>;
export let clanMessagesCol: Collection<ClanMessage>;
export let tournamentsCol: Collection<Tournament>;
export let racesCol: Collection<RaceResult>;
export let achievementsCol: Collection<Achievement>;
export let shopCratesCol: Collection<ShopCrate>;
export let cosmeticsCol: Collection<Cosmetic>;
export let coinPackagesCol: Collection<CoinPackage>;
export let upgradesCol: Collection<UpgradeCategory>;
export let userUpgradesCol: Collection<UserUpgrade>;
export let userTuningCol: Collection<Tuning>;
export let userCosmeticsCol: Collection<CarCosmetics>;
export interface SystemSettings {
  id: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}

export let campaignChaptersCol: Collection<CampaignChapter>;
export let campaignProgressCol: Collection<CampaignProgress>;
export let notificationsCol: Collection<Notification>;
export let systemSettingsCol: Collection<SystemSettings>;

export async function connectDB() {
  let uri = process.env.MONGO_URI;

  if (!uri || uri.includes('localhost')) {
    logger.info('[Server] No remote MONGO_URI provided. Starting in-memory MongoDB...');
    mongoMemoryServer = await MongoMemoryServer.create();
    uri = mongoMemoryServer.getUri();
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db();

  usersCol = db.collection<User>('users');
  carsCol = db.collection<Car>('cars');
  clansCol = db.collection<Clan>('clans');
  clanMembersCol = db.collection<ClanMember>('clanMembers');
  clanWarsCol = db.collection<ClanWar>('clanWars');
  clanMessagesCol = db.collection<ClanMessage>('clanMessages');
  tournamentsCol = db.collection<Tournament>('tournaments');
  racesCol = db.collection<RaceResult>('races');
  achievementsCol = db.collection<Achievement>('achievements');
  shopCratesCol = db.collection<ShopCrate>('shopCrates');
  cosmeticsCol = db.collection<Cosmetic>('cosmetics');
  coinPackagesCol = db.collection<CoinPackage>('coinPackages');
  upgradesCol = db.collection<UpgradeCategory>('upgrades');
  userUpgradesCol = db.collection<UserUpgrade>('userUpgrades');
  userTuningCol = db.collection<Tuning>('userTuning');
  userCosmeticsCol = db.collection<CarCosmetics>('userCosmetics');
  campaignChaptersCol = db.collection<CampaignChapter>('campaignChapters');
  campaignProgressCol = db.collection<CampaignProgress>('campaignProgress');
  notificationsCol = db.collection<Notification>('notifications');
  systemSettingsCol = db.collection<SystemSettings>('systemSettings');

  // Initialize system settings if they don't exist
  const existingSettings = await systemSettingsCol.findOne({ id: 'global' });
  if (!existingSettings) {
    await systemSettingsCol.insertOne({ id: 'global', maintenanceMode: false });
  }

  // Create indexes for performance
  await usersCol.createIndex({ id: 1 }, { unique: true });
  await usersCol.createIndex({ telegramId: 1 }, { unique: true });
  await usersCol.createIndex({ username: 1 });
  await carsCol.createIndex({ id: 1 }, { unique: true });
  await clansCol.createIndex({ id: 1 }, { unique: true });
  await clansCol.createIndex({ name: 1 });
  await clanMembersCol.createIndex({ clanId: 1, userId: 1 }, { unique: true });

  logger.info('[Server] Connected to MongoDB');
}
