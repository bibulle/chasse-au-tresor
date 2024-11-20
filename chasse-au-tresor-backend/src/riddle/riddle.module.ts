import { Module } from '@nestjs/common';
import { RiddleService } from './riddle.service';
import { RiddleController } from './riddle.controller';

@Module({
  providers: [RiddleService],
  controllers: [RiddleController]
})
export class RiddleModule {}
