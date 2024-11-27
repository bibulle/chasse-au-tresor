import { Module } from '@nestjs/common';
import { HintsController } from './hints.controller';
import { HintsService } from './hints.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Hint, HintSchema } from './schemas/hint.schema';
import { TeamRiddle, TeamRiddleSchema } from 'src/riddles/schemas/team-riddle.schema';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hint.name, schema: HintSchema }]),
    MongooseModule.forFeature([{ name: TeamRiddle.name, schema: TeamRiddleSchema }]),
    NotificationsModule,
  ],
  controllers: [HintsController],
  providers: [HintsService],
})
export class HintsModule {}
