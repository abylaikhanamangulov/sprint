import { carsCol, upgradesCol, userUpgradesCol, userTuningCol, userCosmeticsCol, usersCol } from '../../core/database';
import { CarStats, UserUpgrade, UpgradeCategory, Tuning, CarCosmetics, DEFAULT_COSMETICS } from '@drag-racing/shared/types';

export interface UserCosmetics extends CarCosmetics {
  userId: number;
  carId: number;
}

export class GarageService {
  public calculatePP(baseStats: CarStats, upgrades: UserUpgrade[], categories: UpgradeCategory[]): { pp: number; stats: CarStats } {
    const stats = { ...baseStats };
    for (const upg of upgrades) {
      const cat = categories.find(c => c.id === upg.category);
      if (!cat) continue;
      
      for (const [stat, boost] of Object.entries(cat.statsBoost)) {
        const key = stat as keyof CarStats;
        stats[key] = (stats[key] || 0) + ((boost as number) * upg.stage);
      }
    }
    
    const pp = Math.round(
      (stats.speed * 0.3 + stats.acceleration * 0.3 + stats.handling * 0.15 + stats.nosPower * 0.15) -
      (stats.weight * 0.02)
    );
    return { pp, stats };
  }

  async getMyCars(userId: number) {
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');

    const userUpgrades = await userUpgradesCol.find({ userId }).toArray();
    const userTuning = await userTuningCol.find({ userId }).toArray();
    const userCosmetics = await userCosmeticsCol.find({ userId }).toArray();
    const categories = await upgradesCol.find().toArray();

    const ownedCarIds = [
      ...new Set<number>([
        ...(user.ownedCars || []),
        ...(user.selectedCarId ? [user.selectedCarId] : []),
        ...userUpgrades.map(u => u.carId),
      ]),
    ];

    const result = [];
    for (const carId of ownedCarIds) {
      const car = await carsCol.findOne({ id: carId });
      if (!car) continue;

      const carUpgrades = userUpgrades.filter(u => u.carId === carId);
      const { pp, stats } = this.calculatePP(car.baseStats, carUpgrades, categories);
      const tuning = userTuning.find(t => t.carId === carId) || null;
      const cosmetics = userCosmetics.find((c: any) => c.carId === carId) || DEFAULT_COSMETICS;

      result.push({
        carId,
        car,
        upgrades: carUpgrades,
        tuning,
        cosmetics,
        currentPP: pp,
        currentStats: stats,
        isSelected: carId === user.selectedCarId,
      });
    }

    return result;
  }

  async selectCar(userId: number, carId: number) {
    await usersCol.updateOne({ id: userId }, { $set: { selectedCarId: carId } });
    return { success: true, selectedCarId: carId };
  }

  async getUpgrades(userId: number, carId: number) {
    const userUpgrades = await userUpgradesCol.find({ userId, carId }).toArray();
    const categories = await upgradesCol.find().toArray();

    return categories.map(cat => {
      const current = userUpgrades.find(u => u.category === cat.id);
      const currentStage = current ? current.stage : 0;
      const nextCost = currentStage < cat.maxStage
        ? Math.round(cat.baseCost * Math.pow(cat.costMultiplier, currentStage))
        : null;

      return {
        ...cat,
        currentStage,
        nextCost,
        canUpgrade: currentStage < cat.maxStage,
      };
    });
  }

  async buyUpgrade(userId: number, carId: number, categoryId: string) {
    const category = await upgradesCol.findOne({ id: categoryId });
    if (!category) throw new Error('CATEGORY_NOT_FOUND');

    const existing = await userUpgradesCol.findOne({ userId, carId, category: categoryId });
    const currentStage = existing ? existing.stage : 0;

    if (currentStage >= category.maxStage) throw new Error('MAX_STAGE_REACHED');

    const cost = Math.round(category.baseCost * Math.pow(category.costMultiplier, currentStage));

    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');

    if (user.coins < cost) throw new Error('NOT_ENOUGH_FUNDS');

    await usersCol.updateOne({ id: userId }, { $inc: { coins: -cost } });

    if (existing) {
      await userUpgradesCol.updateOne({ userId, carId, category: categoryId }, { $set: { stage: currentStage + 1 } });
    } else {
      await userUpgradesCol.insertOne({ userId, carId, category: categoryId, stage: 1 });
    }

    return { success: true, newStage: currentStage + 1, cost };
  }

  async getTuning(userId: number, carId: number) {
    const tuning = await userTuningCol.findOne({ userId, carId });
    
    return tuning || {
      userId,
      carId,
      finalDrive: 3.5,
      tirePressure: 32,
      nosDuration: 'medium',
      suspensionStiffness: 50,
      turboBoost: 50,
    };
  }

  async saveTuning(userId: number, carId: number, tuningData: Omit<Tuning, 'userId' | 'carId'>) {
    const tuning: Tuning = { userId, carId, ...tuningData };
    const existing = await userTuningCol.findOne({ userId, carId });

    if (existing) {
      await userTuningCol.updateOne({ userId, carId }, { $set: tuningData });
    } else {
      await userTuningCol.insertOne(tuning);
    }
    return { success: true };
  }

  async getCosmetics(userId: number, carId: number) {
    const cosmetics = await userCosmeticsCol.findOne({ userId, carId });
    return cosmetics || { userId, carId, ...DEFAULT_COSMETICS };
  }

  async saveCosmetics(userId: number, carId: number, cosmeticsData: Omit<CarCosmetics, 'userId' | 'carId'>) {
    const cosmetics: UserCosmetics = { userId, carId, ...cosmeticsData };
    const existing = await userCosmeticsCol.findOne({ userId, carId });

    if (existing) {
      await userCosmeticsCol.updateOne({ userId, carId }, { $set: cosmeticsData });
    } else {
      await userCosmeticsCol.insertOne(cosmetics);
    }
    return { success: true };
  }
}

export const garageService = new GarageService();
