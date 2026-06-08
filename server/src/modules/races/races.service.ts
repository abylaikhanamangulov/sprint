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
}

export const racesService = new RacesService();
