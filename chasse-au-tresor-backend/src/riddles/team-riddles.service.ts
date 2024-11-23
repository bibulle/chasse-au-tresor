import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TeamRiddle } from './schemas/team-riddle.schema';

@Injectable()
export class TeamRiddlesService {
  readonly logger = new Logger(TeamRiddlesService.name);

  constructor(
    @InjectModel(TeamRiddle.name)
    private readonly teamRiddleModel: Model<TeamRiddle>,
  ) {}

  async getTeamRiddles(teamId: string): Promise<TeamRiddle[]> {
    // 1. Trouver les énigmes associées à l'équipe
    const teamRiddles = await this.teamRiddleModel
      .find({ team: new Types.ObjectId(teamId) })
      .sort({ order: 1 }) // Trier par ordre croissant
      .populate('riddle') // Charger les détails de l'énigme
      .populate({ path: 'solutions', model: 'Solution', populate: 'player' }) // Charger les détails de l'énigme
      // .populate({ path: 'solutions', model: 'Solution' }) // Charger les détails de l'énigme
      // .populate({ path: 'solutions.player', model: 'Player' }) // Charger les détails de l'énigme
      .exec();

    if (!teamRiddles) {
      this.logger.log(`No current riddle found for team "${teamId}".`);
      return [];
    }

    // 2. Retourner l'énigme courante
    return teamRiddles as unknown as TeamRiddle[];
  }

  async getCurrentTeamRiddle(teamId: string): Promise<TeamRiddle> {
    // 1. Trouver les énigmes associées à l'équipe
    const teamRiddle = await this.teamRiddleModel
      .findOne({ team: new Types.ObjectId(teamId), resolved: false }) // Non résolue
      .sort({ order: 1 }) // Trier par ordre croissant
      .populate('riddle') // Charger les détails de l'énigme
      .exec();

    if (!teamRiddle || !teamRiddle.riddle) {
      this.logger.log(`No current riddle found for team "${teamId}".`);
      return null;
    }

    // 2. Retourner l'énigme courante
    return teamRiddle as unknown as TeamRiddle;
  }
}
