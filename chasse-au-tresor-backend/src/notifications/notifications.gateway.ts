import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PlayersService } from 'src/players/players.service';
import { Player } from 'src/players/schemas/player.schema';
import { TeamsService } from 'src/teams/teams.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Autoriser le frontend
  },
})
export class NotificationsGateway {
  private logger = new Logger(NotificationsGateway.name);

  private playersService: PlayersService;
  private teamsService: TeamsService;

  @WebSocketServer()
  server: Server;

  constructor(private moduleRef: ModuleRef) {}

  setPlayersService(playersService: PlayersService) {
    this.playersService = playersService;
  }
  setTeamsService(teamsService: TeamsService) {
    this.teamsService = teamsService;
  }

  // Exemple de méthode pour mettre à jour la position
  @SubscribeMessage('updatePosition')
  async handleUpdatePosition(
    client: any,
    data: { playerId: string; latitude: number; longitude: number },
  ) {
    this.logger.log(
      `handleUpdatePosition(${data.playerId}, ${data.latitude}, ${data.longitude})`,
    );

    // on cherche le joueur pour le mettre a jour
    const player = await this.playersService?.getPlayerByName(data.playerId);
    if (
      player &&
      (player.latitude !== data.latitude || player.longitude !== data.longitude)
    ) {
      player.latitude = data.latitude;
      player.longitude = data.longitude;
      await player.save();
      this.notifyPlayerUpdate(data.playerId);
    }
    // this.logger.log(JSON.stringify(player, null, 2));

    // on recherche tous les joueur de l'équipe
    if (player.team?._id) {
      const team = await this.teamsService?.getTeamById(player.team._id);
      // this.logger.log(JSON.stringify(team, null, 2));
      const payload = [];
      if (team) {
        team.players.forEach((p) => {
          const player = p as unknown as Player;
          payload.push({
            playerId: player.username,
            latitude: player.latitude,
            longitude: player.longitude,
          });
        });
        // Diffuser les nouvelles positions à tous les clients de la meme equipe
        this.server.emit('positionUpdated', payload);
      }
    }
  }

  // Méthode pour envoyer une notification à tous les clients
  sendNotification(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Émettre une notification lorsqu'un utilisateur est mis à jour
  notifyPlayerUpdate(username: string): void {
    this.server.emit('playerUpdated', { username });
  }

  // Émettre une notification lorsqu'une équipe est mis à jour
  notifyTeamUpdate(teamId: string): void {
    this.server.emit('teamUpdated', { teamId });
  }

  // Émettre une notification lorsqu'une énigme est mis à jour
  notifyRiddleUpdate(teamId: string): void {
    // console.log(`teamId: ${teamId}`);
    this.server.emit('riddleUpdated', { teamId });
  }

  // Utilisation
  // this.notificationsGateway.sendNotification('playerPositionUpdated', updatedPlayer);
}
