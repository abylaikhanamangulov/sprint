import { Router } from 'express';
import { dataStore, FILES } from '../data';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', (_req, res) => {
  const data = dataStore.get<any>(FILES.CLANS);
  const clans = data.clans.map((clan: any) => ({
    ...clan,
    memberCount: data.members.filter((m: any) => m.clanId === clan.id).length,
  }));
  res.json(clans);
});

router.get('/:id', (req, res) => {
  const data = dataStore.get<any>(FILES.CLANS);
  const clan = data.clans.find((c: any) => c.id === Number(req.params.id));
  if (!clan) {
    res.status(404).json({ error: 'Клан не найден' });
    return;
  }

  const members = data.members
    .filter((m: any) => m.clanId === clan.id)
    .map((m: any) => {
      const users = dataStore.get<any[]>(FILES.USERS);
      const user = users.find((u: any) => u.id === m.userId);
      return { ...m, username: user?.username, firstName: user?.firstName, level: user?.level };
    });

  const wars = data.wars.filter((w: any) => w.clanA === clan.id || w.clanB === clan.id);
  const messages = data.messages
    .filter((m: any) => m.clanId === clan.id)
    .slice(-50);

  res.json({ ...clan, members, wars, messages });
});

router.post('/create', authMiddleware, (req: AuthRequest, res) => {
  const { name, tag, icon, privacy } = req.body;
  const user = req.user;

  if (user.silver < 1000) {
    res.status(400).json({ error: 'Недостаточно серебра (нужно 1000)' });
    return;
  }
  if (user.clanId) {
    res.status(400).json({ error: 'Вы уже в клане' });
    return;
  }

  const data = dataStore.get<any>(FILES.CLANS);
  const newClan = {
    id: data.clans.length + 1,
    name,
    tag: tag.toUpperCase(),
    icon: icon || 'default',
    privacy: privacy || 'open',
    level: 1,
    xp: 0,
    xpToNext: 3000,
    treasury: 0,
    leaderId: req.userId,
    createdAt: new Date().toISOString(),
  };

  dataStore.update<any>(FILES.CLANS, d => ({
    ...d,
    clans: [...d.clans, newClan],
    members: [...d.members, {
      clanId: newClan.id,
      userId: req.userId,
      role: 'leader',
      contribution: 0,
      joinedAt: new Date().toISOString(),
    }],
  }));

  dataStore.update<any[]>(FILES.USERS, users =>
    users.map(u => u.id === req.userId ? { ...u, silver: u.silver - 1000, clanId: newClan.id } : u)
  );

  res.json(newClan);
});

router.post('/:id/join', authMiddleware, (req: AuthRequest, res) => {
  const clanId = Number(req.params.id);
  if (req.user.clanId) {
    res.status(400).json({ error: 'Вы уже в клане' });
    return;
  }

  dataStore.update<any>(FILES.CLANS, d => ({
    ...d,
    members: [...d.members, {
      clanId,
      userId: req.userId,
      role: 'recruit',
      contribution: 0,
      joinedAt: new Date().toISOString(),
    }],
  }));

  dataStore.update<any[]>(FILES.USERS, users =>
    users.map(u => u.id === req.userId ? { ...u, clanId } : u)
  );

  res.json({ success: true });
});

router.post('/:id/leave', authMiddleware, (req: AuthRequest, res) => {
  const clanId = Number(req.params.id);

  dataStore.update<any>(FILES.CLANS, d => ({
    ...d,
    members: d.members.filter((m: any) => !(m.clanId === clanId && m.userId === req.userId)),
  }));

  dataStore.update<any[]>(FILES.USERS, users =>
    users.map(u => u.id === req.userId ? { ...u, clanId: null } : u)
  );

  res.json({ success: true });
});

router.post('/:id/donate', authMiddleware, (req: AuthRequest, res) => {
  const clanId = Number(req.params.id);
  const { amount } = req.body;

  if (req.user.silver < amount) {
    res.status(400).json({ error: 'Недостаточно серебра' });
    return;
  }

  dataStore.update<any>(FILES.CLANS, d => ({
    ...d,
    clans: d.clans.map((c: any) => c.id === clanId ? { ...c, treasury: c.treasury + amount, xp: c.xp + amount } : c),
    members: d.members.map((m: any) =>
      m.clanId === clanId && m.userId === req.userId
        ? { ...m, contribution: m.contribution + amount }
        : m
    ),
  }));

  dataStore.update<any[]>(FILES.USERS, users =>
    users.map(u => u.id === req.userId ? { ...u, silver: u.silver - amount } : u)
  );

  res.json({ success: true });
});

