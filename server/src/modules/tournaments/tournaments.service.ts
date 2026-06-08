import { tournamentsCol, usersCol } from '../../core/database';
import { Tournament } from '@drag-racing/shared/types';

export class TournamentsService {
  async getAll(): Promise<Tournament[]> {
    return await tournamentsCol.find().toArray();
  }

  async getActive(): Promise<Tournament[]> {
    return await tournamentsCol.find({ status: { $in: ['active', 'upcoming'] } }).toArray();
  }

  async getById(id: number): Promise<Tournament> {
    const tournament = await tournamentsCol.findOne({ id });
    if (!tournament) throw new Error('TOURNAMENT_NOT_FOUND');
    return tournament;
  }

  async joinTournament(userId: number, tournamentId: number) {
    const tournament = await this.getById(tournamentId);

    if (tournament.participants.includes(userId)) {
      throw new Error('ALREADY_PARTICIPATING');
    }

    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');

    const fee = tournament.entryFee;
    
    if (fee.amount > 0) {
      if (user.coins < fee.amount) {
        throw new Error('NOT_ENOUGH_FUNDS');
      }

      await usersCol.updateOne({ id: userId }, { $inc: { coins: -fee.amount } });
    }

    await tournamentsCol.updateOne({ id: tournamentId }, { $push: { participants: userId } });

    return { success: true };
  }
}

export const tournamentsService = new TournamentsService();
