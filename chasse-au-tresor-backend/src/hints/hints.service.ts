import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Hint } from './schemas/hint.schema';
import { Model, Types } from 'mongoose';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { TeamRiddle } from 'src/riddles/schemas/team-riddle.schema';

@Injectable()
export class HintsService {
  constructor(
    @InjectModel(Hint.name) private readonly hintModel: Model<Hint>,
    @InjectModel(TeamRiddle.name) private readonly teamRiddleModel: Model<TeamRiddle>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async purchaseHint(hintId: string): Promise<void> {
    if (!hintId) {
      throw new BadRequestException("Pas d'indice");
    }

    const hint = await this.hintModel.findById(hintId).exec();
    if (!hint) {
      throw new NotFoundException('Indice non trouvé');
    }
    const teamRiddle = await this.teamRiddleModel.findOne({ hints: new Types.ObjectId(hintId) }).exec();
    if (!teamRiddle) {
      throw new NotFoundException('Team-riddle non trouvé');
    }

    hint.isPurchased = true;
    await hint.save();

    this.notificationsGateway.notifyRiddleUpdate(teamRiddle.team.toString());
  }
}
