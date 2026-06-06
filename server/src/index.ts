import http from 'http';
import app from './app';
import { setupWebSocket } from './websocket'; 

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

setupWebSocket(server);

server.listen(PORT, () => {
  console.log(`[Server] Drag Racing API успешно запущен на http://localhost:${PORT}`);
  console.log(`[Server] WebSocket шлюз ожидает подключений на ws://localhost:${PORT}/ws`);
});
