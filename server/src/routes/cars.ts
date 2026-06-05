import { Router } from 'express';
import { dataStore, FILES } from '../data';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', (_req, res) => {
  const cars = dataStore.get<any[]>(FILES.CARS);
  res.json(cars);
});

router.get('/starters', (_req, res) => {
  const cars = dataStore.get<any[]>(FILES.CARS);
  res.json(cars.filter(c => c.isStarter));
});

router.get('/:id', (req, res) => {
  const cars = dataStore.get<any[]>(FILES.CARS);
  const car = cars.find(c => c.id === Number(req.params.id));
  if (!car) {
    res.status(404).json({ error: 'Машина не найдена' });
    return;
  }
  res.json(car);
});

router.post('/:id/buy', authMiddleware, (req: AuthRequest, res) => {
  const carId = Number(req.params.id);
  const cars = dataStore.get<any[]>(FILES.CARS);
  const car = cars.find(c => c.id === carId);

  if (!car) {
    res.status(404).json({ error: 'Машина не найдена' });
    return;
  }

  const user = req.user;

  if (car.priceSilver !== null && user.silver < car.priceSilver) {
    res.status(400).json({ error: 'Недостаточно серебра' });
    return;
  }
  if (car.priceGold !== null && user.gold < car.priceGold) {
    res.status(400).json({ error: 'Недостаточно золота' });
    return;
  }

  const cost = car.priceSilver !== null
    ? { silver: -car.priceSilver, gold: 0 }
    : { silver: 0, gold: -(car.priceGold || 0) };

  dataStore.update<any[]>(FILES.USERS, users =>
    users.map(u => u.id === req.userId ? {
      ...u,
      silver: u.silver + cost.silver,
      gold: u.gold + cost.gold,
      ownedCars: Array.from(new Set([...(u.ownedCars || []), carId])),
    } : u)
  );

  res.json({ success: true, carId, balance: { silver: user.silver + cost.silver, gold: user.gold + cost.gold } });
});

export default router;
