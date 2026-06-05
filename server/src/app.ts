import express from 'express';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth';
import carsRoutes from './routes/cars';
import garageRoutes from './routes/garage';
import racesRoutes from './routes/races';
import campaignRoutes from './routes/campaign';
import clansRoutes from './routes/clans';
import tournamentsRoutes from './routes/tournaments';
import shopRoutes from './routes/shop';
import profileRoutes from './routes/profile';
import notificationsRoutes from './routes/notifications';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/garage', garageRoutes);
app.use('/api/races', racesRoutes);
app.use('/api/campaign', campaignRoutes);
app.use('/api/clans', clansRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationsRoutes);

const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

export default app;
