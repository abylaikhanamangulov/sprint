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
}

export const authService = new AuthService();
