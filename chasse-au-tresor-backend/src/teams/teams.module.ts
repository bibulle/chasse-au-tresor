import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Team, TeamSchema } from './schemas/team.schema';
import { ConfigModule } from '@nestjs/config';
import { Player, PlayerSchema } from 'src/players/schemas/player.schema';
import {
  TeamRiddle,
  TeamRiddleSchema,
} from 'src/riddles/schemas/team-riddle.schema';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    MongooseModule.forFeature([
      { name: TeamRiddle.name, schema: TeamRiddleSchema },
    ]),
    ConfigModule,
    NotificationsModule,
  ],
  providers: [TeamsService],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
