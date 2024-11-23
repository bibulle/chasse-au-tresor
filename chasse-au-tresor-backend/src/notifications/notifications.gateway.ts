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
export class NotificationsGateway {
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

  // Méthode pour envoyer une notification à tous les clients
  sendNotification(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Émettre une notification lorsqu'un utilisateur est mis à jour
  notifyPlayerUpdate(username: string): void {
    this.server.emit('playerUpdated', { username });
  }

  // Émettre une notification lorsqu'une énigme est mis à jour
  notifyRiddleUpdate(teamId: string): void {
    // console.log(`teamId: ${teamId}`);
    this.server.emit('riddleUpdated', { teamId });
  }

  // Utilisation
  // this.notificationsGateway.sendNotification('playerPositionUpdated', updatedPlayer);
}
