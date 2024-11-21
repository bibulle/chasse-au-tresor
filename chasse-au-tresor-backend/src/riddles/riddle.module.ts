import { Module } from '@nestjs/common';
import { RiddleService } from './riddle.service';
import { RiddleController } from './riddle.controller';
import { Riddle, RiddleSchema } from './schemas/riddle.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Player, PlayerSchema } from 'src/players/schemas/player.schema';
import { TeamRiddle, TeamRiddleSchema } from './schemas/team-riddle.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Riddle.name, schema: RiddleSchema }]),
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    MongooseModule.forFeature([
      { name: TeamRiddle.name, schema: TeamRiddleSchema },
    ]),
    MongooseModule.forFeature([{ name: Riddle.name, schema: RiddleSchema }]),
  ],
  providers: [RiddleService],
  controllers: [RiddleController],
})
export class RiddleModule {}