import { dataStore, FILES } from '../../core/database';
import { ShopCrate, Cosmetic, NftDrop, GoldPackage } from '@drag-racing/shared/types';

export class ShopService {
  getShopCatalog() {
    const shop = dataStore.get(FILES.SHOP);
    const cars = dataStore.get(FILES.CARS);

    const dailyDealCar = cars.find(c => c.id === shop.dailyDeal.carId);
    const dailyDeal = dailyDealCar ? {
      car: dailyDealCar,
      discount: shop.dailyDeal.discount,
      expiresAt: shop.dailyDeal.expiresAt,
      discountedPrice: dailyDealCar.priceSilver
        ? Math.round(dailyDealCar.priceSilver * (1 - shop.dailyDeal.discount / 100))
        : null,
    } : null;

    return {
      dailyDeal,
      crates: shop.crates,
      cosmetics: shop.cosmetics,
      nftDrops: shop.nftDrops,
      goldPackages: shop.goldPackages,
    };
  }

  buyCosmetic(userId: number, cosmeticId: string) {
    const shop = dataStore.get(FILES.SHOP);
    const cosmetic = shop.cosmetics.find(c => c.id === cosmeticId);
    if (!cosmetic) throw new Error('COSMETIC_NOT_FOUND');

    const users = dataStore.get(FILES.USERS);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    const field = cosmetic.price.currency === 'gold' ? 'gold' : 'silver';
    if (user[field] < cosmetic.price.amount) throw new Error('NOT_ENOUGH_FUNDS');

    dataStore.update(FILES.USERS, currentUsers =>
      currentUsers.map(u => u.id === userId ? { ...u, [field]: u[field] - cosmetic.price.amount } : u)
    );

    return cosmetic;
  }

  buyCrate(userId: number, crateId: string) {
    const shop = dataStore.get(FILES.SHOP);
    const crate = shop.crates.find(c => c.id === crateId);
    if (!crate) throw new Error('CRATE_NOT_FOUND');

    const users = dataStore.get(FILES.USERS);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    const field = crate.price.currency === 'gold' ? 'gold' : 'silver';
    if (user[field] < crate.price.amount) throw new Error('NOT_ENOUGH_FUNDS');

    const drops: string[] = [];
    const contents = crate.contents as Record<string, number>;
    
    for (let i = 0; i < (contents.common || 0); i++) drops.push('common_part');
    for (let i = 0; i < (contents.rare || 0); i++) drops.push('rare_part');
    
    const epicChance = (crate.contents as any).epicChance;
    if (epicChance && Math.random() < epicChance) {
      drops.push('epic_part');
    }

    dataStore.update(FILES.USERS, currentUsers =>
      currentUsers.map(u => u.id === userId ? { ...u, [field]: u[field] - crate.price.amount } : u)
    );

    return drops;
  }

  buyGold(userId: number, packageId: string) {
    const shop = dataStore.get(FILES.SHOP);
    const pkg = shop.goldPackages.find(p => p.id === packageId);
    if (!pkg) throw new Error('PACKAGE_NOT_FOUND');

    dataStore.update(FILES.USERS, currentUsers =>
      currentUsers.map(u => u.id === userId ? { ...u, gold: u.gold + pkg.gold } : u)
    );

    return { goldAdded: pkg.gold };
  }
}

export const shopService = new ShopService();
