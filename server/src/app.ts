import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import path from 'path';

import authRoutes from './modules/auth/auth.routes';
import carsRoutes from './modules/cars/cars.routes';
import garageRoutes from './modules/garage/garage.routes';
import racesRoutes from './modules/races/races.routes';
import campaignRoutes from './modules/campaign/campaign.routes';
import clansRoutes from './modules/clans/clans.routes';
import tournamentsRoutes from './modules/tournaments/tournaments.routes';
import shopRoutes from './modules/shop/shop.routes';
import profileRoutes from './modules/profile/profile.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import { errorHandler } from './core/middlewares/error.middleware';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP to allow WebApp rendering
}));

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // Limit each IP to 200 requests per `window` (here, per 1 minute)
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true, 
  legacyHeaders: false,
});

app.use(limiter);
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

app.use(errorHandler);

export default app;