router.post('/:id/chat', authMiddleware, (req: AuthRequest, res) => {
  const clanId = Number(req.params.id);
  const { text } = req.body;

  dataStore.update<any>(FILES.CLANS, d => ({
    ...d,
    messages: [...d.messages, {
      clanId,
      userId: req.userId,
      text,
      timestamp: new Date().toISOString(),
    }],
  }));

  res.json({ success: true });
});

// ── Clan war: race a ghost of an enemy-clan player ──────────────────────────
router.get('/:id/war', authMiddleware, (req: AuthRequest, res) => {
  const clanId = Number(req.params.id);
  const data = dataStore.get<any>(FILES.CLANS);
  const war = data.wars.find(
    (w: any) => (w.clanA === clanId || w.clanB === clanId) && w.status === 'active'
  );
  if (!war) {
    res.json({ warId: 0, clanId, enemyClanId: 0, scoreOurs: 0, scoreTheirs: 0, ghost: null });
    return;
  }

  const oursIsA = war.clanA === clanId;
  const enemyClanId = oursIsA ? war.clanB : war.clanA;
  const scoreOurs = oursIsA ? war.scoreA : war.scoreB;
  const scoreTheirs = oursIsA ? war.scoreB : war.scoreA;

  const users = dataStore.get<any[]>(FILES.USERS);
  const cars = dataStore.get<any[]>(FILES.CARS);
  const enemyMembers = data.members.filter((m: any) => m.clanId === enemyClanId);

  // Pick a ghost from the enemy clan; if it has no members, synthesize one.
  const GHOST_NAMES = ['Призрак Кенджи', 'Тень Ивана', 'Ночной Виктор', 'Рейсер X'];
  let ghost;
  if (enemyMembers.length > 0) {
    const pick = enemyMembers[scoreOurs % enemyMembers.length];
    const gu = users.find((u) => u.id === pick.userId);
    const gcar = cars.find((c) => c.id === (gu?.selectedCarId ?? 5)) || cars[4];
    const baseTime = gu?.stats?.bestTime > 0 ? gu.stats.bestTime : 11.5;
    ghost = {
      userId: pick.userId,
      name: gu?.firstName || gu?.username || GHOST_NAMES[scoreOurs % GHOST_NAMES.length],
      carId: gcar.id,
      carName: gcar.name,
      carClass: gcar.class,
      drivetrain: gcar.drivetrain,
      time: Math.round((baseTime + (scoreOurs % 3) * 0.25) * 1000) / 1000,
    };
  } else {
    // enemy clan has no roster yet — synthesize a believable rival
    const gcar = cars[4] || cars[0];
    ghost = {
      userId: -enemyClanId,
      name: GHOST_NAMES[scoreOurs % GHOST_NAMES.length],
      carId: gcar.id,
      carName: gcar.name,
      carClass: gcar.class,
      drivetrain: gcar.drivetrain,
      time: Math.round((11.2 + (scoreOurs % 4) * 0.4) * 1000) / 1000,
    };
  }

  res.json({ warId: war.id, clanId, enemyClanId, scoreOurs, scoreTheirs, ghost });
});

router.post('/:id/war/race', authMiddleware, (req: AuthRequest, res) => {
  const clanId = Number(req.params.id);
  const { warId, playerTime, ghostTime } = req.body;
  const won = Number(playerTime) < Number(ghostTime);

  const data = dataStore.update<any>(FILES.CLANS, (d) => ({
    ...d,
    wars: d.wars.map((w: any) => {
      if (w.id !== warId) return w;
      const oursIsA = w.clanA === clanId;
      if (!won) return w;
      return oursIsA ? { ...w, scoreA: w.scoreA + 1 } : { ...w, scoreB: w.scoreB + 1 };
    }),
  }));

  if (won) {
    dataStore.update<any[]>(FILES.USERS, (users) =>
      users.map((u) => (u.id === req.userId ? { ...u, silver: u.silver + 75 } : u))
    );
  }

  const war = data.wars.find((w: any) => w.id === warId);
  const oursIsA = war && war.clanA === clanId;
  res.json({
    won,
    playerTime: Number(playerTime),
    ghostTime: Number(ghostTime),
    scoreOurs: war ? (oursIsA ? war.scoreA : war.scoreB) : 0,
    scoreTheirs: war ? (oursIsA ? war.scoreB : war.scoreA) : 0,
  });
});

export default router;
