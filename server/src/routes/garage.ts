import { Router } from 'express';
import { dataStore, FILES } from '../data';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

const DEFAULT_COSMETICS = {
  paintType: 'gloss',
  paintColor: '',
  wheels: 'stock',
  spoiler: 'none',
  intake: 'none',
};

function calculatePP(baseStats: any, upgrades: any[], categories: any[]): { pp: number; stats: any } {
  const stats = { ...baseStats };
  for (const upg of upgrades) {
    const cat = categories.find((c: any) => c.id === upg.category);
    if (!cat) continue;
    for (const [stat, boost] of Object.entries(cat.statsBoost)) {
      (stats as any)[stat] = ((stats as any)[stat] || 0) + (boost as number) * upg.stage;
    }
  }
  const pp = Math.round(
    (stats.speed * 0.3 + stats.acceleration * 0.3 + stats.handling * 0.15 + stats.nosPower * 0.15) -
    (stats.weight * 0.02)
  );
  return { pp, stats };
}

router.get('/my-cars', authMiddleware, (req: AuthRequest, res) => {
  const cars = dataStore.get<any[]>(FILES.CARS);
  const upgradesData = dataStore.get<any>(FILES.UPGRADES);
  const user = req.user;

  const userUpgrades = upgradesData.userUpgrades.filter((u: any) => u.userId === req.userId);
  const userTuning = upgradesData.userTuning.filter((t: any) => t.userId === req.userId);
  const userCosmetics = (upgradesData.userCosmetics || []).filter((c: any) => c.userId === req.userId);

  // Ownership = explicit owned list ∪ selected car ∪ any car with upgrades.
  const ownedCarIds = [
    ...new Set<number>([
      ...(user.ownedCars || []),
      ...(user.selectedCarId ? [user.selectedCarId] : []),
      ...userUpgrades.map((u: any) => u.carId as number),
    ]),
  ];

  const myCars = ownedCarIds.map(carId => {
    const car = cars.find(c => c.id === carId);
    if (!car) return null;

    const carUpgrades = userUpgrades.filter((u: any) => u.carId === carId);
    const { pp, stats } = calculatePP(car.baseStats, carUpgrades, upgradesData.categories);
    const tuning = userTuning.find((t: any) => t.carId === carId) || null;
    const cosmetics = userCosmetics.find((c: any) => c.carId === carId) || DEFAULT_COSMETICS;

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

  res.json(myCars);
});

router.post('/select/:carId', authMiddleware, (req: AuthRequest, res) => {
  const carId = Number(req.params.carId);
  dataStore.update<any[]>(FILES.USERS, users =>
    users.map(u => u.id === req.userId ? { ...u, selectedCarId: carId } : u)
  );
  res.json({ success: true, selectedCarId: carId });
});

router.get('/upgrades/:carId', authMiddleware, (req: AuthRequest, res) => {
  const carId = Number(req.params.carId);
  const upgradesData = dataStore.get<any>(FILES.UPGRADES);

  const userUpgrades = upgradesData.userUpgrades.filter(
    (u: any) => u.userId === req.userId && u.carId === carId
  );

  const categories = upgradesData.categories.map((cat: any) => {
    const current = userUpgrades.find((u: any) => u.category === cat.id);
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

  res.json(categories);
});

router.post('/upgrade', authMiddleware, (req: AuthRequest, res) => {
  const { carId, categoryId } = req.body;
  const upgradesData = dataStore.get<any>(FILES.UPGRADES);
  const category = upgradesData.categories.find((c: any) => c.id === categoryId);

  if (!category) {
    res.status(404).json({ error: 'Категория не найдена' });
    return;
  }

  const existing = upgradesData.userUpgrades.find(
    (u: any) => u.userId === req.userId && u.carId === carId && u.category === categoryId
  );
  const currentStage = existing ? existing.stage : 0;

  if (currentStage >= category.maxStage) {
    res.status(400).json({ error: 'Максимальный уровень достигнут' });
    return;
  }

  const cost = Math.round(category.baseCost * Math.pow(category.costMultiplier, currentStage));
  const user = req.user;
  const currencyField = category.currency === 'gold' ? 'gold' : 'silver';

  if (user[currencyField] < cost) {
    res.status(400).json({ error: `Недостаточно ${category.currency === 'gold' ? 'золота' : 'серебра'}` });
    return;
  }

  dataStore.update<any[]>(FILES.USERS, users =>
    users.map(u => u.id === req.userId ? { ...u, [currencyField]: u[currencyField] - cost } : u)
  );

  dataStore.update<any>(FILES.UPGRADES, data => {
    const idx = data.userUpgrades.findIndex(
      (u: any) => u.userId === req.userId && u.carId === carId && u.category === categoryId
    );
    if (idx >= 0) {
      data.userUpgrades[idx].stage = currentStage + 1;
    } else {
      data.userUpgrades.push({ userId: req.userId, carId, category: categoryId, stage: 1 });
    }
    return data;
  });

  res.json({ success: true, newStage: currentStage + 1, cost });
});

router.get('/tuning/:carId', authMiddleware, (req: AuthRequest, res) => {
  const carId = Number(req.params.carId);
  const upgradesData = dataStore.get<any>(FILES.UPGRADES);
  const tuning = upgradesData.userTuning.find(
    (t: any) => t.userId === req.userId && t.carId === carId
  );
  res.json(tuning || {
    userId: req.userId,
    carId,
    finalDrive: 3.5,
    tirePressure: 32,
    nosDuration: 'medium',
    suspensionStiffness: 50,
    turboBoost: 50,
  });
});

router.post('/tuning/:carId', authMiddleware, (req: AuthRequest, res) => {
  const carId = Number(req.params.carId);
  const { finalDrive, tirePressure, nosDuration, suspensionStiffness, turboBoost } = req.body;

  dataStore.update<any>(FILES.UPGRADES, data => {
    const idx = data.userTuning.findIndex(
      (t: any) => t.userId === req.userId && t.carId === carId
    );
    const tuning = { userId: req.userId, carId, finalDrive, tirePressure, nosDuration, suspensionStiffness, turboBoost };
    if (idx >= 0) {
      data.userTuning[idx] = tuning;
    } else {
      data.userTuning.push(tuning);
    }
    return data;
  });

  res.json({ success: true });
});

router.get('/cosmetics/:carId', authMiddleware, (req: AuthRequest, res) => {
  const carId = Number(req.params.carId);
  const upgradesData = dataStore.get<any>(FILES.UPGRADES);
  const cosmetics = (upgradesData.userCosmetics || []).find(
    (c: any) => c.userId === req.userId && c.carId === carId
  );
  res.json(cosmetics || { userId: req.userId, carId, ...DEFAULT_COSMETICS });
});

router.post('/cosmetics/:carId', authMiddleware, (req: AuthRequest, res) => {
  const carId = Number(req.params.carId);
  const { paintType, paintColor, wheels, spoiler, intake } = req.body;

  dataStore.update<any>(FILES.UPGRADES, data => {
    if (!data.userCosmetics) data.userCosmetics = [];
    const idx = data.userCosmetics.findIndex(
      (c: any) => c.userId === req.userId && c.carId === carId
    );
    const cosmetics = { userId: req.userId, carId, paintType, paintColor, wheels, spoiler, intake };
    if (idx >= 0) {
      data.userCosmetics[idx] = cosmetics;
    } else {
      data.userCosmetics.push(cosmetics);
    }
    return data;
  });

  res.json({ success: true });
});

export default router;
