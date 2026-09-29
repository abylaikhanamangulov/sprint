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
        coins: 8000,
        points: 0,
        energy: 15,
        maxEnergy: 15,
        lastEnergyRegen: new Date().toISOString(),
        rankPoints: 0,
        rankTier: 1,
        selectedCarId: null,
        ownedCars: [],
        clanId: null,
        rewardMonth: '',
        claimedDays: [],
        founderRewardClaimed: false,
        claimedHolidays: [],
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

  async selectStarter(userId: number, carId: number) {
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('User not found');
    if (user.selectedCarId) throw new Error('Starter car already selected');

    const { carsCol } = await import('../../core/database');
    const car = await carsCol.findOne({ id: carId, isStarter: true });
    if (!car) throw new Error('Invalid starter car');
    
    // Взимаем плату за стартовую машину
    const cost = car.priceCoins || 0;
    if (user.coins < cost) throw new Error('NOT_ENOUGH_FUNDS');

    await usersCol.updateOne(
      { id: userId },
      { 
        $set: { selectedCarId: carId },
        $addToSet: { ownedCars: carId },
        $inc: { coins: -cost }
      }
    );

    return { success: true, carId, cost };
  }
}

export const authService = new AuthService();
