import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(private readonly configService: ConfigService) {}

  @Get(':filename(*)')
  async getPhoto(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(
      this.configService.get<string>('BASE_PATH'),
      filename,
    );

    if (
      !resolve(filePath).startsWith(this.configService.get<string>('BASE_PATH'))
    ) {
      throw new BadRequestException('mauvais nom');
    }

    // Vérifie si le fichier existe
    if (!existsSync(filePath)) {
      throw new NotFoundException('Image non trouvée');
    }

    // Retourne le fichier en tant que réponse
    res.sendFile(filePath);
  }
}
