import { dataStore, FILES } from '../../core/database';
import { User } from '@drag-racing/shared/types';

interface LoginPayload {
  telegramId: number;
  username?: string;
  firstName?: string;
  avatarUrl?: string;
}

export class AuthService {
  loginOrRegister(payload: LoginPayload): { user: User; isNew: boolean } {
    const users = dataStore.get(FILES.USERS);
    let user = users.find(u => u.telegramId === payload.telegramId);
    let isNew = false;

    if (!user) {
      isNew = true;
      
      const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

      user = {
        id: nextId,
        telegramId: payload.telegramId,
        username: payload.username || `user_${payload.telegramId}`,
        firstName: payload.firstName || 'Гонщик',
        avatarUrl: payload.avatarUrl || '',
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

      dataStore.update(FILES.USERS, currentUsers => [...currentUsers, user as User]);
    }

    return { user, isNew: user.selectedCarId === null };
  }

  claimDailyReward(userId: number) {
    const users = dataStore.get(FILES.USERS);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    const user = { ...users[userIndex] };
    const now = new Date();

    if (user.lastDailyReward) {
      const hours = (now.getTime() - new Date(user.lastDailyReward).getTime()) / (1000 * 60 * 60);
      if (hours < 20) throw new Error('Daily reward already claimed');
      if (hours > 48) {
        user.dailyStreak = 0;
      } else {
        user.dailyStreak = (user.dailyStreak || 0) + 1;
      }
    } else {
      user.dailyStreak = 1;
    }

    user.lastDailyReward = now.toISOString();
    
    const reward = {
      silver: 500 + Math.min(user.dailyStreak * 100, 2000),
      gold: user.dailyStreak > 0 && user.dailyStreak % 7 === 0 ? 5 : 0,
    };

    user.silver = (user.silver || 0) + reward.silver;
    user.gold = (user.gold || 0) + reward.gold;

    dataStore.update(FILES.USERS, current => {
      const updated = [...current];
      updated[userIndex] = user as User;
      return updated;
    });

    return {
      success: true,
      streak: user.dailyStreak,
      reward,
    };
  }
}

export const authService = new AuthService();
