import { WebSocket } from 'ws';

interface PlayerSession {
  ws: WebSocket;
  userId: number;
  pp: number;
  ready: boolean;
}

interface Room {
  id: string;
  players: PlayerSession[];
  state: 'waiting' | 'countdown' | 'racing' | 'finished';
}

export class MatchGateway {
  private matchQueue: PlayerSession[] = [];
  private rooms: Map<string, Room> = new Map();

  handleConnection(ws: WebSocket) {
    let currentPlayer: PlayerSession | null = null;
    let currentRoom: Room | null = null;

    ws.on('message', (raw: Buffer) => {
      let msg: any; 
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return; 
      }

      switch (msg.type) {
        case 'join_queue':
          currentPlayer = { ws, userId: msg.userId, pp: msg.pp, ready: false };
          currentRoom = this.processJoinQueue(currentPlayer);
          break;
        case 'cancel_queue':
          if (currentPlayer) this.processCancelQueue(currentPlayer);
          currentPlayer = null;
          break;
        case 'ready':
          if (currentRoom && currentPlayer) this.processReady(currentRoom, currentPlayer);
          break;
        case 'shift':
        case 'nos':
        case 'race_update':
          if (currentRoom && currentPlayer) this.broadcastToOpponent(currentRoom, currentPlayer, msg);
          break;
        case 'race_finish':
          if (currentRoom) this.processRaceFinish(currentRoom, msg);
          break;
      }
    });

    ws.on('close', () => {
      this.handleDisconnect(currentPlayer, currentRoom);
    });
  }

  private processJoinQueue(player: PlayerSession): Room | null {
    const opponentIndex = this.matchQueue.findIndex(
      p => Math.abs(p.pp - player.pp) <= 50 && p.userId !== player.userId
    );

    if (opponentIndex >= 0) {
      const opponent = this.matchQueue.splice(opponentIndex, 1)[0];
      const roomId = `room_${Date.now()}`;
      
      const newRoom: Room = { id: roomId, players: [opponent, player], state: 'waiting' };
      this.rooms.set(roomId, newRoom);

      for (const p of newRoom.players) {
        const other = newRoom.players.find(o => o.userId !== p.userId)!;
        p.ws.send(JSON.stringify({
          type: 'match_found',
          roomId,
          opponent: { userId: other.userId, pp: other.pp },
        }));
      }
      return newRoom;
    } else {
      this.matchQueue.push(player);
      player.ws.send(JSON.stringify({ type: 'queue_joined', position: this.matchQueue.length }));
      return null;
    }
  }

  private processCancelQueue(player: PlayerSession) {
    const idx = this.matchQueue.findIndex(p => p.userId === player.userId);
    if (idx >= 0) this.matchQueue.splice(idx, 1);
    player.ws.send(JSON.stringify({ type: 'queue_cancelled' }));
  }

  private processReady(room: Room, player: PlayerSession) {
    player.ready = true;
    if (room.players.every(p => p.ready)) {
      room.state = 'countdown';
      for (const p of room.players) {
        p.ws.send(JSON.stringify({ type: 'countdown_start', countdown: 3 }));
      }
    }
  }

  private broadcastToOpponent(room: Room, sender: PlayerSession, msg: any) {
    for (const p of room.players) {
      if (p.userId !== sender.userId) {
        p.ws.send(JSON.stringify(msg));
      }
    }
  }

  private processRaceFinish(room: Room, msg: any) {
    for (const p of room.players) {
      p.ws.send(JSON.stringify({
        type: 'race_result',
        userId: msg.userId,
        time: msg.time,
        shifts: msg.shifts,
      }));
    }
    room.state = 'finished';
  }

  private handleDisconnect(player: PlayerSession | null, room: Room | null) {
    if (player) {
      const idx = this.matchQueue.findIndex(p => p.userId === player.userId);
      if (idx >= 0) this.matchQueue.splice(idx, 1);
    }
    
    if (room) {
      for (const p of room.players) {
        if (player && p.userId !== player.userId) {
          p.ws.send(JSON.stringify({ type: 'opponent_disconnected' }));
        }
      }
      this.rooms.delete(room.id);
    }
  }
}
