import { Controller, Get, Param } from '@nestjs/common';
import { TeamRiddlesService } from './team-riddles.service';
import { TeamRiddle } from './schemas/team-riddle.schema';

@Controller('team-riddles')
export class TeamRiddlesController {
  constructor(private readonly teamRiddleService: TeamRiddlesService) {}

  @Get(':teamId')
  async getTeamRiddles(@Param('teamId') teamId: string): Promise<TeamRiddle[]> {
    return this.teamRiddleService.getTeamRiddles(teamId);
  }

  @Get('current/:teamId')
  async getCurrentTeamRiddle(@Param('teamId') teamId: string): Promise<TeamRiddle> {
    return this.teamRiddleService.getCurrentTeamRiddle(teamId);
  }

  @Get('finished/:teamId')
  async getFinishedTeamRiddle(@Param('teamId') teamId: string): Promise<TeamRiddle[]> {
    return this.teamRiddleService.getFinishedTeamRiddle(teamId);
  }
}
