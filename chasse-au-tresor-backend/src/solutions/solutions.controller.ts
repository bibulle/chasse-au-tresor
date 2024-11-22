import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SolutionsService } from './solutions.service';

@Controller('solutions')
export class SolutionsController {
  constructor(private readonly solutionsService: SolutionsService) {}

  @Post('submit')
  @UseInterceptors(FileInterceptor('photo')) // Permet l'upload de la photo
  async submitSolution(
    @Body('playerId') playerId: string,
    @Body('riddleId') riddleId: string,
    @Body('text') text: string,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    const photoPath = photo ? photo.path : null; // Chemin de la photo sauvegardée
    return this.solutionsService.createSolution(
      playerId,
      riddleId,
      text,
      photoPath,
    );
  }
}
