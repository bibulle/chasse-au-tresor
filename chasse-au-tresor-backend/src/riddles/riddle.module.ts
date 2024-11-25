import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptionsFactory } from 'src/config/multer.config';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Player, PlayerSchema } from 'src/players/schemas/player.schema';
import { RiddleController } from './riddle.controller';
import { RiddleService } from './riddle.service';
import { Riddle, RiddleSchema } from './schemas/riddle.schema';
import { TeamRiddle, TeamRiddleSchema } from './schemas/team-riddle.schema';
import { TeamRiddlesController } from './team-riddles.controller';
import { TeamRiddlesService } from './team-riddles.service';
import { Team, TeamSchema } from 'src/teams/schemas/team.schema';
import { SolutionsModule } from 'src/solutions/solutions.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Riddle.name, schema: RiddleSchema }]),
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    MongooseModule.forFeature([
      { name: TeamRiddle.name, schema: TeamRiddleSchema },
    ]),
    MongooseModule.forFeature([{ name: Riddle.name, schema: RiddleSchema }]),
    MulterModule.registerAsync({
      imports: [ConfigModule], // Permet l'accès à ConfigService
      useFactory: multerOptionsFactory,
      inject: [ConfigService],
    }),
    ConfigModule,
    NotificationsModule,
    SolutionsModule,
  ],
  providers: [RiddleService, TeamRiddlesService],
  controllers: [RiddleController, TeamRiddlesController],
})
export class RiddleModule {}
