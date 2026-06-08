import fs from 'fs';
import path from 'path';

const dataDir = path.join(__dirname, '../data');

function convertValue(obj: any, keySilver: string, keyGold: string, keyCoins: string) {
  let coins = 0;
  if (obj[keySilver] != null) coins += obj[keySilver];
  if (obj[keyGold] != null) coins += obj[keyGold] * 100;
  
  obj[keyCoins] = coins;
  delete obj[keySilver];
  delete obj[keyGold];
}

function migrateUsers() {
  const file = path.join(dataDir, 'users.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  data.forEach((u: any) => {
    convertValue(u, 'silver', 'gold', 'coins');
    if (u.stats) {
      if (u.stats.silverEarned != null) {
        u.stats.coinsEarned = u.stats.silverEarned;
        delete u.stats.silverEarned;
      }
    }
  });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function migrateCars() {
  const file = path.join(dataDir, 'cars.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  data.forEach((c: any) => {
    let coins = null;
    if (c.priceSilver != null || c.priceGold != null) {
      coins = (c.priceSilver || 0) + (c.priceGold || 0) * 100;
    }
    c.priceCoins = coins;
    delete c.priceSilver;
    delete c.priceGold;
  });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function migrateAchievements() {
  const file = path.join(dataDir, 'achievements.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  data.forEach((a: any) => {
    let coins = 0;
    if (a.rewardSilver) coins += a.rewardSilver;
    if (a.rewardGold) coins += a.rewardGold * 100;
    a.rewardCoins = coins;
    delete a.rewardSilver;
    delete a.rewardGold;
  });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function migrateCampaign() {
  const file = path.join(dataDir, 'campaign.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  data.chapters.forEach((ch: any) => {
    ch.nodes.forEach((n: any) => {
      if (n.rewards) {
        let coins = 0;
        if (n.rewards.silver) coins += n.rewards.silver;
        if (n.rewards.gold) coins += n.rewards.gold * 100;
        n.rewards.coins = coins;
        delete n.rewards.silver;
        delete n.rewards.gold;
      }
    });
  });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function migrateRaces() {
  const file = path.join(dataDir, 'races.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  data.forEach((r: any) => {
    if (r.rewards) {
      Object.keys(r.rewards).forEach(k => {
        let coins = 0;
        if (r.rewards[k].silver) coins += r.rewards[k].silver;
        if (r.rewards[k].gold) coins += r.rewards[k].gold * 100;
        r.rewards[k].coins = coins;
        delete r.rewards[k].silver;
        delete r.rewards[k].gold;
      });
    }
  });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function migrateShop() {
  const file = path.join(dataDir, 'shop.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  
  if (data.crates) {
    data.crates.forEach((c: any) => {
      if (c.price) {
        if (c.price.currency === 'gold') {
          c.price.amount *= 100;
        }
        c.price.currency = 'coins';
      }
    });
  }
  
  if (data.cosmetics) {
    data.cosmetics.forEach((c: any) => {
      if (c.price) {
        if (c.price.currency === 'gold') {
          c.price.amount *= 100;
        }
        c.price.currency = 'coins';
      }
    });
  }
  
  if (data.goldPackages) {
    data.goldPackages.forEach((p: any) => {
      if (p.gold != null) {
        p.coins = p.gold; 
        p.coins = p.gold * 100;
        delete p.gold;
      }
    });
    data.coinPackages = data.goldPackages;
    delete data.goldPackages;
  }
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function migrateTournaments() {
  const file = path.join(dataDir, 'tournaments.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  data.forEach((t: any) => {
    if (t.entryFee) {
      if (t.entryFee.currency === 'gold') t.entryFee.amount *= 100;
      t.entryFee.currency = 'coins';
    }
    if (t.prizePool) {
      t.prizePool.forEach((p: any) => {
        let coins = 0;
        if (p.silver) coins += p.silver;
        if (p.gold) coins += p.gold * 100;
        p.coins = coins;
        delete p.silver;
        delete p.gold;
      });
    }
  });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function migrateUpgrades() {
  const file = path.join(dataDir, 'upgrades.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  if (data.categories) {
    data.categories.forEach((c: any) => {
      if (c.currency === 'gold') {
        c.baseCost *= 100;
      }
      c.currency = 'coins';
    });
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

migrateUsers();
migrateCars();
migrateAchievements();
migrateCampaign();
migrateRaces();
migrateShop();
migrateTournaments();
migrateUpgrades();
console.log('Migration completed successfully.');
