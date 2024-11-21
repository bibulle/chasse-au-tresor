import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Riddle } from './schemas/riddle.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player } from 'src/players/schemas/player.schema';
import { TeamRiddle } from './schemas/team-riddle.schema';

@Injectable()
export class RiddleService {
  readonly logger = new Logger(RiddleService.name);

  constructor(
    @InjectModel(Player.name) private readonly playerModel: Model<Player>,
    @InjectModel(TeamRiddle.name)
    private readonly teamRiddleModel: Model<TeamRiddle>,
    @InjectModel(Riddle.name) private readonly riddleModel: Model<Riddle>,
  ) {}

  async getCurrentRiddle(username: string): Promise<Riddle> {
    // 1. Trouver le joueur par username
    const player = await this.playerModel.findOne({ username }).exec();
    if (!player) {
      throw new NotFoundException(
        `Player with username "${username}" not found.`,
      );
    }

    // 2. Trouver les énigmes associées à l'équipe du joueur
    const teamRiddle = await this.teamRiddleModel
      .findOne({ team: player.team, resolved: false }) // Non résolue
      .sort({ order: 1 }) // Trier par ordre croissant
      .populate('riddle') // Charger les détails de l'énigme
      .exec();

    if (!teamRiddle || !teamRiddle.riddle) {
      throw new NotFoundException(
        `No current riddle found for player "${username}".`,
      );
    }

    // 3. Retourner l'énigme courante
    return teamRiddle.riddle as unknown as Riddle;
  }
}
