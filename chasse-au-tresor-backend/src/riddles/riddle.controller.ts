import { Controller, Get, Query } from '@nestjs/common';
import { RiddleService } from './riddle.service';
import { Riddle } from './schemas/riddle.schema';

@Controller('riddles')
export class RiddleController {
  constructor(private readonly riddleService: RiddleService) {}

  @Get('current')
  async getCurrentRiddle(@Query('username') username: string): Promise<Riddle> {
    return this.riddleService.getCurrentRiddle(username);
  }
}
