import { usersCol, carsCol, clansCol, clanMembersCol, clanWarsCol, clanMessagesCol, tournamentsCol } from '../../core/database';
import { User, Car, Clan } from '@drag-racing/shared/types';
import TelegramBot from 'node-telegram-bot-api';

export class AdminService {
  async getServerStats() {
    const totalUsers = await usersCol.countDocuments();
    
    // Calculate DAU (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const dau = await usersCol.countDocuments({
      $or: [
        { lastLoginAt: { $gte: oneDayAgo } },
        { createdAt: { $gte: oneDayAgo } }
      ]
    });
    
    // Total races - MongoDB aggregation
    const pipeline = [
      { $group: { _id: null, totalRaces: { $sum: "$stats.totalRaces" } } }
    ];
    const racesResult = await usersCol.aggregate(pipeline).toArray();
    const totalRaces = racesResult.length > 0 ? racesResult[0].totalRaces : 0;

    return {
      totalUsers,
      dau,
      totalRaces,
    };
  }

  async broadcastMessage(bot: TelegramBot, text: string) {
    const users = await usersCol.find({ telegramId: { $exists: true, $ne: null as any } }).toArray();
    let sent = 0;
    let failed = 0;
    
    // Send in chunks to avoid rate limiting
    for (const user of users) {
      if (!user.telegramId) continue;
      
      try {
        await bot.sendMessage(user.telegramId, text);
        sent++;
        // Small delay to prevent hitting Telegram API limits (approx 30 msgs/sec max)
        await new Promise(resolve => setTimeout(resolve, 50)); 
      } catch (e) {
        failed++;
      }
    }
    
    return { sent, failed };
  }

  async inspectUser(userId: number) {
    const user = await usersCol.findOne({ id: userId });
    
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    
    const carsCount = user.ownedCars ? user.ownedCars.length : 0;
    
    return {
      user,
      carsCount
    };
  }

  async toggleBan(userId: number) {
    const user = await usersCol.findOne({ id: userId });
    
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    
    const isBanned = !user.isBanned;
    await usersCol.updateOne({ id: userId }, { $set: { isBanned } });
    
    return isBanned;
  }

  async giveCar(userId: number, carId: number) {
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');
    
    const car = await carsCol.findOne({ id: carId });
    if (!car) throw new Error('CAR_NOT_FOUND');
    
    if (user.ownedCars && user.ownedCars.includes(carId)) {
      throw new Error('ALREADY_OWNED');
    }
    
    await usersCol.updateOne(
      { id: userId }, 
      { $push: { ownedCars: carId } }
    );
    
    return car.name;
  }

  async restoreEnergy(userId: number) {
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');
    
    const energy = user.maxEnergy || 20;
    const lastEnergyRegen = new Date().toISOString();
    
    await usersCol.updateOne(
      { id: userId }, 
      { $set: { energy, lastEnergyRegen } }
    );
    
    return energy;
  }

  async deleteClan(clanId: number) {
    const clan = await clansCol.findOne({ id: clanId });
    if (!clan) throw new Error('CLAN_NOT_FOUND');
    
    // Remove clan and associated data
    await clansCol.deleteOne({ id: clanId });
    await clanMembersCol.deleteMany({ clanId });
    await clanWarsCol.deleteMany({ $or: [{ clanA: clanId }, { clanB: clanId }] });
    await clanMessagesCol.deleteMany({ clanId });
    
    // Reset user clanIds
    await usersCol.updateMany(
      { clanId: clanId },
      { $set: { clanId: null } }
    );
    
    return clan.name;
  }

  async toggleTournament(tournamentId: number) {
    const t = await tournamentsCol.findOne({ id: tournamentId });
    if (!t) throw new Error('TOURNAMENT_NOT_FOUND');
    
    let newStatus = t.status;
    if (t.status === 'upcoming') {
      newStatus = 'active';
    } else if (t.status === 'active') {
      newStatus = 'completed';
    } else {
      newStatus = 'upcoming';
    }
    
    await tournamentsCol.updateOne(
      { id: tournamentId },
      { $set: { status: newStatus } }
    );
    
    return newStatus;
  }
}

export const adminService = new AdminService();
