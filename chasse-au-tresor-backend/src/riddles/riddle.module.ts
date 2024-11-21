import { Module } from '@nestjs/common';
import { RiddleService } from './riddle.service';
import { RiddleController } from './riddle.controller';
import { Riddle, RiddleSchema } from './schemas/riddle.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Riddle.name, schema: RiddleSchema }]),
  ],
  providers: [RiddleService],
  controllers: [RiddleController],
})
export class RiddleModule {}
