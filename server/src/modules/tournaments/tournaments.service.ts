import { dataStore, FILES } from '../../core/database';
import { Tournament } from '@drag-racing/shared/types';

export class TournamentsService {
  getAll(): Tournament[] {
    return dataStore.get(FILES.TOURNAMENTS);
  }

  getActive(): Tournament[] {
    return this.getAll().filter(t => t.status === 'active' || t.status === 'upcoming');
  }

  getById(id: number): Tournament {
    const tournament = this.getAll().find(t => t.id === id);
    if (!tournament) throw new Error('TOURNAMENT_NOT_FOUND');
    return tournament;
  }

  joinTournament(userId: number, tournamentId: number) {
    const tournament = this.getById(tournamentId);

    if (tournament.participants.includes(userId)) {
      throw new Error('ALREADY_PARTICIPATING');
    }

    const users = dataStore.get(FILES.USERS);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    const fee = tournament.entryFee;
    
    if (fee.amount > 0) {
      if (user.coins < fee.amount) {
        throw new Error('NOT_ENOUGH_FUNDS');
      }

      dataStore.update(FILES.USERS, currentUsers =>
        currentUsers.map(u => u.id === userId ? { ...u, coins: u.coins - fee.amount } : u)
      );
    }

    dataStore.update(FILES.TOURNAMENTS, ts =>
      ts.map(t => t.id === tournamentId ? { ...t, participants: [...t.participants, userId] } : t)
    );

    return { success: true };
  }
}

export const tournamentsService = new TournamentsService();
