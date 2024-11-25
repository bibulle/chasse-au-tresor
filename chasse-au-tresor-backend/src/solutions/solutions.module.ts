import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Player, PlayerSchema } from 'src/players/schemas/player.schema';
import {
  TeamRiddle,
  TeamRiddleSchema,
} from 'src/riddles/schemas/team-riddle.schema';
import { multerOptionsFactory } from '../config/multer.config';
import { Solution, SolutionSchema } from './schemas/solution.schema';
import { SolutionsController } from './solutions.controller';
import { SolutionsService } from './solutions.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Solution.name, schema: SolutionSchema },
    ]),
    MongooseModule.forFeature([
      { name: TeamRiddle.name, schema: TeamRiddleSchema },
    ]),
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    MulterModule.registerAsync({
      imports: [ConfigModule], // Permet l'accès à ConfigService
      useFactory: multerOptionsFactory,
      inject: [ConfigService],
    }),
    NotificationsModule,
  ],
  controllers: [SolutionsController],
  providers: [SolutionsService],
  exports: [SolutionsService],
})
export class SolutionsModule {}
