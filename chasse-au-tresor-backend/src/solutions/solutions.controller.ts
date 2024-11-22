import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Solution } from './schemas/solution.schema';
import { SolutionsService } from './solutions.service';

@Controller('solutions')
export class SolutionsController {
  readonly logger = new Logger(SolutionsController.name);

  constructor(
    private readonly solutionsService: SolutionsService,
    private readonly configService: ConfigService,
  ) {}

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

  @Get('toggle/:solutionId/:validated')
  async toggleValidated(
    @Param('solutionId') solutionId: string,
    @Param('validated') validatedS: string,
  ): Promise<Solution> {
    let validated: boolean|undefined;
    if (validatedS.toLocaleLowerCase() === 'true') {
      validated = true;
    } else if (validatedS.toLocaleLowerCase() === 'false') {
      validated = false;
    }

    return this.solutionsService.toggleValidated(solutionId, validated);
  }
}
