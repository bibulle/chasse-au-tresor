import { Injectable } from '@nestjs/common';
import { Riddle } from './schemas/riddle.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RiddleService {
  constructor(@InjectModel(Riddle.name) private riddleModel: Model<Riddle>) {}

  async getCurrentRiddle(username: string): Promise<Riddle> {
    const player = await this.riddleModel
      .findOne({ username })
      .populate({ path: 'team', model: 'Team' })
      .exec();
    // if (!player) throw new Error('Player not found');
    return player;
  }
}
