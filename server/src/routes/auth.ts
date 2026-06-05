import { Router } from 'express';
import { dataStore, FILES } from '../data';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', (req, res) => {
  const { telegramId, username, firstName, avatarUrl } = req.body;
  const users = dataStore.get<any[]>(FILES.USERS);
  let user = users.find(u => u.telegramId === telegramId);

  if (!user) {
    user = {
      id: users.length + 1,
      telegramId,
      username: username || `user_${telegramId}`,
      firstName: firstName || 'Гонщик',
      avatarUrl: avatarUrl || '',
      level: 1,
      xp: 0,
      xpToNext: 500,
      silver: 500,
      gold: 10,
      energy: 20,
      maxEnergy: 20,
      lastEnergyRegen: new Date().toISOString(),
      rankPoints: 0,
      rankTier: 1,
      selectedCarId: null,
      ownedCars: [],
      clanId: null,
      dailyStreak: 0,
      lastDailyReward: null,
      stats: {
        totalRaces: 0,
        pvpWins: 0,
        pvpLosses: 0,
        bestTime: 0,
        perfectShifts: 0,
        longestWinStreak: 0,
        silverEarned: 0,
      },
      settings: {
        language: 'ru',
        soundEffects: true,
        music: true,
        musicVolume: 70,
        vibration: true,
        graphicsQuality: 'high',
        notifications: true,
        showFps: false,
      },
      createdAt: new Date().toISOString(),
    };
    dataStore.update<any[]>(FILES.USERS, users => [...users, user!]);
  }

  res.json({ user, isNew: user.selectedCarId === null });
});

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  res.json(req.user);
});

router.post('/select-starter', authMiddleware, (req: AuthRequest, res) => {
  const { carId } = req.body;
  const cars = dataStore.get<any[]>(FILES.CARS);
  const car = cars.find(c => c.id === carId && c.isStarter);

  if (!car) {
    res.status(400).json({ error: 'Недоступная стартовая машина' });
    return;
  }

  dataStore.update<any[]>(FILES.USERS, users =>
    users.map(u => u.id === req.userId ? {
      ...u,
      selectedCarId: carId,
      ownedCars: Array.from(new Set([...(u.ownedCars || []), carId])),
    } : u)
  );

  res.json({ success: true, carId });
});

router.post('/daily-reward', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user;
  const now = new Date();
  const lastReward = user.lastDailyReward ? new Date(user.lastDailyReward) : null;

  if (lastReward) {
    const hoursSince = (now.getTime() - lastReward.getTime()) / (1000 * 60 * 60);
    if (hoursSince < 20) {
      res.status(400).json({ error: 'Награда уже получена сегодня' });
      return;
    }
  }

  const DAILY_REWARDS = [
    { day: 1, silver: 100, gold: 0 },
    { day: 2, silver: 150, gold: 0 },
    { day: 3, silver: 200, gold: 5 },
    { day: 4, silver: 300, gold: 0 },
    { day: 5, silver: 400, gold: 10 },
    { day: 6, silver: 500, gold: 0 },
    { day: 7, silver: 1000, gold: 25 },
  ];

  let streak = user.dailyStreak;
  if (lastReward) {
    const daysSince = (now.getTime() - lastReward.getTime()) / (1000 * 60 * 60 * 24);
    streak = daysSince < 2 ? (streak % 7) + 1 : 1;
  } else {
    streak = 1;
  }

  const reward = DAILY_REWARDS[streak - 1];

  dataStore.update<any[]>(FILES.USERS, users =>
    users.map(u => u.id === req.userId ? {
      ...u,
      silver: u.silver + reward.silver,
      gold: u.gold + reward.gold,
      dailyStreak: streak,
      lastDailyReward: now.toISOString(),
    } : u)
  );

  res.json({ streak, reward });
});

export default router;
