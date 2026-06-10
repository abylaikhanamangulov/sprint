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
    const cardPacks = await (await import('../../core/database')).cardPacksCol.find().toArray();
    const cosmetics = await cosmeticsCol.find().toArray();
    const coinPackages = await coinPackagesCol.find().toArray();

    return {
      dailyDeal,
      crates,
      cardPacks,
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

  async openPack(userId: number, packId: string) {
    const { cardPacksCol, inventoryCol, usersCol, upgradesCol, carsCol } = await import('../../core/database');
    const pack = await cardPacksCol.findOne({ id: packId });
    if (!pack) throw new Error('PACK_NOT_FOUND');

    const user = await usersCol.findOne({ id: userId });
    if (!user) throw new Error('USER_NOT_FOUND');

    if (pack.price.currency === 'coins') {
      if (user.coins < pack.price.amount) throw new Error('NOT_ENOUGH_FUNDS');
      await usersCol.updateOne({ id: userId }, { $inc: { coins: -pack.price.amount } });
    } else if (pack.price.currency === 'points') {
      if ((user.points || 0) < pack.price.amount) throw new Error('NOT_ENOUGH_FUNDS');
      await usersCol.updateOne({ id: userId }, { $inc: { points: -pack.price.amount } });
    } else if (pack.price.currency === 'stars') {
      // Actually diamond pack might cost stars, let's treat it as points for now if stars are meant to be bought with real money.
      // But user said "валюта спринткоины и спрнтпоины", so probably we should use points for all premium packs.
      if ((user.points || 0) < pack.price.amount) throw new Error('NOT_ENOUGH_FUNDS');
      await usersCol.updateOne({ id: userId }, { $inc: { points: -pack.price.amount } });
    }

    const drops = [];
    const upgradeCats = await upgradesCol.find().toArray();
    const categories = upgradeCats.map(u => u.id); // e.g. ['engine', 'turbo', 'weight']
    
    // Slot 1: Guaranteed part card
    const guaranteedCategory = categories[Math.floor(Math.random() * categories.length)] || 'engine';
    drops.push({ type: 'upgrade_card', data: { category: guaranteedCategory }, amount: 1 });

    // Slots 2 to N
    for (let i = 1; i < pack.slots; i++) {
      const roll = Math.random() * 100;
      let current = 0;
      const probs = pack.slotProbabilities;

      current += probs.partCard;
      if (roll < current) {
        drops.push({ type: 'upgrade_card', data: { category: categories[Math.floor(Math.random() * categories.length)] || 'engine' }, amount: 1 });
        continue;
      }

      current += probs.x2Card;
      if (roll < current) {
        drops.push({ type: 'upgrade_card', data: { category: categories[Math.floor(Math.random() * categories.length)] || 'engine' }, amount: 2 });
        continue;
      }

      current += probs.points;
      if (roll < current) {
        const pointsAmount = Math.floor(Math.random() * 41) + 10; // 10 to 50
        drops.push({ type: 'points', data: {}, amount: pointsAmount });
        await usersCol.updateOne({ id: userId }, { $inc: { points: pointsAmount } });
        continue;
      }

      current += probs.ecuCard;
      if (roll < current) {
        drops.push({ type: 'ecu_card', data: { category: 'ecu' }, amount: 1 });
        continue;
      }

      // Fragments
      const fragProbs = probs.fragmentClass;
      let fragSum = 0;
      for (const prob of Object.values(fragProbs)) fragSum += (prob as number);
      
      let fRoll = Math.random() * fragSum;
      let fCurrent = 0;
      let selectedClass = 'D';
      
      for (const [cls, prob] of Object.entries(fragProbs)) {
        fCurrent += (prob as number);
        if (fRoll <= fCurrent) {
          selectedClass = cls;
          break;
        }
      }
      
      const carsOfClass = await carsCol.find({ class: selectedClass }).toArray();
      const randomCar = carsOfClass.length > 0 ? carsOfClass[Math.floor(Math.random() * carsOfClass.length)] : null;
      
      if (randomCar) {
        drops.push({ type: 'car_fragment', data: { carId: randomCar.id }, amount: 1 });
      } else {
        // Fallback if no car in class
        drops.push({ type: 'points', data: {}, amount: 50 });
        await usersCol.updateOne({ id: userId }, { $inc: { points: 50 } });
      }
    }

    // Give drops to user inventory
    for (const drop of drops) {
      if (drop.type === 'points') continue;

      const existing = await inventoryCol.findOne({
        userId,
        type: drop.type,
        ...(drop.data.category ? { 'data.category': drop.data.category } : {}),
        ...(drop.data.carId ? { 'data.carId': drop.data.carId } : {})
      });

      if (existing) {
        await inventoryCol.updateOne({ _id: existing._id }, { $inc: { amount: drop.amount } });
      } else {
        await inventoryCol.insertOne({
          id: Math.random().toString(36).substring(7),
          userId,
          type: drop.type as any,
          data: drop.data,
          amount: drop.amount
        });
      }
    }

    return drops;
  }
}

export const shopService = new ShopService();
