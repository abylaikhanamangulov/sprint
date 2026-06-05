import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

interface Player {
  ws: WebSocket;
  userId: number;
  pp: number;
  ready: boolean;
}

interface Room {
  id: string;
  players: Player[];
  state: 'waiting' | 'countdown' | 'racing' | 'finished';
}

const matchQueue: Player[] = [];
const rooms: Map<string, Room> = new Map();

export function setupWebSocket(server: HttpServer): void {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    let currentPlayer: Player | null = null;
    let currentRoom: Room | null = null;

    ws.on('message', (raw: Buffer) => {
      let msg: any;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      switch (msg.type) {
        case 'join_queue': {
          currentPlayer = { ws, userId: msg.userId, pp: msg.pp, ready: false };
          const opponent = matchQueue.find(p =>
            Math.abs(p.pp - currentPlayer!.pp) <= 50 && p.userId !== currentPlayer!.userId
          );

          if (opponent) {
            matchQueue.splice(matchQueue.indexOf(opponent), 1);
            const roomId = `room_${Date.now()}`;
            currentRoom = { id: roomId, players: [opponent, currentPlayer], state: 'waiting' };
            rooms.set(roomId, currentRoom);

            for (const p of currentRoom.players) {
              const other = currentRoom.players.find(o => o !== p);
              p.ws.send(JSON.stringify({
                type: 'match_found',
                roomId,
                opponent: { userId: other!.userId, pp: other!.pp },
              }));
            }
          } else {
            matchQueue.push(currentPlayer);
            ws.send(JSON.stringify({ type: 'queue_joined', position: matchQueue.length }));
          }
          break;
        }

        case 'cancel_queue': {
          const idx = matchQueue.findIndex(p => p.userId === msg.userId);
          if (idx >= 0) matchQueue.splice(idx, 1);
          ws.send(JSON.stringify({ type: 'queue_cancelled' }));
          break;
        }

        case 'ready': {
          if (!currentRoom) break;
          const player = currentRoom.players.find(p => p.userId === msg.userId);
          if (player) player.ready = true;

          if (currentRoom.players.every(p => p.ready)) {
            currentRoom.state = 'countdown';
            for (const p of currentRoom.players) {
              p.ws.send(JSON.stringify({ type: 'countdown_start', countdown: 3 }));
            }
          }
          break;
        }

        case 'shift':
        case 'nos':
        case 'race_update': {
          if (!currentRoom) break;
          for (const p of currentRoom.players) {
            if (p.userId !== msg.userId) {
              p.ws.send(JSON.stringify(msg));
            }
          }
          break;
        }

        case 'race_finish': {
          if (!currentRoom) break;
          for (const p of currentRoom.players) {
            p.ws.send(JSON.stringify({
              type: 'race_result',
              userId: msg.userId,
              time: msg.time,
              shifts: msg.shifts,
            }));
          }
          currentRoom.state = 'finished';
          break;
        }
      }
    });

    ws.on('close', () => {
      if (currentPlayer) {
        const idx = matchQueue.findIndex(p => p.userId === currentPlayer!.userId);
        if (idx >= 0) matchQueue.splice(idx, 1);
      }
      if (currentRoom) {
        for (const p of currentRoom.players) {
          if (p.userId !== currentPlayer?.userId) {
            p.ws.send(JSON.stringify({ type: 'opponent_disconnected' }));
          }
        }
        rooms.delete(currentRoom.id);
      }
    });
  });
}
