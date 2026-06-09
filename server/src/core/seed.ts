import fs from 'fs';
import path from 'path';
import { logger } from './logger';
import * as db from './database';

const dataDir = path.join(__dirname, '..', '..', '..', 'data');

async function seedCollection(col: any, filename: string, extractArray?: (data: any) => any[]) {
  try {
    if (!col) return;
    const count = await col.countDocuments();
    if (count > 0) return; // Already seeded

    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      logger.warn(`[Seed] File not found: ${filePath}`);
      return;
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);
    
    let itemsToInsert = data;
    if (extractArray) {
      itemsToInsert = extractArray(data);
    }

    if (Array.isArray(itemsToInsert) && itemsToInsert.length > 0) {
      // Remove any existing _id fields to let MongoDB generate them, 
      // but keep our 'id' fields.
      const sanitized = itemsToInsert.map(item => {
        const { _id, ...rest } = item;
        return rest;
      });
      await col.insertMany(sanitized);
      logger.info(`[Seed] Seeded ${sanitized.length} items into ${col.collectionName} from ${filename}`);
    }
  } catch (error: any) {
    logger.error(`[Seed] Error seeding ${filename}: ${error.message || error}`);
  }
}

export async function seedDatabase() {
  logger.info('[Seed] Checking if database needs seeding...');
  
  await seedCollection(db.usersCol, 'users.json');
  await seedCollection(db.carsCol, 'cars.json');
  await seedCollection(db.clansCol, 'clans.json');
  await seedCollection(db.achievementsCol, 'achievements.json');
  await seedCollection(db.upgradesCol, 'upgrades.json');
  await seedCollection(db.tournamentsCol, 'tournaments.json');
  await seedCollection(db.campaignChaptersCol, 'campaign.json');
  await seedCollection(db.racesCol, 'races.json');
  await seedCollection(db.notificationsCol, 'notifications.json');
  
  // Special case for shop.json
  await seedCollection(db.shopCratesCol, 'shop.json', (data) => data.crates);
  await seedCollection(db.cosmeticsCol, 'shop.json', (data) => data.cosmetics);
  await seedCollection(db.coinPackagesCol, 'shop.json', (data) => data.coinPackages);
  
  logger.info('[Seed] Seeding complete.');
}
