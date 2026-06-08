import { usersCol, achievementsCol, racesCol, clansCol, clanMembersCol } from '../../core/database';
import { UserSettings } from '@drag-racing/shared/types';

export class ProfileService {
  async getProfile(userId: number) {
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');

    const achievements = await achievementsCol.find().toArray();
    
    const clan = user.clanId ? await clansCol.findOne({ id: user.clanId }) : null;
    const clanRole = user.clanId
      ? (await clanMembersCol.findOne({ clanId: user.clanId, userId: user.id }))?.role
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

    const recentRaces = await racesCol.find({
      $or: [
        { 'player1.userId': user.id },
        { 'player2.userId': user.id }
      ]
    }).sort({ createdAt: -1 }).limit(20).toArray();

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

  async updateSettings(userId: number, settings: Partial<UserSettings>) {
    const updateQuery: Record<string, any> = {};
    for (const [key, value] of Object.entries(settings)) {
      updateQuery[`settings.${key}`] = value;
    }

    await usersCol.updateOne({ id: userId }, { $set: updateQuery });
    return { success: true };
  }

  async getLeaderboard() {
    const users = await usersCol.find().sort({ rankPoints: -1 }).limit(100).toArray();
    
    return users.map(u => ({
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
    }));
  }
}

export const profileService = new ProfileService();
