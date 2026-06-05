import { Router } from 'express';
import { dataStore, FILES } from '../data';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user;
  const achievements = dataStore.get<any[]>(FILES.ACHIEVEMENTS);
  const races = dataStore.get<any[]>(FILES.RACES);
  const data = dataStore.get<any>(FILES.CLANS);

  const clan = user.clanId ? data.clans.find((c: any) => c.id === user.clanId) : null;
  const clanRole = user.clanId
    ? data.members.find((m: any) => m.clanId === user.clanId && m.userId === user.id)?.role
    : null;

  const unlockedAchievements = achievements.filter((a: any) => {
    switch (a.condition.type) {
      case 'pvp_wins': return user.stats.pvpWins >= a.condition.value;
      case 'total_races': return user.stats.totalRaces >= a.condition.value;
      case 'win_streak': return user.stats.longestWinStreak >= a.condition.value;
      case 'best_time': return user.stats.bestTime > 0 && user.stats.bestTime <= a.condition.value;
      default: return false;
    }
  });

  const recentRaces = races
    .filter(r => r.player1.userId === user.id || r.player2?.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  res.json({
    user,
    clan: clan ? { ...clan, role: clanRole } : null,
    achievements: achievements.map(a => ({
      ...a,
      unlocked: unlockedAchievements.some(u => u.id === a.id),
    })),
    recentRaces,
  });
});

router.put('/settings', authMiddleware, (req: AuthRequest, res) => {
  const settings = req.body;

  dataStore.update<any[]>(FILES.USERS, users =>
    users.map(u => u.id === req.userId ? { ...u, settings: { ...u.settings, ...settings } } : u)
  );

  res.json({ success: true });
});

router.get('/leaderboard', (_req, res) => {
  const users = dataStore.get<any[]>(FILES.USERS);
  const leaderboard = users
    .map(u => ({
      id: u.id,
      username: u.username,
      firstName: u.firstName,
      level: u.level,
      rankPoints: u.rankPoints,
      rankTier: u.rankTier,
      winRate: u.stats.totalRaces > 0
        ? Math.round((u.stats.pvpWins / (u.stats.pvpWins + u.stats.pvpLosses)) * 100)
        : 0,
      bestTime: u.stats.bestTime,
    }))
    .sort((a, b) => b.rankPoints - a.rankPoints);

  res.json(leaderboard);
});

export default router;
