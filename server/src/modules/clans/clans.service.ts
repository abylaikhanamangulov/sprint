import { dataStore, FILES } from '../../core/database';
import { ClanPrivacy, ClanRole } from '@drag-racing/shared/types';

export class ClansService {
  getAllClans() {
    const data = dataStore.get(FILES.CLANS);
    return data.clans.map(clan => ({
      ...clan,
      memberCount: data.members.filter(m => m.clanId === clan.id).length,
    }));
  }

  getClanById(clanId: number) {
    const data = dataStore.get(FILES.CLANS);
    const clan = data.clans.find(c => c.id === clanId);
    if (!clan) throw new Error('CLAN_NOT_FOUND');

    const users = dataStore.get(FILES.USERS);
    const members = data.members
      .filter(m => m.clanId === clan.id)
      .map(m => {
        const user = users.find(u => u.id === m.userId);
        return { ...m, username: user?.username, firstName: user?.firstName, level: user?.level };
      });

    const wars = data.wars.filter(w => w.clanA === clan.id || w.clanB === clan.id);
    const messages = data.messages.filter(m => m.clanId === clan.id).slice(-50);

    return { ...clan, members, wars, messages };
  }

  createClan(userId: number, payload: { name: string; tag: string; icon?: string; privacy?: ClanPrivacy }) {
    const users = dataStore.get(FILES.USERS);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    if (user.coins < 1000) throw new Error('NOT_ENOUGH_COINS');
    if (user.clanId) throw new Error('ALREADY_IN_CLAN');

    let newClanId = 1;

    dataStore.update(FILES.CLANS, d => {
      newClanId = d.clans.length > 0 ? Math.max(...d.clans.map(c => c.id)) + 1 : 1;
      const newClan = {
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

      return {
        ...d,
        clans: [...d.clans, newClan],
        members: [...d.members, {
          clanId: newClanId,
          userId: userId,
          role: 'leader' as ClanRole,
          contribution: 0,
          joinedAt: new Date().toISOString(),
        }],
      };
    });

    dataStore.update(FILES.USERS, currentUsers =>
      currentUsers.map(u => u.id === userId ? { ...u, coins: u.coins - 1000, clanId: newClanId } : u)
    );

    return this.getClanById(newClanId);
  }

  joinClan(userId: number, clanId: number) {
    const users = dataStore.get(FILES.USERS);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('USER_NOT_FOUND');
    if (user.clanId) throw new Error('ALREADY_IN_CLAN');

    dataStore.update(FILES.CLANS, d => {
      const clan = d.clans.find(c => c.id === clanId);
      if (!clan) throw new Error('CLAN_NOT_FOUND');
      
      return {
        ...d,
        members: [...d.members, {
          clanId,
          userId,
          role: 'recruit' as ClanRole,
          contribution: 0,
          joinedAt: new Date().toISOString(),
        }],
      };
    });

    dataStore.update(FILES.USERS, currentUsers =>
      currentUsers.map(u => u.id === userId ? { ...u, clanId } : u)
    );

    return { success: true };
  }

  leaveClan(userId: number, clanId: number) {
    dataStore.update(FILES.CLANS, d => ({
      ...d,
      members: d.members.filter(m => !(m.clanId === clanId && m.userId === userId)),
    }));

    dataStore.update(FILES.USERS, currentUsers =>
      currentUsers.map(u => u.id === userId ? { ...u, clanId: null } : u)
    );

    return { success: true };
  }

  donate(userId: number, clanId: number, amount: number) {
    const users = dataStore.get(FILES.USERS);
    const user = users.find(u => u.id === userId);
    if (!user || user.coins < amount) throw new Error('NOT_ENOUGH_COINS');

    dataStore.update(FILES.CLANS, d => ({
      ...d,
      clans: d.clans.map(c => c.id === clanId ? { ...c, treasury: c.treasury + amount, xp: c.xp + amount } : c),
      members: d.members.map(m =>
        m.clanId === clanId && m.userId === userId
          ? { ...m, contribution: m.contribution + amount }
          : m
      ),
    }));

    dataStore.update(FILES.USERS, currentUsers =>
      currentUsers.map(u => u.id === userId ? { ...u, coins: u.coins - amount } : u)
    );

    return { success: true };
  }

  sendChat(userId: number, clanId: number, text: string) {
    dataStore.update(FILES.CLANS, d => ({
      ...d,
      messages: [...d.messages, {
        clanId,
        userId,
        text,
        timestamp: new Date().toISOString(),
      }],
    }));
    return { success: true };
  }

  getWarGhost(clanId: number) {
    const data = dataStore.get(FILES.CLANS);
    const war = data.wars.find(w => (w.clanA === clanId || w.clanB === clanId) && w.status === 'active');
    
    if (!war) return { warId: 0, clanId, enemyClanId: 0, scoreOurs: 0, scoreTheirs: 0, ghost: null };

    const oursIsA = war.clanA === clanId;
    const enemyClanId = oursIsA ? war.clanB : war.clanA;
    const scoreOurs = oursIsA ? war.scoreA : war.scoreB;
    const scoreTheirs = oursIsA ? war.scoreB : war.scoreA;

    const users = dataStore.get(FILES.USERS);
    const cars = dataStore.get(FILES.CARS);
    const enemyMembers = data.members.filter(m => m.clanId === enemyClanId);

    const GHOST_NAMES = ['Призрак Кенджи', 'Тень Ивана', 'Ночной Виктор', 'Рейсер X'];
    let ghost;

    if (enemyMembers.length > 0) {
      const pick = enemyMembers[scoreOurs % enemyMembers.length];
      const gu = users.find(u => u.id === pick.userId);
      const gcar = cars.find(c => c.id === (gu?.selectedCarId ?? 5)) || cars[4];
      const baseTime = gu?.stats?.bestTime && gu.stats.bestTime > 0 ? gu.stats.bestTime : 11.5;
      ghost = {
        userId: pick.userId,
        name: gu?.firstName || gu?.username || GHOST_NAMES[scoreOurs % GHOST_NAMES.length],
        carId: gcar.id,
        carName: gcar.name,
        carClass: gcar.class,
        drivetrain: gcar.drivetrain,
        time: Math.round((baseTime + (scoreOurs % 3) * 0.25) * 1000) / 1000,
      };
    } else {
      const gcar = cars[4] || cars[0];
      ghost = {
        userId: -enemyClanId,
        name: GHOST_NAMES[scoreOurs % GHOST_NAMES.length],
        carId: gcar.id,
        carName: gcar.name,
        carClass: gcar.class,
        drivetrain: gcar.drivetrain,
        time: Math.round((11.2 + (scoreOurs % 4) * 0.4) * 1000) / 1000,
      };
    }

    return { warId: war.id, clanId, enemyClanId, scoreOurs, scoreTheirs, ghost };
  }

  processWarRace(userId: number, clanId: number, warId: number, playerTime: number, ghostTime: number) {
    const won = playerTime < ghostTime;

    const data = dataStore.update(FILES.CLANS, d => ({
      ...d,
      wars: d.wars.map(w => {
        if (w.id !== warId) return w;
        const oursIsA = w.clanA === clanId;
        if (!won) return w;
        return oursIsA ? { ...w, scoreA: w.scoreA + 1 } : { ...w, scoreB: w.scoreB + 1 };
      }),
    }));

    if (won) {
      dataStore.update(FILES.USERS, users =>
        users.map(u => u.id === userId ? { ...u, coins: u.coins + 75 } : u)
      );
    }

    const war = data.wars.find(w => w.id === warId);
    const oursIsA = war && war.clanA === clanId;

    return {
      won,
      playerTime,
      ghostTime,
      scoreOurs: war ? (oursIsA ? war.scoreA : war.scoreB) : 0,
      scoreTheirs: war ? (oursIsA ? war.scoreB : war.scoreA) : 0,
    };
  }
}

export const clansService = new ClansService();
