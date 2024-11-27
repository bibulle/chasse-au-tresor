import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { Player } from 'src/players/schemas/player.schema';
import { SolutionsService } from 'src/solutions/solutions.service';
import { Team } from '../teams/schemas/team.schema';
import { Riddle } from './schemas/riddle.schema';
import { TeamRiddle } from './schemas/team-riddle.schema';
import { TeamRiddlesService } from './team-riddles.service';

@Injectable()
export class RiddleService {
  readonly logger = new Logger(RiddleService.name);

  constructor(
    @InjectModel(Player.name) private readonly playerModel: Model<Player>,
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    @InjectModel(TeamRiddle.name)
    private readonly teamRiddleModel: Model<TeamRiddle>,
    @InjectModel(Riddle.name) private readonly riddleModel: Model<Riddle>,
    private configService: ConfigService,
    private notificationsGateway: NotificationsGateway,
    private solutionsService: SolutionsService,
    private teamRiddlesService: TeamRiddlesService,
  ) {}

  async saveRiddle(
    riddleId: string | undefined,
    gain: number,
    latitude: number,
    longitude: number,
    text: string,
    photo: string,
    photoPath: string,
    teamOrders: { team: Team; order: number }[],
  ) {
    this.logger.log(
      `saveRiddle(${riddleId}, ${gain}, ${latitude}, ${longitude}, ${text}, ${photo}, ${photoPath}, ${teamOrders?.length})`,
    );

    // Validation du chemin de la photo
    if (photoPath && photoPath !== 'null') {
      photo = this.validatePhotoPath(photoPath);
    }
    if (photo === 'null') {
      photo = undefined;
    }

    if (!riddleId) {
      // Créer la riddle
      const riddle = new this.riddleModel({
        gain: gain,
        latitude: latitude,
        longitude: longitude,
        text: text,
        photo: photo,
      });

      // Sauvegarder la solution
      const newRiddle = await riddle.save();
      riddleId = newRiddle._id.toString();
      this.notificationsGateway.notifyRiddleUpdate('');
    } else {
      // récupérer la riddle a modifier
      const oldRiddle = await this.riddleModel.findOne({
        _id: new Types.ObjectId(riddleId),
      });
      if (!oldRiddle) {
        throw new NotFoundException(`Riddle not found`);
      }

      oldRiddle.gain = gain;
      oldRiddle.latitude = latitude;
      oldRiddle.longitude = longitude;
      oldRiddle.text = text;
      oldRiddle.photo = photo;

      await oldRiddle.save();
    }

    // search for teams using this riddle
    const oldTeamRiddles = await this.teamRiddleModel.find({
      riddle: new Types.ObjectId(riddleId),
    });

    teamOrders.forEach(async (to) => {
      // console.log(`--- ${to.team.name} --- ${to.order}`);

      const oldTeamRiddle = oldTeamRiddles.find((tr) => tr.team.toString() === to.team._id);

      // console.log(`oldTeamRiddle : ${oldTeamRiddle?._id}`);
      if (!oldTeamRiddle && to.order != 0) {
        // we need to create a new one
        const newTeamRiddle = new this.teamRiddleModel({
          team: new Types.ObjectId(to.team._id.toString()),
          riddle: new Types.ObjectId(riddleId),
          order: to.order,
          resolved: false,
          solutions: [],
        });
        // console.log(` -> save a new team riddle`);
        await newTeamRiddle.save();
      } else if (oldTeamRiddle) {
        // we need to modify/remove the old one
        // console.log(oldTeamRiddle);
        if (to.order === 0) {
          // console.log(` -> remove a team riddle`);
          await oldTeamRiddle.deleteOne();
        } else {
          // console.log(` -> update a team riddle`);
          oldTeamRiddle.order = to.order;
          await oldTeamRiddle.save();
        }
      } else {
        // console.log(` -> do nothing`);
      }

      // reorder the team riddles
      const teamRiddles = await this.teamRiddleModel.find({
        team: new Types.ObjectId(to.team._id as string),
      });
      teamRiddles
        .sort((tr1, tr2) => {
          if (tr1.order != tr2.order) {
            return tr1.order - tr2.order;
          } else {
            if (tr1.riddle.toString() === riddleId) {
              return 1;
            } else if (tr2.riddle.toString() === riddleId) {
              return -1;
            } else {
              return 1;
            }
          }
        })
        .forEach((tr, index) => {
          if (tr.order != index + 1) {
            // console.log(` change ${tr.order} != ${index + 1}`);
            tr.order = index + 1;
            tr.save();
          }
        });
      this.notificationsGateway.notifyRiddleUpdate(to.team._id.toString());
    });

    await this.solutionsService.removeOrphanSolutions();

    this.notificationsGateway.notifyRiddleUpdate('');
  }

