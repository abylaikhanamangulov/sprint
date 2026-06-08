import { clansCol, clanMembersCol, clanWarsCol, clanMessagesCol, usersCol, carsCol } from '../../core/database';
import { ClanPrivacy, ClanRole, Clan, ClanMember } from '@drag-racing/shared/types';
import { MESSAGES } from '../../constants/messages';

export class ClansService {
  async getAllClans() {
    const clans = await clansCol.find().toArray();
    const clansWithCounts = await Promise.all(clans.map(async (clan) => {
      const memberCount = await clanMembersCol.countDocuments({ clanId: clan.id });
      return { ...clan, memberCount };
    }));
    return clansWithCounts;
  }

  async getClanById(clanId: number) {
    const clan = await clansCol.findOne({ id: clanId });
    if (!clan) throw new Error('CLAN_NOT_FOUND');

    const membersRaw = await clanMembersCol.find({ clanId }).toArray();
    const members = await Promise.all(membersRaw.map(async (m) => {
      const user = await usersCol.findOne({ id: m.userId });
      return { ...m, username: user?.username, firstName: user?.firstName, level: user?.level };
    }));

    const wars = await clanWarsCol.find({ $or: [{ clanA: clanId }, { clanB: clanId }] }).toArray();
    const messages = await clanMessagesCol.find({ clanId }).sort({ timestamp: 1 }).limit(50).toArray();

    return { ...clan, members, wars, messages };
  }

  async createClan(userId: number, payload: { name: string; tag: string; icon?: string; privacy?: ClanPrivacy }) {
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');

    if (user.coins < 1000) throw new Error('NOT_ENOUGH_COINS');
    if (user.clanId) throw new Error('ALREADY_IN_CLAN');

    const lastClan = await clansCol.find().sort({ id: -1 }).limit(1).toArray();
    const newClanId = lastClan.length > 0 ? lastClan[0].id + 1 : 1;

    const newClan: Clan = {
      id: newClanId,
      name: payload.name,
      tag: payload.tag.toUpperCase(),
      icon: payload.icon || 'default',
      privacy: payload.privacy || 'open',
      level: 1,
      xp: 0,
      xpToNext: 3000,
      treasury: 0,
      leaderId: userId,
      createdAt: new Date().toISOString(),
    };

    const newMember: ClanMember = {
      clanId: newClanId,
      userId: userId,
      role: 'leader',
      contribution: 0,
      joinedAt: new Date().toISOString(),
    };

    await clansCol.insertOne(newClan);
    await clanMembersCol.insertOne(newMember);

    await usersCol.updateOne(
      { id: userId },
      { $inc: { coins: -1000 }, $set: { clanId: newClanId } }
    );

    return await this.getClanById(newClanId);
  }

  async joinClan(userId: number, clanId: number) {
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');
    if (user.clanId) throw new Error('ALREADY_IN_CLAN');

    const clan = await clansCol.findOne({ id: clanId });
    if (!clan) throw new Error('CLAN_NOT_FOUND');

    const newMember: ClanMember = {
      clanId,
      userId,
      role: 'recruit',
      contribution: 0,
      joinedAt: new Date().toISOString(),
    };

    await clanMembersCol.insertOne(newMember);
    await usersCol.updateOne({ id: userId }, { $set: { clanId } });

    return { success: true };
  }

  async leaveClan(userId: number, clanId: number) {
    await clanMembersCol.deleteOne({ clanId, userId });
    await usersCol.updateOne({ id: userId }, { $set: { clanId: null } });
    return { success: true };
  }

  async donate(userId: number, clanId: number, amount: number) {
    const user = await usersCol.findOne({ id: userId });
    if (!user || user.coins < amount) throw new Error('NOT_ENOUGH_COINS');

    await clansCol.updateOne(
      { id: clanId },
      { $inc: { treasury: amount, xp: amount } }
    );

    await clanMembersCol.updateOne(
      { clanId, userId },
      { $inc: { contribution: amount } }
    );

    await usersCol.updateOne(
      { id: userId },
      { $inc: { coins: -amount } }
    );

    return { success: true };
  }

  async sendChat(userId: number, clanId: number, text: string) {
    await clanMessagesCol.insertOne({
      clanId,
      userId,
      text,
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  }

  async getWarGhost(clanId: number) {
    const war = await clanWarsCol.findOne({
      $or: [{ clanA: clanId }, { clanB: clanId }],
      status: 'active'
    });
    
    if (!war) return { warId: 0, clanId, enemyClanId: 0, scoreOurs: 0, scoreTheirs: 0, ghost: null };

    const oursIsA = war.clanA === clanId;
    const enemyClanId = oursIsA ? war.clanB : war.clanA;
    const scoreOurs = oursIsA ? war.scoreA : war.scoreB;
    const scoreTheirs = oursIsA ? war.scoreB : war.scoreA;

    const enemyMembers = await clanMembersCol.find({ clanId: enemyClanId }).toArray();

    const GHOST_NAMES = MESSAGES.misc.ghostNames;
    let ghost;

    if (enemyMembers.length > 0) {
      const pick = enemyMembers[scoreOurs % enemyMembers.length];
      const gu = await usersCol.findOne({ id: pick.userId });
      
      let gcarId = gu?.selectedCarId ?? 5;
      let gcar = await carsCol.findOne({ id: gcarId });
      if (!gcar) {
        gcar = (await carsCol.find().toArray())[4]; 
      }
      
      const baseTime = gu?.stats?.bestTime && gu.stats.bestTime > 0 ? gu.stats.bestTime : 11.5;
      ghost = {
        userId: pick.userId,
        name: gu?.firstName || gu?.username || GHOST_NAMES[scoreOurs % GHOST_NAMES.length],
        carId: gcar?.id,
        carName: gcar?.name,
        carClass: gcar?.class,
        drivetrain: gcar?.drivetrain,
        time: Math.round((baseTime + (scoreOurs % 3) * 0.25) * 1000) / 1000,
      };
    } else {
      const cars = await carsCol.find().toArray();
      const gcar = cars[4] || cars[0];
      ghost = {
        userId: -enemyClanId,
        name: GHOST_NAMES[scoreOurs % GHOST_NAMES.length],
        carId: gcar?.id,
        carName: gcar?.name,
        carClass: gcar?.class,
        drivetrain: gcar?.drivetrain,
        time: Math.round((11.2 + (scoreOurs % 4) * 0.4) * 1000) / 1000,
      };
    }

    return { warId: war.id, clanId, enemyClanId, scoreOurs, scoreTheirs, ghost };
  }

  async processWarRace(userId: number, clanId: number, warId: number, playerTime: number, ghostTime: number) {
    const won = playerTime < ghostTime;

    if (won) {
      const war = await clanWarsCol.findOne({ id: warId });
      if (war) {
        const oursIsA = war.clanA === clanId;
        await clanWarsCol.updateOne(
          { id: warId },
          oursIsA ? { $inc: { scoreA: 1 } } : { $inc: { scoreB: 1 } }
        );
      }

      await usersCol.updateOne(
        { id: userId },
        { $inc: { coins: 75 } }
      );
    }

    const updatedWar = await clanWarsCol.findOne({ id: warId });
    const oursIsA = updatedWar && updatedWar.clanA === clanId;

    return {
      won,
      playerTime,
      ghostTime,
      scoreOurs: updatedWar ? (oursIsA ? updatedWar.scoreA : updatedWar.scoreB) : 0,
      scoreTheirs: updatedWar ? (oursIsA ? updatedWar.scoreB : updatedWar.scoreA) : 0,
    };
  }
}

export const clansService = new ClansService();
