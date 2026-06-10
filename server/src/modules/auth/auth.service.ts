import { usersCol } from '../../core/database';
import { User } from '@drag-racing/shared/types';
import { WithId } from 'mongodb';
import { MESSAGES } from '../../constants/messages';

interface LoginPayload {
  telegramId: number;
  username?: string;
  firstName?: string;
  avatarUrl?: string;
}

export class AuthService {
  async loginOrRegister(payload: LoginPayload): Promise<{ user: User; isNew: boolean }> {
    let user = await usersCol.findOne({ telegramId: payload.telegramId });
    let isNew = false;

    if (!user) {
      isNew = true;
      
      // Get the highest ID
      const lastUser = await usersCol.find().sort({ id: -1 }).limit(1).toArray();
      const nextId = lastUser.length > 0 ? lastUser[0].id + 1 : 1;
      
      const newUser: User = {
        id: nextId,
        telegramId: payload.telegramId,
        username: payload.username || `user_${payload.telegramId}`,
        firstName: payload.firstName || MESSAGES.misc.racerDefaultName,
        avatarUrl: payload.avatarUrl || '',
        level: 1,
        xp: 0,
        xpToNext: 500,
        coins: 1500,
        points: 0,
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
          coinsEarned: 0,
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
        lastLoginAt: new Date().toISOString(),
      };

      await usersCol.insertOne(newUser);
      user = newUser as unknown as WithId<User>;
    } else {
      user.lastLoginAt = new Date().toISOString();
      await usersCol.updateOne({ _id: user._id }, { $set: { lastLoginAt: user.lastLoginAt } });
    }

    return { user: user as User, isNew: user!.selectedCarId === null };
  }

  async claimDailyReward(userId: number) {
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('User not found');

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
      coins: 500 + Math.min(user.dailyStreak * 100, 2000) + (user.dailyStreak > 0 && user.dailyStreak % 7 === 0 ? 500 : 0),
    };

    user.coins = (user.coins || 0) + reward.coins;

    await usersCol.updateOne({ id: userId }, { 
      $set: { 
        coins: user.coins, 
        dailyStreak: user.dailyStreak, 
        lastDailyReward: user.lastDailyReward 
      } 
    });

    return {
      success: true,
      streak: user.dailyStreak,
      reward,
    };
  }

  async selectStarter(userId: number, carId: number) {
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('User not found');
    if (user.selectedCarId) throw new Error('Starter car already selected');

    const { carsCol } = await import('../../core/database');
    const car = await carsCol.findOne({ id: carId, isStarter: true });
    if (!car) throw new Error('Invalid starter car');

    await usersCol.updateOne(
      { id: userId },
      { 
        $set: { selectedCarId: carId },
        $addToSet: { ownedCars: carId }
      }
    );

    return { success: true, carId };
  }
}

export const authService = new AuthService();
