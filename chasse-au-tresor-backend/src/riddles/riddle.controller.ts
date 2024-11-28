import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Team } from 'src/teams/schemas/team.schema';
import { RiddleService } from './riddle.service';
import { Riddle } from './schemas/riddle.schema';

@Controller('riddles')
export class RiddleController {
  private logger = new Logger(RiddleController.name);

  constructor(private readonly riddleService: RiddleService) {}

  @Get(':riddleId/teams')
  async getTeams(@Param('riddleId') riddleId: string): Promise<{ team: Team; order: number }[]> {
    return this.riddleService.getTeams(riddleId);
  }

  @Get('unassigned')
  async getUnassignedRiddles(): Promise<Riddle[]> {
    return this.riddleService.getUnassignedRiddles();
  }

  @Get('current/:username')
  async getCurrentRiddle(@Param('username') username: string): Promise<Riddle> {
    return this.riddleService.getCurrentRiddle(username);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file')) // Permet l'upload de la photo
  async saveRiddle(
    @Body('_id') riddleId: string,
    @Body('gain') gain: number,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
    @Body('photo') photo: string,
    @Body('trivia') trivia: string,
    @Body('text') text: string,
    @Body('teams') teamsS: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!text) {
      throw new BadRequestException('Le texte est obligatoire');
    }

    const photoPath = file ? file.path : null; // Chemin de la photo sauvegardée
    const teams = JSON.parse(teamsS);

    return this.riddleService.saveRiddle(riddleId, gain, latitude, longitude, text, photo, trivia, photoPath, teams);
  }

  @Delete(':riddleId')
  async deleteRiddle(@Param('riddleId') riddleId: string): Promise<void> {
    return this.riddleService.deleteRiddle(riddleId);
  }
}
