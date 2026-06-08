import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { MatchGateway } from './match.gateway';
import { MESSAGES } from '../constants/messages';

export function setupWebSocket(server: HttpServer): void {
  const wss = new WebSocketServer({ server, path: '/ws' });

  const matchGateway = new MatchGateway();

  wss.on('connection', (ws: WebSocket) => {
    matchGateway.handleConnection(ws);
  });

  console.log(MESSAGES.server.wsStarted(process.env.PORT || 3001));
}
