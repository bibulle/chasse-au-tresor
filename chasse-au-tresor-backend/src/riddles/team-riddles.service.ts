import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Riddle } from './schemas/riddle.schema';
import { TeamRiddle } from './schemas/team-riddle.schema';

@Injectable()
export class TeamRiddlesService {
  readonly logger = new Logger(TeamRiddlesService.name);

  constructor(
    @InjectModel(TeamRiddle.name)
    private readonly teamRiddleModel: Model<TeamRiddle>,
    @InjectModel(Riddle.name)
    private readonly riddleModel: Model<Riddle>,
  ) {}

  async getTeamRiddles(teamId: string): Promise<TeamRiddle[]> {
    // 1. Trouver les énigmes associées à l'équipe
    const teamRiddles = await this.teamRiddleModel
      .find({ team: new Types.ObjectId(teamId) })
      .sort({ order: 1 }) // Trier par ordre croissant
      .populate('riddle') // Charger les détails de l'énigme
      .populate({ path: 'solutions', model: 'Solution', populate: 'player' })
      .populate({ path: 'hints', model: 'Hint' })
      .exec();

    if (!teamRiddles) {
      this.logger.log(`No current riddle found for team "${teamId}".`);
      return [];
    }

    // 2. Retourner l'énigme courante
    return teamRiddles as unknown as TeamRiddle[];
  }

  async getCurrentTeamRiddle(teamId: string): Promise<TeamRiddle> {
    const teamRiddle = await this.teamRiddleModel.aggregate([
      {
        $lookup: {
          from: 'riddles', // Nom de la collection Riddle
          localField: 'riddle', // Champ dans TeamRiddle
          foreignField: '_id', // Champ correspondant dans Riddle
          as: 'riddle',
        },
      },
      {
        $unwind: '$riddle', // Décompose riddleData en documents individuels
      },
      {
        $match: {
          team: new Types.ObjectId(teamId),
          resolved: false,
          $or: [
            { 'riddle.optional': false }, // `optional` est false
            { 'riddle.optional': { $exists: false } }, // `optional` n'est pas défini
          ],
        },
      },
      {
        $sort: { order: 1 }, // Tri par ordre croissant
      },
      {
        $limit: 1, // Limiter à un résultat
      },
    ]);

    if (!teamRiddle || teamRiddle.length == 0 || !teamRiddle[0].riddle) {
      this.logger.log(`No current riddle found for team "${teamId}".`);
      return null;
    }

    // console.log(teamRiddle);

    // 2. Retourner l'énigme courante
    return teamRiddle[0] as unknown as TeamRiddle;
  }

  async getFinishedTeamRiddles(teamId: string): Promise<TeamRiddle[]> {
    // 1. Trouver les énigmes associées à l'équipe
    const teamRiddles = await this.teamRiddleModel
      .find({ team: new Types.ObjectId(teamId), resolved: true }) // Résolue
      .sort({ order: 1 }) // Trier par ordre croissant
      .populate('riddle') // Charger les détails de l'énigme
      .populate({ path: 'solutions', model: 'Solution', populate: 'player' }) // Charger les détails de l'énigme
      .exec();

    if (!teamRiddles) {
      this.logger.log(`No finished riddle found for team "${teamId}".`);
      return [];
    }

    // 2. Retourner l'énigme courante
    return teamRiddles;
  }

  async getOptionalTeamRiddles(teamId: string): Promise<TeamRiddle[]> {
    // 1. Trouver les énigmes associées à l'équipe
    let teamRiddles = await this.teamRiddleModel
      .find({
        team: new Types.ObjectId(teamId),
        resolved: false,
      })
      .sort({ order: -1 }) // Trier par ordre croissant
      .populate({
        path: 'riddle',
        match: { optional: true },
      }) // Charger les détails de l'énigme
      // .populate({ path: 'solutions', model: 'Solution', populate: 'player' }) // Charger les détails de l'énigme
      .exec();

    teamRiddles = teamRiddles.filter((teamRiddle) => teamRiddle.riddle !== null);

    if (!teamRiddles) {
      this.logger.log(`No optional riddle found for team "${teamId}".`);
      return [];
    }

    // console.log(teamRiddles);

    // 2. Retourner l'énigme courante
    return teamRiddles;
  }
}
