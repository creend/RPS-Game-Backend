import {
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { v4 as uuid } from 'uuid';
import { isPlayerWinner } from '../utils/isPlayerWinner';
import { Socket } from 'socket.io';
import { CreateGameResponse } from 'src/types/responses/create-game-response';
import { JoinGameRequest } from 'src/types/requests/join-game-request';
import { Game } from 'src/types/game';
import { PickRequest } from 'src/types/requests/pick-request';
import { GameAgainRequest } from 'src/types/requests/game-again-request';
import { GameAgainAccept } from 'src/types/requests/game-again-accept';

interface Games {
  [gameId: string]: Game;
}

interface Clients {
  [clientId: string]: Socket;
}

@WebSocketGateway({ namespace: 'game', cors: true })
export class GameGateway implements OnGatewayDisconnect {
  private games: Games = {};
  private clients: Clients = {};

  handleDisconnect(client: Socket) {
    const allClients = Object.values(this.clients);
    const allKeysClients = Object.keys(this.clients);
    const index = allClients.indexOf(client);
    if (index === -1) return;
    const key = allKeysClients[index];
    delete this.clients[key];
    for (const game in this.games) {
      const newClients = this.games[game].clients.filter(
        (client) => client.id !== key,
      );
      this.games[game].clients = newClients;
      if (this.games[game].clients.length < 2) {
        this.clients[this.games[game].clients[0].id].emit('gameAborted', {
          message: 'Game has been aborted by your opponent',
        });
        delete this.games[game];
      }
    }
  }

  @SubscribeMessage('create')
  handleCreateGame(client: Socket): WsResponse<CreateGameResponse> {
    const gameId = uuid();
    const game = {
      id: gameId,
      clients: [],
    };
    this.games[gameId] = game;
    return { event: 'create', data: game };
  }


  @SubscribeMessage('join')
  handleJoinGame(client: Socket, { clientId, gameId }: JoinGameRequest): void {
    this.clients[clientId] = client;

    if (!this.games[gameId]) {
      this.clients[clientId].emit('joinError', {
        message: `Game with code ${gameId} doesn't exist`,
      });
      return;
    }

    console.log(this.games[gameId].clients.length);
    if (this.games[gameId].clients.length > 2) {
      this.clients[clientId].emit('joinError', {
        message: 'There are 2 players already in game',
      });
      return;
    }

    this.games[gameId] = {
      id: gameId,
      clients: [
        ...this.games[gameId].clients,
        { id: clientId, pick: null, score: 0 },
      ],
    };
    this.games[gameId].clients.forEach((client) => {
      this.clients[client.id]?.emit('join', this.games[gameId]);
    });
  }

  @SubscribeMessage('pick')
  handlePick(client: Socket, { clientId, gameId, pick }: PickRequest): void {
    const clients = this.games[gameId].clients.map((client) => {
      if (client.id === clientId) {
        return {
          ...client,
          pick,
        };
      } else {
        return client;
      }
    });
    if (clients[0]?.pick && clients[1]?.pick) {
      const firstPlayerWon = isPlayerWinner(clients[0].pick, clients[1].pick);
      if (firstPlayerWon === 'draw') {
      } else if (firstPlayerWon) {
        clients[0].score++;
      } else {
        clients[1].score++;
      }
    }
    this.games[gameId].clients = clients;
    clients.forEach((client) => {
      this.clients[client.id]?.emit('pick', this.games[gameId]);
    });
  }

  @SubscribeMessage('againRequest')
  handleGameAgainRequest(
    client: Socket,
    { clientId, gameId }: GameAgainRequest,
  ): void {
    const receiver = this.games[gameId].clients.find(
      (client) => client.id !== clientId,
    );
    this.clients[receiver.id].emit('againRequest');
  }

  @SubscribeMessage('againAccept')
  handleGameAgainAccept(client: Socket, { gameId }: GameAgainAccept): void {
    this.games[gameId].clients.forEach((client) => {
      client.pick = null;
      this.clients[client.id].emit('againAccept');
    });
  }
}
