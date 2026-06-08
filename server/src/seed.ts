import { connectDB, db, carsCol, upgradesCol, cosmeticsCol, coinPackagesCol, shopCratesCol, achievementsCol, campaignChaptersCol, client } from './core/database';
import { Car, UpgradeCategory, Cosmetic, CoinPackage, ShopCrate, Achievement, CampaignChapter } from '@drag-racing/shared/types';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('[Seed] Connecting to MongoDB...');
  await connectDB();
  
  console.log('[Seed] Clearing existing initial collections...');
  await carsCol.deleteMany({});
  await upgradesCol.deleteMany({});
  await cosmeticsCol.deleteMany({});
  await coinPackagesCol.deleteMany({});
  await shopCratesCol.deleteMany({});
  await achievementsCol.deleteMany({});
  await campaignChaptersCol.deleteMany({});

  console.log('[Seed] Inserting Cars...');
  const cars: Car[] = [
    { id: 1, name: 'Lada VAZ 2107', class: 'D', drivetrain: 'rwd', isStarter: true, baseStats: { speed: 100, acceleration: 12, handling: 40, weight: 1000, nosPower: 0 }, priceCoins: 1000, unlockCondition: null, maxGears: 4, basePP: 150, image: '/assets/cars/vaz.png' },
    { id: 2, name: 'Toyota Supra', class: 'A', drivetrain: 'rwd', isStarter: false, baseStats: { speed: 250, acceleration: 8, handling: 70, weight: 1500, nosPower: 50 }, priceCoins: 15000, unlockCondition: null, maxGears: 6, basePP: 450, image: '/assets/cars/supra.png' },
    { id: 3, name: 'Nissan GTR', class: 'S', drivetrain: 'awd', isStarter: false, baseStats: { speed: 320, acceleration: 3, handling: 90, weight: 1700, nosPower: 100 }, priceCoins: null, unlockCondition: null, maxGears: 6, basePP: 600, image: '/assets/cars/gtr.png' },
  ];
  await carsCol.insertMany(cars);

  console.log('[Seed] Inserting Upgrades...');
  const upgrades: UpgradeCategory[] = [
    { id: 'engine', name: 'Engine', icon: 'engine', currency: 'coins', maxStage: 5, baseCost: 500, costMultiplier: 1.5, statsBoost: { speed: 5, acceleration: -0.5 } },
    { id: 'turbo', name: 'Turbo', icon: 'turbo', currency: 'coins', maxStage: 5, baseCost: 1000, costMultiplier: 1.6, statsBoost: { speed: 10, acceleration: -1 } },
    { id: 'weight', name: 'Weight Reduction', icon: 'weight', currency: 'coins', maxStage: 3, baseCost: 800, costMultiplier: 1.8, statsBoost: { weight: -50, handling: 2 } },
  ];
  await upgradesCol.insertMany(upgrades);

  console.log('[Seed] Inserting Cosmetics...');
  const cosmetics: Cosmetic[] = [
    { id: 'paint_red', name: 'Red Paint', type: 'paint', value: '#FF0000', price: { amount: 100, currency: 'coins' } },
    { id: 'wheels_bbs', name: 'BBS Wheels', type: 'wheels', image: '/assets/wheels_bbs.png', price: { amount: 500, currency: 'coins' } },
  ];
  await cosmeticsCol.insertMany(cosmetics);

  console.log('[Seed] Inserting Coin Packages...');
  const coinPackages: CoinPackage[] = [
    { id: 'coins_1000', name: 'Starter Pack', coins: 1000, priceStars: 100 },
    { id: 'coins_5000', name: 'Racer Pack', coins: 5000, priceStars: 400 },
  ];
  await coinPackagesCol.insertMany(coinPackages);

  console.log('[Seed] Inserting Shop Crates...');
  const crates: ShopCrate[] = [
    { id: 'crate_basic', name: 'Basic Crate', description: 'Common parts', price: { amount: 500, currency: 'coins' }, contents: { common: 3 }, image: '/assets/crates/basic.png' },
    { id: 'crate_premium', name: 'Premium Crate', description: 'Rare parts', price: { amount: 2000, currency: 'coins' }, contents: { common: 1, rare: 2, epicChance: 0.1 }, image: '/assets/crates/premium.png' },
  ];
  await shopCratesCol.insertMany(crates);

  console.log('[Seed] Inserting Achievements...');
  const achievements: Achievement[] = [
    { id: 1, name: 'First Win', description: 'Win your first PvP race.', icon: 'trophy', rewardXp: 50, rewardCoins: 500, condition: { type: 'pvp_wins', value: 1 } },
    { id: 2, name: 'Racer', description: 'Complete 10 races.', icon: 'flag', rewardXp: 100, rewardCoins: 1000, condition: { type: 'total_races', value: 10 } },
  ];
  await achievementsCol.insertMany(achievements);

  console.log('[Seed] Inserting Campaign Chapters...');
  const chapters: CampaignChapter[] = [
    { id: 1, name: 'The Beginning', city: 'Moscow', unlockCondition: '', nodes: [
      { id: 1, type: 'race', opponentCar: { name: 'Vaz 2101', class: 'D', pp: 100, image: '/assets/cars/vaz.png' }, recommendedPP: 120, energyCost: 2, rewards: { coins: 100, xp: 10 }, starThresholds: [22, 20, 18] },
      { id: 2, type: 'boss', bossName: 'Sergey', bossDialogue: 'Show me what you got!', opponentCar: { name: 'Priora', class: 'D', pp: 160, image: '/assets/cars/priora.png' }, recommendedPP: 150, energyCost: 3, rewards: { coins: 300, xp: 50 }, starThresholds: [18, 16, 14] },
    ] },
  ];
  await campaignChaptersCol.insertMany(chapters);

  console.log('[Seed] Seeding completed!');
  await client.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('[Seed] Error during seeding:', err);
  process.exit(1);
});
