import { Socket } from 'socket.io';

export type Client = {
  socket: Socket;
  id: string;
};
