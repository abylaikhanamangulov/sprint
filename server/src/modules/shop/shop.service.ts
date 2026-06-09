import { shopCratesCol, cosmeticsCol, coinPackagesCol, carsCol, usersCol, db } from '../../core/database';
import { bot } from '../../bot';

export class ShopService {
  async getShopCatalog() {
    const shopStateCol = db.collection<any>('shopState');
    let state = await shopStateCol.findOne({ id: 'dailyDeal' });
    if (!state) {
      state = { id: 'dailyDeal', dailyDeal: { carId: 2, discount: 20, expiresAt: new Date(Date.now() + 86400000).toISOString() } };
      await shopStateCol.insertOne(state);
    }

    const dailyDealCar = await carsCol.findOne({ id: state.dailyDeal.carId });
    const dailyDeal = dailyDealCar ? {
      car: dailyDealCar,
      discount: state.dailyDeal.discount,
      expiresAt: state.dailyDeal.expiresAt,
      discountedPrice: dailyDealCar.priceCoins
        ? Math.round(dailyDealCar.priceCoins * (1 - state.dailyDeal.discount / 100))
        : null,
    } : null;

    const crates = await shopCratesCol.find().toArray();
    const cosmetics = await cosmeticsCol.find().toArray();
    const coinPackages = await coinPackagesCol.find().toArray();

    return {
      dailyDeal,
      crates,
      cosmetics,
      coinPackages,
    };
  }

  async buyCosmetic(userId: number, cosmeticId: string) {
    const cosmetic = await cosmeticsCol.findOne({ id: cosmeticId });
    if (!cosmetic) throw new Error('COSMETIC_NOT_FOUND');

    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');

    if (user.coins < cosmetic.price.amount) throw new Error('NOT_ENOUGH_FUNDS');

    await usersCol.updateOne({ id: userId }, { $inc: { coins: -cosmetic.price.amount } });

    return cosmetic;
  }

  async buyCrate(userId: number, crateId: string) {
    const crate = await shopCratesCol.findOne({ id: crateId });
    if (!crate) throw new Error('CRATE_NOT_FOUND');

    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');

    if (user.coins < crate.price.amount) throw new Error('NOT_ENOUGH_FUNDS');

    const drops: string[] = [];
    const contents = crate.contents as Record<string, number>;
    
    for (let i = 0; i < (contents.common || 0); i++) drops.push('common_part');
    for (let i = 0; i < (contents.rare || 0); i++) drops.push('rare_part');
    
    const epicChance = (crate.contents as any).epicChance;
    if (epicChance && Math.random() < epicChance) {
      drops.push('epic_part');
    }

    await usersCol.updateOne({ id: userId }, { $inc: { coins: -crate.price.amount } });

    return drops;
  }

  async buyCoins(userId: number, packageId: string) {
    const pkg = await coinPackagesCol.findOne({ id: packageId });
    if (!pkg) throw new Error('PACKAGE_NOT_FOUND');

    await usersCol.updateOne({ id: userId }, { $inc: { coins: pkg.coins } });

    return { coinsAdded: pkg.coins };
  }

  async createInvoice(userId: number, packageId: string) {
    const pkg = await coinPackagesCol.findOne({ id: packageId });
    if (!pkg) throw new Error('PACKAGE_NOT_FOUND');

    const title = pkg.name;
    const description = `Покупка ${pkg.coins} монет`;
    const payload = `pkg_${packageId}_user_${userId}`;
    const providerToken = ''; // Empty for Telegram Stars
    const currency = 'XTR';
    const prices = [{ label: pkg.name, amount: pkg.priceStars }];

    const url = await bot.createInvoiceLink(
      title,
      description,
      payload,
      providerToken,
      currency,
      prices
    );

    return url;
  }
}

export const shopService = new ShopService();
