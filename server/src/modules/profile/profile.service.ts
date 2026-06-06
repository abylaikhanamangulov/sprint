import { dataStore, FILES } from '../../core/database';
import { UserSettings } from '@drag-racing/shared/types';

export class ProfileService {
  getProfile(userId: number) {
    const users = dataStore.get(FILES.USERS);
    const user = users.find(u => u.id === userId);
    
    if (!user) throw new Error('USER_NOT_FOUND');

    const achievements = dataStore.get(FILES.ACHIEVEMENTS);
    const races = dataStore.get(FILES.RACES);
    const clansData = dataStore.get(FILES.CLANS);

    const clan = user.clanId ? clansData.clans.find(c => c.id === user.clanId) : null;
    const clanRole = user.clanId
      ? clansData.members.find(m => m.clanId === user.clanId && m.userId === user.id)?.role
      : null;

    const unlockedAchievements = achievements.filter(a => {
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

    return {
      user,
      clan: clan ? { ...clan, role: clanRole } : null,
      achievements: achievements.map(a => ({
        ...a,
        unlocked: unlockedAchievements.some(u => u.id === a.id),
      })),
      recentRaces,
    };
  }

  updateSettings(userId: number, settings: Partial<UserSettings>) {
    dataStore.update(FILES.USERS, users =>
      users.map(u => u.id === userId ? { ...u, settings: { ...u.settings, ...settings } } : u)
    );
    return { success: true };
  }

  getLeaderboard() {
    const users = dataStore.get(FILES.USERS);
    return users
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
      .sort((a, b) => b.rankPoints - a.rankPoints)
      .slice(0, 100); 
  }
}

export const profileService = new ProfileService();