  async deleteRiddle(riddleId: string): Promise<void> {
    // get list of teams
    const teamsId = await this.teamRiddleModel.distinct('team', {
      riddle: new Types.ObjectId(riddleId),
    });

    console.log(teamsId);

    let deleteResult = await this.riddleModel.deleteMany({
      _id: new Types.ObjectId(riddleId),
    });

    this.logger.log(`${deleteResult.deletedCount} riddle deleted`);

    if (deleteResult.deletedCount === 0) {
      throw new NotFoundException('Énigme non trouvée');
    }

    deleteResult = await this.teamRiddleModel.deleteMany({
      riddle: new Types.ObjectId(riddleId),
    });
    this.logger.log(`${deleteResult.deletedCount} team riddle deleted`);

    this.notificationsGateway.notifyRiddleUpdate('');
    teamsId.forEach((tId) => {
      this.notificationsGateway.notifyRiddleUpdate(tId.toString());
    });

    return;
  }

  async getTeams(riddleId: string): Promise<{ team: Team; order: number }[]> {
    // get list des teams
    const teams = await this.teamModel.find();

    // get Teams riddle for this riddle
    const teamRiddles = await this.teamRiddleModel.find({
      riddle: new Types.ObjectId(riddleId),
    });

    const result = teams.map((team) => {
      const tr = teamRiddles.find((tr) => {
        return '' + tr.team === '' + team._id;
      });

      return { team: team, order: tr ? tr.order : 0 };
    });
    return result;
  }

  async getUnassignedRiddles(): Promise<Riddle[]> {
    // Étape 1 : Obtenez tous les riddleId dans TeamRiddle
    const referencedRiddleIds = await this.teamRiddleModel.distinct('riddle');

    // Étape 2 : Requête pour récupérer les Riddles non référencés
    const unreferencedRiddles = await this.riddleModel.find({
      _id: { $nin: referencedRiddleIds },
    });

    return unreferencedRiddles;
  }

  async getCurrentRiddle(username: string): Promise<Riddle> {
    // 1. Trouver le joueur par username
    const player = await this.playerModel.findOne({ username }).exec();
    if (!player) {
      throw new NotFoundException(`Player with username "${username}" not found.`);
    }

    // 2. Trouver les énigmes associées à l'équipe du joueur
    const teamRiddle = await this.teamRiddleModel
      .findOne({ team: player.team, resolved: false }) // Non résolue
      .sort({ order: 1 }) // Trier par ordre croissant
      .populate('riddle') // Charger les détails de l'énigme
      .exec();

    if (!teamRiddle || !teamRiddle.riddle) {
      throw new NotFoundException(`No current riddle found for player "${username}".`);
    }

    // 3. Retourner l'énigme courante
    return teamRiddle.riddle as unknown as Riddle;
  }

  private validatePhotoPath(photoPath: string): string {
    const basePath = this.configService.get<string>('BASE_PATH');
    if (!basePath) {
      throw new Error('BASE_PATH non défini dans la configuration');
    }

    const r = new RegExp(`^${basePath}`);
    if (!photoPath.match(r)) {
      throw new BadRequestException(`Chemin photo invalide : ${photoPath}`);
    }

    // Supprime le préfixe BASE_PATH du chemin
    return photoPath.replace(r, '');
  }
}
