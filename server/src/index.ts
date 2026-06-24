import http from 'http';
import app from './app';
import { setupWebSocket } from './websocket'; 
import { bot, startBot } from './bot';
import { MESSAGES } from './constants/messages';
import { connectDB, client, carsCol } from './core/database';
import { logger } from './core/logger';
import { runSeed } from './seed';

const PORT = process.env.PORT || 3001;

// Webhook endpoint for Telegram bot
app.post('/webhook/telegram', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

const server = http.createServer(app);

setupWebSocket(server);

async function bootstrap() {
  while (true) {
    try {
      await connectDB();
      
      const carCount = await carsCol.countDocuments();
      if (carCount === 0) {
        logger.info('[Server] Database is empty. Running automatic seed...');
        await runSeed(false);
      }
      
      startBot();
      
      server.listen(PORT, () => {
        logger.info(MESSAGES.server.apiStarted(PORT));
        logger.info(MESSAGES.server.wsStarted(PORT));
      });
      break;
    } catch (error) {
      logger.error({ err: error }, '[Server] Failed to connect to MongoDB, retrying in 5s...');
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

bootstrap();

async function shutdown(signal: string) {
  console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
  
  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    
    try {
      if (client) await client.close();
      const { mongoMemoryServer } = await import('./core/database');
      if (mongoMemoryServer) await mongoMemoryServer.stop();
      console.log('[Server] MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('[Server] Error during MongoDB disconnection:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('[Server] Forceful shutdown due to timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught Exception:', error);
});
