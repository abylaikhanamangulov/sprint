import { Router } from 'express';
import { dataStore, FILES } from '../data';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', (_req, res) => {
  const tournaments = dataStore.get<any[]>(FILES.TOURNAMENTS);
  res.json(tournaments);
});

router.get('/active', (_req, res) => {
  const tournaments = dataStore.get<any[]>(FILES.TOURNAMENTS);
  res.json(tournaments.filter(t => t.status === 'active' || t.status === 'upcoming'));
});

router.get('/:id', (req, res) => {
  const tournaments = dataStore.get<any[]>(FILES.TOURNAMENTS);
  const tournament = tournaments.find(t => t.id === Number(req.params.id));
  if (!tournament) {
    res.status(404).json({ error: 'Турнир не найден' });
    return;
  }
  res.json(tournament);
});

router.post('/:id/join', authMiddleware, (req: AuthRequest, res) => {
  const tournamentId = Number(req.params.id);
  const tournaments = dataStore.get<any[]>(FILES.TOURNAMENTS);
  const tournament = tournaments.find(t => t.id === tournamentId);

  if (!tournament) {
    res.status(404).json({ error: 'Турнир не найден' });
    return;
  }
  if (tournament.participants.includes(req.userId)) {
    res.status(400).json({ error: 'Вы уже участвуете' });
    return;
  }

  const user = req.user;
  const fee = tournament.entryFee;
  if (fee.amount > 0) {
    const field = fee.currency === 'gold' ? 'gold' : 'silver';
    if (user[field] < fee.amount) {
      res.status(400).json({ error: `Недостаточно ${fee.currency === 'gold' ? 'золота' : 'серебра'}` });
      return;
    }
    dataStore.update<any[]>(FILES.USERS, users =>
      users.map(u => u.id === req.userId ? { ...u, [field]: u[field] - fee.amount } : u)
    );
  }

  dataStore.update<any[]>(FILES.TOURNAMENTS, ts =>
    ts.map(t => t.id === tournamentId ? { ...t, participants: [...t.participants, req.userId] } : t)
  );

  res.json({ success: true });
});

export default router;
