import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Autoriser le frontend
  },
})
export class PositionsGateway {
  @WebSocketServer()
  server: Server;

  // Exemple de méthode pour mettre à jour la position
  @SubscribeMessage('updatePosition')
  handleUpdatePosition(
    client: any,
    data: { playerId: string; latitude: number; longitude: number },
  ) {
    // Diffuser les nouvelles positions à tous les clients
    this.server.emit('positionUpdated', data);
  }
}
