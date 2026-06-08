import { carsCol, usersCol } from '../../core/database';
import { Car } from '@drag-racing/shared/types';

export class CarsService {
  async getAllCars(): Promise<Car[]> {
    return await carsCol.find().toArray();
  }

  async getStarterCars(): Promise<Car[]> {
    return await carsCol.find({ isStarter: true }).toArray();
  }

  async getCarById(id: number): Promise<Car | null> {
    return await carsCol.findOne({ id });
  }

  async buyCar(userId: number, carId: number) {
    const car = await this.getCarById(carId);
    if (!car) throw new Error('CAR_NOT_FOUND');

    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');

    if (car.priceCoins !== null && user.coins < car.priceCoins) {
      throw new Error('NOT_ENOUGH_COINS');
    }

    const costCoins = car.priceCoins || 0;

    await usersCol.updateOne(
      { id: userId },
      {
        $inc: { coins: -costCoins },
        $addToSet: { ownedCars: carId }
      }
    );

    return {
      carId,
      balance: { coins: user.coins - costCoins }
    };
  }
}

export const carsService = new CarsService();
