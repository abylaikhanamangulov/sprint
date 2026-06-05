import { Router } from 'express';
import { dataStore, FILES } from '../data';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', (_req, res) => {
  const shop = dataStore.get<any>(FILES.SHOP);
  const cars = dataStore.get<any[]>(FILES.CARS);

  const dailyDealCar = cars.find(c => c.id === shop.dailyDeal.carId);
  const dailyDeal = dailyDealCar ? {
    car: dailyDealCar,
    discount: shop.dailyDeal.discount,
    expiresAt: shop.dailyDeal.expiresAt,
    discountedPrice: dailyDealCar.priceSilver
      ? Math.round(dailyDealCar.priceSilver * (1 - shop.dailyDeal.discount / 100))
      : null,
  } : null;

  res.json({
    dailyDeal,
    crates: shop.crates,
    cosmetics: shop.cosmetics,
    nftDrops: shop.nftDrops,
    goldPackages: shop.goldPackages,
  });
});

router.post('/buy-cosmetic', authMiddleware, (req: AuthRequest, res) => {
  const { cosmeticId } = req.body;
  const shop = dataStore.get<any>(FILES.SHOP);
  const cosmetic = shop.cosmetics.find((c: any) => c.id === cosmeticId);

  if (!cosmetic) {
    res.status(404).json({ error: 'Косметика не найдена' });
    return;
  }

  const user = req.user;
  const field = cosmetic.price.currency === 'gold' ? 'gold' : 'silver';

  if (user[field] < cosmetic.price.amount) {
    res.status(400).json({ error: 'Недостаточно средств' });
    return;
  }

  dataStore.update<any[]>(FILES.USERS, users =>
    users.map(u => u.id === req.userId ? { ...u, [field]: u[field] - cosmetic.price.amount } : u)
  );

  res.json({ success: true, item: cosmetic });
});

router.post('/buy-crate', authMiddleware, (req: AuthRequest, res) => {
  const { crateId } = req.body;
  const shop = dataStore.get<any>(FILES.SHOP);
  const crate = shop.crates.find((c: any) => c.id === crateId);

  if (!crate) {
    res.status(404).json({ error: 'Кейс не найден' });
    return;
  }

  const user = req.user;
  const field = crate.price.currency === 'gold' ? 'gold' : 'silver';

  if (user[field] < crate.price.amount) {
    res.status(400).json({ error: 'Недостаточно средств' });
    return;
  }

  const drops: string[] = [];
  for (let i = 0; i < (crate.contents.common || 0); i++) drops.push('common_part');
  for (let i = 0; i < (crate.contents.rare || 0); i++) drops.push('rare_part');
  if (crate.contents.epicChance && Math.random() < crate.contents.epicChance) drops.push('epic_part');

  dataStore.update<any[]>(FILES.USERS, users =>
    users.map(u => u.id === req.userId ? { ...u, [field]: u[field] - crate.price.amount } : u)
  );

  res.json({ success: true, drops });
});

router.post('/buy-gold', authMiddleware, (req: AuthRequest, res) => {
  const { packageId, paymentMethod } = req.body;
  const shop = dataStore.get<any>(FILES.SHOP);
  const pkg = shop.goldPackages.find((p: any) => p.id === packageId);

  if (!pkg) {
    res.status(404).json({ error: 'Пакет не найден' });
    return;
  }

  dataStore.update<any[]>(FILES.USERS, users =>
    users.map(u => u.id === req.userId ? { ...u, gold: u.gold + pkg.gold } : u)
  );

  res.json({ success: true, goldAdded: pkg.gold, paymentMethod });
});

export default router;
