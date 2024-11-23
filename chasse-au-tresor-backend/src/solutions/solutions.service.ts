import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Player } from 'src/players/schemas/player.schema';
import { TeamRiddle } from 'src/riddles/schemas/team-riddle.schema';
import { Solution } from './schemas/solution.schema';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

@Injectable()
export class SolutionsService {
  private readonly logger = new Logger(SolutionsService.name);

  constructor(
    @InjectModel(Solution.name) private readonly solutionModel: Model<Solution>,
    @InjectModel(TeamRiddle.name)
    private readonly teamRiddleModel: Model<TeamRiddle>,
    @InjectModel(Player.name) private readonly playerModel: Model<Player>,
    private readonly configService: ConfigService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createSolution(
    playerId: string,
    riddleId: string,
    text: string,
    photoPath: string,
  ): Promise<Solution> {
    // Validation du chemin de la photo
    photoPath = this.validatePhotoPath(photoPath);

    // Vérification du joueur
    const player = await this.playerModel.findById(playerId).exec();
    if (!player) {
      throw new NotFoundException(`Joueur avec l'ID ${playerId} introuvable`);
    }

    // Trouver le TeamRiddle correspondant
    const teamRiddle = await this.teamRiddleModel
      .findOne({ team: player.team, riddle: new Types.ObjectId(riddleId) })
      .exec();
    if (!teamRiddle) {
      throw new NotFoundException(
        `TeamRiddle introuvable pour l'équipe ${player.team} et l'énigme ${riddleId}`,
      );
    }

    // Créer une nouvelle solution
    const solution = new this.solutionModel({
      player: playerId,
      riddle: riddleId,
      text,
      photo: photoPath,
    });

    // Sauvegarder la solution
    const savedSolution = await solution.save();

    // Ajouter la solution au TeamRiddle
    teamRiddle.solutions.push(savedSolution._id as Types.ObjectId);
    await teamRiddle.save();

    // Notifier via WebSocket que l'énigme a été mis à jour
    this.notificationsGateway.notifyRiddleUpdate('' + player.team);

    this.logger.log(`Solution ajoutée à TeamRiddle : ${teamRiddle._id}`);

    return savedSolution;
  }

  async toggleValidated(
    solutionId: string,
    validated: boolean | undefined,
  ): Promise<Solution> {
    // search solution
    let solution = await this.solutionModel.findOne({ _id: solutionId });

    if (!solution) {
      throw new NotFoundException('Solution non trouvée');
    }

    solution.validated = validated;
    solution = await solution.save();

    // recalculate the teamriddle status
    const teamRiddle = await this.teamRiddleModel
      .findOne({
        solutions: new Types.ObjectId(solutionId),
      })
      .populate({ path: 'solutions', model: 'Solution' });
    if (!teamRiddle) {
      throw new NotFoundException('Énigme non trouvée');
    }
    let resolved = false;
    teamRiddle.solutions.forEach((s) => {
      if (s['validated'] === true) {
        resolved = true;
      }
    });
    teamRiddle.resolved = resolved;
    await teamRiddle.save();

    // Notifier via WebSocket que l'énigme a été mis à jour
    this.notificationsGateway.notifyRiddleUpdate('' + teamRiddle.team);

    return solution;
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
