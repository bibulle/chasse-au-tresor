import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamRiddle } from 'src/riddles/schemas/team-riddle.schema';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  async getAllTeams() {
    return this.teamsService.getAllTeams();
  }

  @Get(':teamId/riddles')
  async getRiddlesByTeam(
    @Param('teamId') teamId: string,
  ): Promise<TeamRiddle[]> {
    return this.teamsService.getRiddlesByTeam(teamId);
  }

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
    // console.log(`removePlayerToTeam(${teamId}, ${body.playerId})`);
    return this.teamsService.removePlayerFromTeam(teamId, body.playerId);
  }
}
