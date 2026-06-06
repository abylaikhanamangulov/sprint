import { dataStore, FILES } from '../../core/database';
import { CarStats, UserUpgrade, UpgradeCategory, Tuning, CarCosmetics, DEFAULT_COSMETICS } from '@drag-racing/shared/types';

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

  getMyCars(userId: number) {
    const cars = dataStore.get(FILES.CARS);
    const upgradesData = dataStore.get(FILES.UPGRADES);
    const users = dataStore.get(FILES.USERS);
    
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    const userUpgrades = upgradesData.userUpgrades.filter(u => u.userId === userId);
    const userTuning = upgradesData.userTuning.filter(t => t.userId === userId);
    const userCosmetics = (upgradesData.userCosmetics || []).filter(c => c.userId === userId);

    const ownedCarIds = [
      ...new Set<number>([
        ...(user.ownedCars || []),
        ...(user.selectedCarId ? [user.selectedCarId] : []),
        ...userUpgrades.map(u => u.carId),
      ]),
    ];

    return ownedCarIds.map(carId => {
      const car = cars.find(c => c.id === carId);
      if (!car) return null;

      const carUpgrades = userUpgrades.filter(u => u.carId === carId);
      const { pp, stats } = this.calculatePP(car.baseStats, carUpgrades, upgradesData.categories);
      const tuning = userTuning.find(t => t.carId === carId) || null;
      const cosmetics = userCosmetics.find(c => c.carId === carId) || DEFAULT_COSMETICS;

      return {
        carId,
        car,
        upgrades: carUpgrades,
        tuning,
        cosmetics,
        currentPP: pp,
        currentStats: stats,
        isSelected: carId === user.selectedCarId,
      };
    }).filter(Boolean);
  }

  selectCar(userId: number, carId: number) {
    dataStore.update(FILES.USERS, users =>
      users.map(u => u.id === userId ? { ...u, selectedCarId: carId } : u)
    );
    return { success: true, selectedCarId: carId };
  }

  getUpgrades(userId: number, carId: number) {
    const upgradesData = dataStore.get(FILES.UPGRADES);
    const userUpgrades = upgradesData.userUpgrades.filter(
      u => u.userId === userId && u.carId === carId
    );

    return upgradesData.categories.map(cat => {
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

  buyUpgrade(userId: number, carId: number, categoryId: string) {
    const upgradesData = dataStore.get(FILES.UPGRADES);
    const category = upgradesData.categories.find(c => c.id === categoryId);
    if (!category) throw new Error('CATEGORY_NOT_FOUND');

    const existing = upgradesData.userUpgrades.find(
      u => u.userId === userId && u.carId === carId && u.category === categoryId
    );
    const currentStage = existing ? existing.stage : 0;

    if (currentStage >= category.maxStage) throw new Error('MAX_STAGE_REACHED');

    const cost = Math.round(category.baseCost * Math.pow(category.costMultiplier, currentStage));
    const currencyField = category.currency === 'gold' ? 'gold' : 'silver';

    const users = dataStore.get(FILES.USERS);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    if (user[currencyField] < cost) throw new Error('NOT_ENOUGH_FUNDS');

    dataStore.update(FILES.USERS, currentUsers =>
      currentUsers.map(u => u.id === userId ? { ...u, [currencyField]: u[currencyField] - cost } : u)
    );

    dataStore.update(FILES.UPGRADES, data => {
      const idx = data.userUpgrades.findIndex(
        u => u.userId === userId && u.carId === carId && u.category === categoryId
      );
      if (idx >= 0) {
        data.userUpgrades[idx].stage = currentStage + 1;
      } else {
        data.userUpgrades.push({ userId, carId, category: categoryId, stage: 1 });
      }
      return data;
    });

    return { success: true, newStage: currentStage + 1, cost };
  }

  getTuning(userId: number, carId: number) {
    const upgradesData = dataStore.get(FILES.UPGRADES);
    const tuning = upgradesData.userTuning.find(t => t.userId === userId && t.carId === carId);
    
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

  saveTuning(userId: number, carId: number, tuningData: Omit<Tuning, 'userId' | 'carId'>) {
    dataStore.update(FILES.UPGRADES, data => {
      const idx = data.userTuning.findIndex(t => t.userId === userId && t.carId === carId);
      const tuning: Tuning = { userId, carId, ...tuningData };
      if (idx >= 0) {
        data.userTuning[idx] = tuning;
      } else {
        data.userTuning.push(tuning);
      }
      return data;
    });
    return { success: true };
  }

  getCosmetics(userId: number, carId: number) {
    const upgradesData = dataStore.get(FILES.UPGRADES);
    const cosmetics = (upgradesData.userCosmetics || []).find(c => c.userId === userId && c.carId === carId);
    return cosmetics || { userId, carId, ...DEFAULT_COSMETICS };
  }

  saveCosmetics(userId: number, carId: number, cosmeticsData: Omit<CarCosmetics, 'userId' | 'carId'>) {
    dataStore.update(FILES.UPGRADES, data => {
      if (!data.userCosmetics) data.userCosmetics = [];
      const idx = data.userCosmetics.findIndex(c => c.userId === userId && c.carId === carId);
      const cosmetics: any = { userId, carId, ...cosmeticsData };
      if (idx >= 0) {
        data.userCosmetics[idx] = cosmetics;
      } else {
        data.userCosmetics.push(cosmetics);
      }
      return data;
    });
    return { success: true };
  }
}

export const garageService = new GarageService();
