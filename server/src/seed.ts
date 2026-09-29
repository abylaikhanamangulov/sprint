import { connectDB, db, carsCol, upgradesCol, cosmeticsCol, coinPackagesCol, shopCratesCol, cardPacksCol, achievementsCol, campaignChaptersCol, client } from './core/database';
import { Car, UpgradeCategory, Cosmetic, CoinPackage, ShopCrate, CardPack, Achievement, CampaignChapter } from '@drag-racing/shared/types';
import dotenv from 'dotenv';

dotenv.config();

export async function runSeed(closeClient = true) {
  console.log('[Seed] Connecting to MongoDB...');
  if (!client) {
     await connectDB();
  }
  
  console.log('[Seed] Clearing existing initial collections...');
  await carsCol.deleteMany({});
  await upgradesCol.deleteMany({});
  await cosmeticsCol.deleteMany({});
  await coinPackagesCol.deleteMany({});
  await shopCratesCol.deleteMany({});
  await cardPacksCol.deleteMany({});
  await achievementsCol.deleteMany({});
  await campaignChaptersCol.deleteMany({});

  console.log('[Seed] Inserting Cars...');
  const cars: Car[] = [
    // --- D Class ---
    { id: 1, name: 'Mazda MX-5 Miata (NA)', class: 'D', drivetrain: 'rwd', isStarter: true, baseStats: { speed: 210, acceleration: 7.5, handling: 75, weight: 940, nosPower: 0 }, priceCoins: 5000, priceStars: null, unlockCondition: null, maxGears: 5, basePP: 120, image: '/assets/cars/miata_na.png' },
    { id: 2, name: 'Volkswagen Golf GTI (Mk1)', class: 'D', drivetrain: 'fwd', isStarter: true, baseStats: { speed: 215, acceleration: 7.0, handling: 70, weight: 810, nosPower: 0 }, priceCoins: 6500, priceStars: null, unlockCondition: null, maxGears: 5, basePP: 135, image: '/assets/cars/golf_mk1.png' },
    { id: 3, name: 'Honda Civic Type R (EK9)', class: 'D', drivetrain: 'fwd', isStarter: true, baseStats: { speed: 225, acceleration: 6.8, handling: 65, weight: 1050, nosPower: 0 }, priceCoins: 8000, priceStars: null, unlockCondition: null, maxGears: 5, basePP: 150, image: '/assets/cars/civic_ek9.png' },
    
    // --- C Class ---
    { id: 4, name: 'Nissan Silvia (S15)', class: 'C', drivetrain: 'rwd', isStarter: false, baseStats: { speed: 245, acceleration: 5.8, handling: 75, weight: 1240, nosPower: 0 }, priceCoins: 25000, priceStars: null, unlockCondition: null, maxGears: 6, basePP: 250, image: '/assets/cars/silvia_s15.png' },
    { id: 5, name: 'Mitsubishi Lancer Evo VIII', class: 'C', drivetrain: 'awd', isStarter: false, baseStats: { speed: 250, acceleration: 4.8, handling: 82, weight: 1410, nosPower: 0 }, priceCoins: 28000, priceStars: null, unlockCondition: null, maxGears: 6, basePP: 275, image: '/assets/cars/evo_viii.png' },
    { id: 6, name: 'Toyota Supra (A80)', class: 'C', drivetrain: 'rwd', isStarter: false, baseStats: { speed: 260, acceleration: 4.6, handling: 72, weight: 1550, nosPower: 0 }, priceCoins: 35000, priceStars: null, unlockCondition: null, maxGears: 6, basePP: 300, image: '/assets/cars/supra_a80.png' },

    // --- B Class ---
    { id: 7, name: 'BMW M3 (E46)', class: 'B', drivetrain: 'rwd', isStarter: false, baseStats: { speed: 275, acceleration: 4.8, handling: 83, weight: 1495, nosPower: 0 }, priceCoins: 50000, priceStars: null, unlockCondition: null, maxGears: 6, basePP: 420, image: '/assets/cars/m3_e46.png' },
    { id: 8, name: 'Nissan Skyline GT-R (R34)', class: 'B', drivetrain: 'awd', isStarter: false, baseStats: { speed: 285, acceleration: 4.0, handling: 85, weight: 1560, nosPower: 0 }, priceCoins: 55000, priceStars: null, unlockCondition: null, maxGears: 6, basePP: 440, image: '/assets/cars/skyline_r34.png' },
    { id: 9, name: 'Ford Mustang GT (S550)', class: 'B', drivetrain: 'rwd', isStarter: false, baseStats: { speed: 295, acceleration: 4.3, handling: 70, weight: 1720, nosPower: 0 }, priceCoins: 65000, priceStars: null, unlockCondition: null, maxGears: 6, basePP: 460, image: '/assets/cars/mustang_s550.png' },

    // --- A Class (Прямая покупка за Серебро или Звезды) ---
    { id: 10, name: 'Porsche 911 GT3 (992)', class: 'A', drivetrain: 'rwd', isStarter: false, baseStats: { speed: 320, acceleration: 3.2, handling: 95, weight: 1435, nosPower: 0 }, priceCoins: 120000, priceStars: 350, unlockCondition: null, maxGears: 7, basePP: 580, image: '/assets/cars/911_gt3.png' },
    { id: 11, name: 'Nissan GT-R Nismo', class: 'A', drivetrain: 'awd', isStarter: false, baseStats: { speed: 330, acceleration: 2.7, handling: 90, weight: 1720, nosPower: 0 }, priceCoins: 150000, priceStars: 400, unlockCondition: null, maxGears: 6, basePP: 600, image: '/assets/cars/gtr_nismo.png' },
    { id: 12, name: 'Audi R8 V10 Plus', class: 'A', drivetrain: 'awd', isStarter: false, baseStats: { speed: 331, acceleration: 3.1, handling: 88, weight: 1695, nosPower: 0 }, priceCoins: 180000, priceStars: 450, unlockCondition: null, maxGears: 7, basePP: 620, image: '/assets/cars/r8_v10.png' },

    // --- S Class (Premium) ---
    { id: 13, name: 'Lamborghini Aventador SVJ', class: 'S', drivetrain: 'awd', isStarter: false, baseStats: { speed: 360, acceleration: 2.7, handling: 92, weight: 1525, nosPower: 0 }, priceCoins: null, priceStars: 750, unlockCondition: 'premium', maxGears: 7, basePP: 750, image: '/assets/cars/aventador_svj.png' },
    { id: 14, name: 'McLaren P1', class: 'S', drivetrain: 'rwd', isStarter: false, baseStats: { speed: 395, acceleration: 2.7, handling: 96, weight: 1490, nosPower: 0 }, priceCoins: null, priceStars: 850, unlockCondition: 'premium', maxGears: 7, basePP: 780, image: '/assets/cars/p1.png' },
    { id: 15, name: 'Ferrari LaFerrari', class: 'S', drivetrain: 'rwd', isStarter: false, baseStats: { speed: 375, acceleration: 2.4, handling: 95, weight: 1585, nosPower: 0 }, priceCoins: null, priceStars: 950, unlockCondition: 'premium', maxGears: 7, basePP: 820, image: '/assets/cars/laferrari.png' },

    // --- X Class (Premium) ---
    { id: 16, name: 'Pagani Huayra BC', class: 'X', drivetrain: 'rwd', isStarter: false, baseStats: { speed: 385, acceleration: 2.5, handling: 98, weight: 1218, nosPower: 0 }, priceCoins: null, priceStars: 1500, unlockCondition: 'premium', maxGears: 7, basePP: 950, image: '/assets/cars/huayra_bc.png' },
    { id: 17, name: 'Bugatti Chiron Super Sport', class: 'X', drivetrain: 'awd', isStarter: false, baseStats: { speed: 490, acceleration: 2.2, handling: 89, weight: 1945, nosPower: 0 }, priceCoins: null, priceStars: 1750, unlockCondition: 'premium', maxGears: 7, basePP: 980, image: '/assets/cars/chiron_pur.png' },
    { id: 18, name: 'Koenigsegg Jesko Absolut', class: 'X', drivetrain: 'rwd', isStarter: false, baseStats: { speed: 531, acceleration: 2.4, handling: 93, weight: 1420, nosPower: 0 }, priceCoins: null, priceStars: 2000, unlockCondition: 'premium', maxGears: 9, basePP: 1000, image: '/assets/cars/jesko.png' },
  ];
  await carsCol.insertMany(cars);

  console.log('[Seed] Inserting Upgrades...');
  const upgrades: UpgradeCategory[] = [
    { id: 'engine', name: 'Engine', icon: 'engine', currency: 'coins', maxStage: 5, baseCost: 500, costMultiplier: 1.5, statsBoost: { speed: 2, acceleration: -0.15 } },
    { id: 'turbo', name: 'Turbo', icon: 'turbo', currency: 'coins', maxStage: 5, baseCost: 1000, costMultiplier: 1.6, statsBoost: { speed: 4, acceleration: -0.3 } },
    { id: 'transmission', name: 'Transmission', icon: 'transmission', currency: 'coins', maxStage: 5, baseCost: 700, costMultiplier: 1.5, statsBoost: { acceleration: -0.1 } },
    { id: 'tires', name: 'Tires', icon: 'tires', currency: 'coins', maxStage: 5, baseCost: 600, costMultiplier: 1.4, statsBoost: { handling: 3, acceleration: -0.1 } },
    { id: 'weight', name: 'Weight Reduction', icon: 'weight', currency: 'coins', maxStage: 5, baseCost: 800, costMultiplier: 1.8, statsBoost: { weight: -20, handling: 1 } },
    { id: 'nos', name: 'Nitrous Oxide', icon: 'nos', currency: 'coins', maxStage: 5, baseCost: 1200, costMultiplier: 1.5, statsBoost: { nosPower: 5 } },
    { id: 'ecu', name: 'ECU Tuning', icon: 'ecu', currency: 'coins', maxStage: 5, baseCost: 1500, costMultiplier: 1.7, statsBoost: { speed: 5, acceleration: -0.25, handling: 2 } },
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
    { id: 'coins_1000', name: 'Starter Pack', coins: 1000, priceStars: 100, discount: 0 },
    { id: 'coins_5000', name: 'Racer Pack', coins: 5000, priceStars: 400, discount: 20 },
  ];
  await coinPackagesCol.insertMany(coinPackages);

  console.log('[Seed] Inserting Shop Crates...');
  const crates: ShopCrate[] = [
    { id: 'crate_basic', name: 'Basic Crate', description: 'Common parts', price: { amount: 500, currency: 'coins' }, contents: { common: 3 }, image: '/assets/crates/basic.png' },
    { id: 'crate_premium', name: 'Premium Crate', description: 'Rare parts', price: { amount: 2000, currency: 'coins' }, contents: { common: 1, rare: 2, epicChance: 0.1 }, image: '/assets/crates/premium.png' },
  ];
  await shopCratesCol.insertMany(crates);

  console.log('[Seed] Inserting Card Packs...');
  const packs: CardPack[] = [
    { id: 'pack_silver', tier: 'silver', name: 'Малый Пак', price: { currency: 'coins', amount: 500 }, slots: 2, slotProbabilities: { partCard: 51, x2Card: 28, points: 14, ecuCard: 4, fragmentClass: { B: 2, A: 1 } as any } },
    { id: 'pack_gold', tier: 'gold', name: 'Средний Пак', price: { currency: 'coins', amount: 1500 }, slots: 8, slotProbabilities: { partCard: 41, x2Card: 29, points: 18, ecuCard: 9, fragmentClass: { A: 2, S: 1 } as any } },
    { id: 'pack_platinum', tier: 'platinum', name: 'Большой Пак', price: { currency: 'coins', amount: 3000 }, slots: 20, slotProbabilities: { partCard: 35, x2Card: 27, points: 21, ecuCard: 14, fragmentClass: { S: 2, X: 1 } as any } },
    { id: 'pack_diamond', tier: 'diamond', name: 'Мега Пак', price: { currency: 'coins', amount: 6000 }, slots: 48, slotProbabilities: { partCard: 28, x2Card: 26, points: 21, ecuCard: 22, fragmentClass: { X: 3 } as any } },
  ];
  await cardPacksCol.insertMany(packs);

  console.log('[Seed] Inserting Achievements...');
  const achievements: Achievement[] = [
    { id: 1, name: 'First Win', description: 'Win your first PvP race.', icon: 'trophy', rewardXp: 50, rewardCoins: 500, condition: { type: 'pvp_wins', value: 1 } },
    { id: 2, name: 'Racer', description: 'Complete 10 races.', icon: 'flag', rewardXp: 100, rewardCoins: 1000, condition: { type: 'total_races', value: 10 } },
  ];
  await achievementsCol.insertMany(achievements);

  console.log('[Seed] Inserting Campaign Chapters...');
  const chapters: CampaignChapter[] = [
    { id: 1, name: 'The Beginning', city: 'Moscow', unlockCondition: '', nodes: [
      { id: 1, type: 'race', opponentCar: { name: 'Vaz 2101', class: 'D', pp: 100, image: '/assets/cars/vaz.png' }, recommendedPP: 120, energyCost: 1, rewards: { coins: 100, xp: 10 }, starThresholds: [22, 20, 18] },
      { id: 2, type: 'boss', bossName: 'Sergey', bossDialogue: 'Show me what you got!', opponentCar: { name: 'Priora', class: 'D', pp: 160, image: '/assets/cars/priora.png' }, recommendedPP: 150, energyCost: 1, rewards: { coins: 300, xp: 50 }, starThresholds: [18, 16, 14] },
    ] },
  ];
  await campaignChaptersCol.insertMany(chapters);

  console.log('[Seed] Seeding completed!');
  if (closeClient && client) {
    await client.close();
  }
}

if (require.main === module) {
  runSeed(true)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    });
}
