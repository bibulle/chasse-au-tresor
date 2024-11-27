import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Player, PlayerSchema } from 'src/players/schemas/player.schema';
import { Riddle, RiddleSchema } from 'src/riddles/schemas/riddle.schema';
import { TeamRiddle, TeamRiddleSchema } from 'src/riddles/schemas/team-riddle.schema';
import { Solution, SolutionSchema } from 'src/solutions/schemas/solution.schema';
import { Team, TeamSchema } from 'src/teams/schemas/team.schema';
import { Hint, HintSchema } from 'src/hints/schemas/hint.schema';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: Player.name, schema: PlayerSchema },
      { name: Riddle.name, schema: RiddleSchema },
      { name: Hint.name, schema: HintSchema },
      { name: TeamRiddle.name, schema: TeamRiddleSchema },
      { name: Solution.name, schema: SolutionSchema },
    ]),
  ],
})
export class FilesModule {}
