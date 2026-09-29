import { racesCol } from '../../core/database';
import { RaceResult } from '@drag-racing/shared/types';

export class RacesService {
  async getHistory(userId: number): Promise<RaceResult[]> {
    return await racesCol.find({
      $or: [
        { 'player1.userId': userId },
        { 'player2.userId': userId }
      ]
    }).sort({ createdAt: -1 }).limit(50).toArray();
  }

  async saveRaceResult(raceResult: RaceResult) {
    await racesCol.insertOne(raceResult);
    return { success: true };
  }

  async findMatch(userId: number, currentPP: number) {
    const { usersCol } = await import('../../core/database');
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');

    if (user.energy < 1) throw new Error('NOT_ENOUGH_ENERGY');

    // Ищем оппонента в диапазоне +/- 5% от PP машины игрока
    const minPP = Math.floor(currentPP * 0.95);
    const maxPP = Math.floor(currentPP * 1.05);
    const opponentPP = Math.floor(Math.random() * (maxPP - minPP + 1)) + minPP;

    return {
      opponent: {
        username: 'Racer_' + Math.floor(Math.random() * 9000 + 1000),
        pp: opponentPP,
        level: user.level,
      }
    };
  }

  async finishRace(userId: number, isWinner: boolean, distance: 'eighth' | 'quarter' | 'half' = 'quarter') {
    const { usersCol } = await import('../../core/database');
    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');

    // Базовые награды из нашего economy_model.md
    let baseSilver = 100; // Quarter mile (1/4 мили)
    let baseXp = 20;
    let lossSilver = 30;
    let lossXp = 5;

    if (distance === 'eighth') {
      baseSilver = 50;
      baseXp = 10;
      lossSilver = 15;
      lossXp = 2;
    } else if (distance === 'half') {
      baseSilver = 150;
      baseXp = 30;
      lossSilver = 45;
      lossXp = 7;
    } else if (distance === 'mile') {
      baseSilver = 200;
      baseXp = 40;
      lossSilver = 60;
      lossXp = 10;
    }

    const silverEarned = isWinner ? baseSilver : lossSilver;
    const xpEarned = isWinner ? baseXp : lossXp;

    await usersCol.updateOne(
      { id: userId },
      { 
        $inc: { 
          coins: silverEarned, 
          xp: xpEarned,
          energy: -1, // Тратим топливо
          'stats.totalRaces': 1,
          'stats.pvpWins': isWinner ? 1 : 0,
          'stats.pvpLosses': isWinner ? 0 : 1,
        } 
      }
    );

    return { silver: silverEarned, xp: xpEarned, newEnergy: user.energy - 1 };
  }
}

export const racesService = new RacesService();
