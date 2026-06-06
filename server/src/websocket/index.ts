import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { MatchGateway } from './match.gateway';

export function setupWebSocket(server: HttpServer): void {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  const matchGateway = new MatchGateway();

  wss.on('connection', (ws: WebSocket) => {
    matchGateway.handleConnection(ws);
  });

  console.log('[WebSocket] Сервер матчмейкинга инициализирован');
}
