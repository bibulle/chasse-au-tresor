import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Solution } from './schemas/solution.schema';

@Injectable()
export class SolutionsService {
  constructor(
    @InjectModel(Solution.name) private solutionModel: Model<Solution>,
  ) {}

  async createSolution(
    playerId: string,
    riddleId: string,
    text: string,
    photoPath: string,
  ): Promise<Solution> {
    // Créer une nouvelle solution
    const solution = new this.solutionModel({
      player: playerId,
      riddle: riddleId,
      text,
      photo: photoPath,
    });
    return solution.save();
  }
}
