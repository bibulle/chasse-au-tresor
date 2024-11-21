import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Team } from './schemas/team.schema';
import { Player } from 'src/players/schemas/player.schema';

@Injectable()
export class TeamsService implements OnModuleInit {
  readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectModel(Team.name) private teamModel: Model<Team>,
    @InjectModel(Player.name) private playerModel: Model<Player>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.initializeTeams();
  }

  // Initialiser les temas
  private async initializeTeams() {
    const teamsData = this.configService.get<string>('TEAMS');
    if (!teamsData) {
      this.logger.error('No teams data found');
      return;
    }
    const teams = JSON.parse(teamsData); // Parse JSON string

    for (const team of teams) {
      const teamExists = await this.teamModel.exists({
        name: team.name,
      });
      if (!teamExists) {
        const newTeam = new this.teamModel(team);
        await newTeam.save();
        this.logger.log(`Team créé : ${team.name}`);
      } else {
        this.logger.log(`Team déjà existant : ${team.name}`);
      }
    }
  }

  async createTeam(username: string): Promise<Team> {
    const team = new this.teamModel({ username, players: [], score: 0 });
    return team.save();
  }

  async removePlayerFromTeam(teamId: string, playerId: string): Promise<Team> {
    // this.logger.log(`removePlayerFromTeam(${teamId}, ${playerId})`);

    const currentTeam = await this.teamModel.findOne({ players: playerId });
    const currentPlayer = await this.playerModel.findOne({ _id: playerId });

    if (currentTeam) {
      currentTeam.players = currentTeam.players.filter(
        (player) => player.toString() !== playerId,
      );
      await currentTeam.save();
      console.log(
        `Le joueur ${playerId} a été retiré de l'équipe ${currentTeam.name}`,
      );
    }

    if (currentPlayer) {
      currentPlayer.team = null;
      await currentPlayer.save();
      console.log(`Le joueur ${playerId} n'est plus dans une équipe`);
    }

    return currentTeam;
  }

  async addPlayerToTeam(teamId: string, playerId: string): Promise<Team> {
    // this.logger.log(`addPlayerToTeam(${teamId}, ${playerId})`);

    // Vérifiez si le joueur est déjà dans une équipe
    const currentTeam = await this.teamModel.findOne({ players: playerId });
    const currentPlayer = await this.playerModel.findOne({ _id: playerId });

    if (currentTeam) {
      // Retirer le joueur de l'équipe actuelle
      currentTeam.players = currentTeam.players.filter(
        (player) => player.toString() !== playerId,
      );
      await currentTeam.save();
      console.log(
        `Le joueur ${playerId} a été retiré de l'équipe ${currentTeam.name}`,
      );
    }

    // Ajouter le joueur à la nouvelle équipe
    const newTeam = await this.teamModel.findById(teamId);
    if (!newTeam) {
      throw new Error('Équipe introuvable');
    }

    if (!newTeam.players.includes(playerId as unknown as Types.ObjectId)) {
      newTeam.players.push(playerId as unknown as Types.ObjectId);
      await newTeam.save();
      console.log(
        `Le joueur ${playerId} a été ajouté à l'équipe ${newTeam.name}`,
      );
      currentPlayer.team = new Types.ObjectId('' + newTeam._id);
      await currentPlayer.save();
    }

    return newTeam;
  }

  async getAllTeams(): Promise<Team[]> {
    const teams = await this.teamModel
      .find()
      .populate({ path: 'players', model: 'Player' })
      .exec(); // Inclure les joueurs
    // console.log(teams);
    return teams;
  }
}
