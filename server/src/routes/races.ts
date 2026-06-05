import { Router } from 'express';
import { dataStore, FILES } from '../data';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

function simulateAiRace(aiPP: number, difficulty: number): { time: number; shifts: string[] } {
  const baseTime = 15 - (aiPP / 100);
  const variance = (Math.random() - 0.5) * 0.5;
  const time = Math.max(8, baseTime + variance);

  const gears = 5 + (aiPP > 300 ? 1 : 0);
  const shifts: string[] = [];
  for (let i = 0; i < gears; i++) {
    const roll = Math.random();
    if (roll < difficulty * 0.5) shifts.push('perfect');
    else if (roll < difficulty * 0.8) shifts.push('good');
    else shifts.push('miss');
  }

  return { time: Math.round(time * 1000) / 1000, shifts };
}

router.post('/pve', authMiddleware, (req: AuthRequest, res) => {
  const { chapterId, nodeId, playerTime, playerShifts, usedNos, distanceMeters, opponentTime } = req.body;
  // Distances scale the AI time and the star thresholds (quarter mile = baseline).
  const distFactor = (Number(distanceMeters) || 402) / 402;

  const campaignData = dataStore.get<any>(FILES.CAMPAIGN);
  const chapter = campaignData.chapters.find((c: any) => c.id === chapterId);
  if (!chapter) {
    res.status(404).json({ error: 'Глава не найдена' });
    return;
  }

  const node = chapter.nodes.find((n: any) => n.id === nodeId);
  if (!node) {
    res.status(404).json({ error: 'Узел не найден' });
    return;
  }

  const user = req.user;
  if (user.energy < node.energyCost) {
    res.status(400).json({ error: 'Недостаточно энергии' });
    return;
  }

  const difficulty = node.type === 'boss' ? 0.85 : 0.6;
  const aiResult = simulateAiRace(node.opponentCar.pp, difficulty);
  // The visible rival (its own car's real time) is the actual opponent when sent.
  if (Number(opponentTime) > 0) {
    aiResult.time = Math.round(Number(opponentTime) * 1000) / 1000;
  } else {
    aiResult.time = Math.round(aiResult.time * distFactor * 1000) / 1000;
  }
  const playerWon = playerTime < aiResult.time;

  let stars = 0;
  if (playerWon) {
    for (const threshold of node.starThresholds) {
      if (playerTime <= threshold * distFactor) stars++;
    }
    stars = Math.max(1, stars);
  }

  const raceResult = {
    id: Date.now(),
    type: 'campaign',
    player1: { userId: req.userId, carId: user.selectedCarId, time: playerTime, shifts: playerShifts },
    player2: { userId: null, carId: null, time: aiResult.time, shifts: aiResult.shifts },
    winnerId: playerWon ? req.userId : 0,
    campaignNode: { chapterId, nodeId },
    distance: 'quarter',
    rewards: playerWon ? { winner: node.rewards } : {},
    createdAt: new Date().toISOString(),
  };

  dataStore.update<any[]>(FILES.RACES, races => [...races, raceResult]);

  if (playerWon) {
    dataStore.update<any[]>(FILES.USERS, users =>
      users.map(u => u.id === req.userId ? {
        ...u,
        energy: u.energy - node.energyCost,
        silver: u.silver + node.rewards.silver,
        xp: u.xp + node.rewards.xp,
        stats: {
          ...u.stats,
          totalRaces: u.stats.totalRaces + 1,
          bestTime: u.stats.bestTime === 0 ? playerTime : Math.min(u.stats.bestTime, playerTime),
        },
      } : u)
    );

    dataStore.update<any>(FILES.CAMPAIGN, data => {
      const existing = data.userProgress.find(
        (p: any) => p.userId === req.userId && p.chapterId === chapterId && p.nodeId === nodeId
      );
      if (existing) {
        existing.stars = Math.max(existing.stars, stars);
        existing.completed = true;
      } else {
        data.userProgress.push({ userId: req.userId, chapterId, nodeId, stars, completed: true });
      }
      return data;
    });
  } else {
    dataStore.update<any[]>(FILES.USERS, users =>
      users.map(u => u.id === req.userId ? {
        ...u,
        energy: u.energy - node.energyCost,
        stats: { ...u.stats, totalRaces: u.stats.totalRaces + 1 },
      } : u)
    );
  }

  res.json({
    result: raceResult,
    playerWon,
    stars,
    aiTime: aiResult.time,
    rewards: playerWon ? node.rewards : null,
  });
});

router.get('/history', authMiddleware, (req: AuthRequest, res) => {
  const races = dataStore.get<any[]>(FILES.RACES);
  const userRaces = races
    .filter(r => r.player1.userId === req.userId || (r.player2 && r.player2.userId === req.userId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);
  res.json(userRaces);
});

export default router;
