import { dataStore, FILES } from '../../core/database';
import { Car } from '@drag-racing/shared/types';

export class CarsService {
  getAllCars(): Car[] {
    return dataStore.get(FILES.CARS);
  }

  getStarterCars(): Car[] {
    return this.getAllCars().filter(car => car.isStarter);
  }

  getCarById(id: number): Car | undefined {
    return this.getAllCars().find(car => car.id === id);
  }

  buyCar(userId: number, carId: number) {
    const car = this.getCarById(carId);
    if (!car) throw new Error('CAR_NOT_FOUND');

    const users = dataStore.get(FILES.USERS);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    if (car.priceCoins !== null && user.coins < car.priceCoins) {
      throw new Error('NOT_ENOUGH_COINS');
    }

    const costCoins = car.priceCoins || 0;

    dataStore.update(FILES.USERS, currentUsers =>
      currentUsers.map(u => u.id === userId ? {
        ...u,
        coins: u.coins - costCoins,
        ownedCars: Array.from(new Set([...(u.ownedCars || []), carId])),
      } : u)
    );

    return {
      carId,
      balance: { coins: user.coins - costCoins }
    };
  }
}

export const carsService = new CarsService();
