import http from 'http';
import app from './app';
import { setupWebSocket } from './websocket'; 
import { bot } from './bot'; 
import { MESSAGES } from './constants/messages';
import { connectDB } from './core/database';

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
      console.log(MESSAGES.server.apiStarted(PORT));
      console.log(MESSAGES.server.wsStarted(PORT));
    });
  } catch (error) {
    console.error('[Server] Failed to connect to MongoDB', error);
    process.exit(1);
  }
}

bootstrap();
