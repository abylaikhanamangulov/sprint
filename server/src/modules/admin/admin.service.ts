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

  // --- GOD MODE FEATURES ---
  async addCoins(userId: number, amount: number) {
    await usersCol.updateOne({ id: userId }, { $inc: { coins: amount } });
  }

  async removeCoins(userId: number, amount: number) {
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');
    const newCoins = Math.max(0, user.coins - amount);
    await usersCol.updateOne({ id: userId }, { $set: { coins: newCoins } });
  }

  async addXp(userId: number, amount: number) {
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');
    
    let newXp = user.xp + amount;
    let newLevel = user.level;
    let newXpToNext = user.xpToNext;

    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel++;
      newXpToNext = Math.floor(newXpToNext * 1.5);
    }

    await usersCol.updateOne({ id: userId }, { $set: { xp: newXp, level: newLevel, xpToNext: newXpToNext } });
  }

  async setLevel(userId: number, level: number) {
    if (level < 1) throw new Error('INVALID_LEVEL');
    const xpToNext = 100 * Math.pow(1.5, level - 1); // rough formula
    await usersCol.updateOne({ id: userId }, { $set: { level, xp: 0, xpToNext: Math.floor(xpToNext) } });
  }

  async removeCar(userId: number, carId: number) {
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');
    
    if (!user.ownedCars || !user.ownedCars.includes(carId)) {
      throw new Error('CAR_NOT_OWNED');
    }
    
    const newCars = user.ownedCars.filter(id => id !== carId);
    let selectedCarId = user.selectedCarId;
    if (selectedCarId === carId) {
      selectedCarId = newCars.length > 0 ? newCars[0] : null;
    }
    
    await usersCol.updateOne({ id: userId }, { $set: { ownedCars: newCars, selectedCarId } });
  }

  async wipeUser(userId: number) {
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');
    
    // Reset everything except registration data
    await usersCol.updateOne({ id: userId }, {
      $set: {
        level: 1,
        xp: 0,
        xpToNext: 100,
        coins: 0,
        energy: 20,
        rankPoints: 0,
        rankTier: 1,
        selectedCarId: null,
        ownedCars: [],
        clanId: null,
        dailyStreak: 0,
        'stats.totalRaces': 0,
        'stats.pvpWins': 0,
        'stats.pvpLosses': 0,
        'stats.coinsEarned': 0
      }
    });
  }

  async giveAchievement(userId: number, achievementId: number) {
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');
    // Basic stub - implementation depends on actual achievement systems
  }

  // --- CLAN GOD MODE ---
  async renameClan(clanId: number, newName: string) {
    const clan = await clansCol.findOne({ id: clanId });
    if (!clan) throw new Error('CLAN_NOT_FOUND');
    const existing = await clansCol.findOne({ name: newName });
    if (existing && existing.id !== clanId) throw new Error('NAME_ALREADY_TAKEN');
    await clansCol.updateOne({ id: clanId }, { $set: { name: newName } });
  }

  async changeClanLeader(clanId: number, newLeaderId: number) {
    const clan = await clansCol.findOne({ id: clanId });
    if (!clan) throw new Error('CLAN_NOT_FOUND');
    
    const member = await clanMembersCol.findOne({ clanId, userId: newLeaderId });
    if (!member) throw new Error('USER_NOT_IN_CLAN');
    
    // Demote old leader
    await clanMembersCol.updateOne({ clanId, userId: clan.leaderId }, { $set: { role: 'officer' } });
    // Promote new leader
    await clanMembersCol.updateOne({ clanId, userId: newLeaderId }, { $set: { role: 'leader' } });
    // Update clan doc
    await clansCol.updateOne({ id: clanId }, { $set: { leaderId: newLeaderId } });
  }

  async kickClanMember(clanId: number, targetUserId: number) {
    const member = await clanMembersCol.findOne({ clanId, userId: targetUserId });
    if (!member) throw new Error('USER_NOT_IN_CLAN');
    const clan = await clansCol.findOne({ id: clanId });
    if (clan && clan.leaderId === targetUserId) {
      throw new Error('CANNOT_KICK_LEADER'); // Must change leader first
    }
    
    await clanMembersCol.deleteOne({ clanId, userId: targetUserId });
    await usersCol.updateOne({ id: targetUserId }, { $set: { clanId: null } });
  }

  async addClanXp(clanId: number, amount: number) {
    const clan = await clansCol.findOne({ id: clanId });
    if (!clan) throw new Error('CLAN_NOT_FOUND');
    
    let newXp = clan.xp + amount;
    let newLevel = clan.level;
    let newXpToNext = clan.xpToNext;

    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel++;
      newXpToNext = Math.floor(newXpToNext * 1.5);
    }

    await clansCol.updateOne({ id: clanId }, { $set: { xp: newXp, level: newLevel, xpToNext: newXpToNext } });
  }

  // --- SYSTEM CONTROL ---
  async setMaintenanceMode(enabled: boolean) {
    // dynamically import to avoid circular dependencies if necessary, but we can just require or import at top
    const { systemSettingsCol } = require('../../core/database');
    await systemSettingsCol.updateOne({ id: 'global' }, { $set: { maintenanceMode: enabled } }, { upsert: true });
  }

  async getSystemSettings() {
    const { systemSettingsCol } = require('../../core/database');
    const settings = await systemSettingsCol.findOne({ id: 'global' });
    return settings || { maintenanceMode: false };
  }
}

export const adminService = new AdminService();
