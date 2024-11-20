import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  async createTeam(@Body() createTeamDto: { username: string }) {
    return this.teamsService.createTeam(createTeamDto.username);
  }

  @Patch(':teamId/add-player')
  async addPlayerToTeam(
    @Param('teamId') teamId: string,
    @Body() body: { playerId: string },
  ) {
    return this.teamsService.addPlayerToTeam(teamId, body.playerId);
  }

  @Patch(':teamId/remove-player')
  async removePlayerToTeam(
    @Param('teamId') teamId: string,
    @Body() body: { playerId: string },
  ) {
    return this.teamsService.removePlayerFromTeam(teamId, body.playerId);
  }

  @Get()
  async getAllTeams() {
    return this.teamsService.getAllTeams();
  }
}
