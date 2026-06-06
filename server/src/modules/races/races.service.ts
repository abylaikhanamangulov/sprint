import { dataStore, FILES } from '../../core/database';
import { RaceResult } from '@drag-racing/shared/types';

export class RacesService {
  getHistory(userId: number): RaceResult[] {
    const races = dataStore.get(FILES.RACES);
    return races
      .filter(r => r.player1.userId === userId || (r.player2 && r.player2.userId === userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);
  }

  saveRaceResult(raceResult: RaceResult) {
    dataStore.update(FILES.RACES, races => [...races, raceResult]);
    return { success: true };
  }
}

export const racesService = new RacesService();
