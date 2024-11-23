import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Player } from './schemas/player.schema';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { TeamsService } from 'src/teams/teams.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<Player>,
    private positionsGateway: NotificationsGateway,
    private teamsService: TeamsService,
    private authService: AuthService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createPlayer(username: string): Promise<Player> {
    const player = new this.playerModel({ username });

    const newPlayer = await player.save();

    // Notifier via WebSocket que le joueur a été mis à jour
    this.notificationsGateway.notifyPlayerUpdate(username);

    return newPlayer;
  }

  async isUsernameUnique(username: string): Promise<boolean> {
    const player = await this.playerModel.findOne({ username }).exec();
    return !player; // Retourne `true` si le nom est unique
  }

  async findById(playerId: string): Promise<Player> {
    const player = await this.playerModel
      .findOne({ _id: playerId })
      .populate({ path: 'team', model: 'Team' })
      .exec();

    // if (!player) throw new Error('Player not found');
    return player;
  }

  async findByName(username: string): Promise<Player> {
    const player = await this.playerModel
      .findOne({ username })
      .populate({ path: 'team', model: 'Team' })
      .exec();

    // if (!player) throw new Error('Player not found');
    return player;
  }
  async getPlayerByName(username: string): Promise<Player> {
    const player = await this.playerModel
      .findOne({ username })
      .populate({ path: 'team', model: 'Team' })
      .exec();

    //if player, add if it's an admin
    if (player) {
      if (this.authService.isAdmin(username)) {
        player.isAdmin = true;
      } else {
        player.isAdmin = undefined;
      }
    }

    return player;
  }

  async getAllPlayers(): Promise<Player[]> {
    const players = await this.playerModel
      .find()
      .populate({ path: 'team', model: 'Team' })
      .exec();

    // reassign plyaer to team
    const teams = await this.teamsService.getAllTeams();
    players.forEach((player) => {
      // console.log(player);
      const team = teams.find(({ players }) =>
        players.some((p) => {
          // console.log(p._id, ' ', p._id.toString() === player._id.toString());
          return p._id.toString() === player._id.toString();
        }),
      );

      if (team && '' + player.team?._id !== '' + team._id) {
        player.team = new Types.ObjectId('' + team._id);
        player.save();
        console.log(player.username, ' -> ', team.name);
      }
    });

    return players;
  }

  async updatePosition(
    playerId: string,
    position: { latitude: number; longitude: number },
  ) {
    const updatedPlayer = await this.playerModel
      .findByIdAndUpdate(
        playerId,
        { latitude: position.latitude, longitude: position.longitude },
        { new: true },
      )
      .exec();

    // Diffusez la position mise à jour
    this.positionsGateway.server.emit('positionUpdated', {
      playerId,
      latitude: updatedPlayer.latitude,
      longitude: updatedPlayer.longitude,
    });

    return updatedPlayer;
  }
}
