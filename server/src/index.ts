import http from 'http';
import app from './app';
import { setupWebSocket } from './websocket'; 
import { bot } from './bot'; 
import { MESSAGES } from './constants/messages';
import { connectDB, client } from './core/database';
import { logger } from './core/logger';

const PORT = process.env.PORT || 3001;

// Webhook endpoint for Telegram bot
app.post('/webhook/telegram', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

const server = http.createServer(app);

setupWebSocket(server);

async function bootstrap() {
  try {
    await connectDB();
    
    server.listen(PORT, () => {
      logger.info(MESSAGES.server.apiStarted(PORT));
      logger.info(MESSAGES.server.wsStarted(PORT));
    });
  } catch (error) {
    logger.error({ err: error }, '[Server] Failed to connect to MongoDB');
    process.exit(1);
  }
}

bootstrap();

async function shutdown(signal: string) {
  console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
  
  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    
    try {
      await client.close();
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
