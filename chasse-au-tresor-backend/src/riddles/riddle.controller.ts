import { Controller, Get, Param } from '@nestjs/common';
import { RiddleService } from './riddle.service';
import { Riddle } from './schemas/riddle.schema';

@Controller('riddles')
export class RiddleController {
  constructor(private readonly riddleService: RiddleService) {}

  @Get('current/:username')
  async getCurrentRiddle(@Param('username') username: string): Promise<Riddle> {
    return this.riddleService.getCurrentRiddle(username);
  }
}
