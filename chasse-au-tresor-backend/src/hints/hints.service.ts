import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { TeamRiddle } from 'src/riddles/schemas/team-riddle.schema';
import { Hint } from './schemas/hint.schema';

@Injectable()
export class HintsService {
  private logger = new Logger(HintsService.name);
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

  async deleteHint(hintId: string): Promise<void> {
    const oldHint = await this.hintModel.findById(hintId);
    if (!oldHint) {
      throw new NotFoundException('Indice non trouvé');
    }

    const teamRiddle = await this.teamRiddleModel
      .findOne({ hints: new Types.ObjectId(hintId) })
      .populate({ path: 'hints', model: 'Hint' });
    if (!teamRiddle) {
      throw new NotFoundException('Team-riddle non trouvé');
    }
    await oldHint.deleteOne();

    teamRiddle.hints = teamRiddle.hints.filter((hint: any) => '' + hint._id !== hintId);
    await teamRiddle.save();

    // reorder hints
    await this.removeOrphanHints();
    await this.reorderHints(teamRiddle, hintId);

    this.notificationsGateway.notifyRiddleUpdate(teamRiddle.team.toString());
  }

  async saveHint(hint: Hint, teamRiddleId: string): Promise<Hint> {
    let teamRiddle = await this.teamRiddleModel.findById(teamRiddleId);
    if (!teamRiddle) {
      throw new NotFoundException('Team-riddle non trouvé');
    }

    if (hint._id !== '') {
      const oldHint = await this.hintModel.findById(hint._id);
      if (!oldHint) {
        throw new NotFoundException('Indice non trouvé');
      }

      oldHint.description = hint.description;
      oldHint.cost = hint.cost;
      oldHint.isPurchased = hint.isPurchased;
      oldHint.order = hint.order;

      const newHint = await oldHint.save();

      teamRiddle = await this.teamRiddleModel.findById(teamRiddleId).populate({ path: 'hints', model: 'Hint' });
      await this.removeOrphanHints();
      await this.reorderHints(teamRiddle, newHint._id.toString());

      this.notificationsGateway.notifyRiddleUpdate(teamRiddle.team.toString());

      return newHint;
    } else {
      const newHint: Hint = await new this.hintModel({
        description: hint.description,
        cost: hint.cost,
        isPurchased: hint.isPurchased,
        order: hint.order,
      }).save();

      teamRiddle.hints.push(newHint._id as Types.ObjectId);
      teamRiddle = await teamRiddle.save();

      teamRiddle = await this.teamRiddleModel.findById(teamRiddleId).populate({ path: 'hints', model: 'Hint' });
      await this.removeOrphanHints();
      await this.reorderHints(teamRiddle, newHint._id.toString());

      this.notificationsGateway.notifyRiddleUpdate(teamRiddle.team.toString());

      return newHint;
    }
  }

  async reorderHints(teamRiddle: TeamRiddle, hintId: string) {
    teamRiddle.hints = teamRiddle.hints.sort((a1: any, a2: any) => {
      const h1 = a1 as Hint;
      const h2 = a2 as Hint;

      if (h1.order != h2.order) {
        return h1.order - h2.order;
      }
      if (h1._id.toString() === hintId) {
        return -1;
      }
      if (h2._id.toString() === hintId) {
        return 1;
      }
      return 1;
    });

    teamRiddle.hints.forEach(async (a: any, index: number) => {
      const hint = a as Hint;
      if (hint.order != index + 1) {
        hint.order = index + 1;
        await hint.save();
      }
    });
    await teamRiddle.save();
  }

  async removeOrphanHints(): Promise<number> {
    // Step 1: Find all hint IDs referenced in TeamRiddle
    const referencedHints = await this.teamRiddleModel.distinct('hints');

    // Step 2: Find orphan hint (not in referencedSolutions)
    const orphanHints = await this.hintModel.find({
      _id: { $nin: referencedHints },
    });

    // Step 3: Delete orphan hints
    const deleteResult = await this.hintModel.deleteMany({
      _id: { $in: orphanHints.map((sol) => sol._id) },
    });

    // Return the number of deleted solutions
    return deleteResult.deletedCount;
  }
}
