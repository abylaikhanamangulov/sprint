import { User } from '@drag-racing/shared/types';
import { usersCol } from './database';

export const ENERGY_MAX = 15;
export const ENERGY_REGEN_MINUTES = 8;

export class EnergyService {
  async processEnergyRegen(user: User): Promise<User> {
    if (!user.lastEnergyRegen) {
      user.lastEnergyRegen = new Date().toISOString();
      await usersCol.updateOne({ id: user.id }, { $set: { lastEnergyRegen: user.lastEnergyRegen } });
    }

    const maxEnergy = user.maxEnergy || ENERGY_MAX;

    // If max energy or above (could be overfilled via purchases)
    if (user.energy >= maxEnergy) {
      // Just keep lastEnergyRegen current so it doesn't accumulate while full
      const now = new Date().toISOString();
      if (new Date(now).getTime() - new Date(user.lastEnergyRegen).getTime() > 60000) {
        user.lastEnergyRegen = now;
        await usersCol.updateOne({ id: user.id }, { $set: { lastEnergyRegen: user.lastEnergyRegen } });
      }
      return user;
    }

    const lastRegen = new Date(user.lastEnergyRegen).getTime();
    const now = new Date().getTime();
    const elapsedMs = now - lastRegen;
    const regenMs = ENERGY_REGEN_MINUTES * 60 * 1000;

    if (elapsedMs >= regenMs) {
      const gained = Math.floor(elapsedMs / regenMs);
      const newEnergy = Math.min(maxEnergy, user.energy + gained);
      
      // Advance lastEnergyRegen by the exact amount of time used for regen
      // so remainder time is not lost
      const newLastRegenTime = lastRegen + (gained * regenMs);
      const newLastRegen = new Date(newLastRegenTime).toISOString();

      user.energy = newEnergy;
      user.lastEnergyRegen = newLastRegen;

      await usersCol.updateOne(
        { id: user.id },
        { 
          $set: { 
            energy: user.energy,
            lastEnergyRegen: user.lastEnergyRegen 
          } 
        }
      );
    }

    return user;
  }

  async deductEnergy(userId: number, amount: number = 1): Promise<boolean> {
    const user = await usersCol.findOne({ id: userId });
    if (!user) return false;

    // Regen before checking
    await this.processEnergyRegen(user);

    if (user.energy < amount) {
      return false;
    }

    const maxEnergy = user.maxEnergy || ENERGY_MAX;

    // Deduct
    const newEnergy = user.energy - amount;
    const updateQuery: any = { $set: { energy: newEnergy } };
    
    // If we were at max, start the regen timer from now
    if (user.energy >= maxEnergy && newEnergy < maxEnergy) {
      updateQuery.$set.lastEnergyRegen = new Date().toISOString();
    }

    await usersCol.updateOne({ id: userId }, updateQuery);
    return true;
  }
}

export const energyService = new EnergyService();
