import { Controller, Post, UploadedFile, UseInterceptors, Get, Res, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';

@Controller('db')
export class FilesController {
  readonly logger = new Logger(FilesController.name);

  constructor(private readonly filesService: FilesService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('Aucun fichier fourni.');
    }
    await this.filesService.handleImport(file);
    return { message: 'Fichier importé avec succès.s' };
  }

  @Get('export')
  async exportFile(@Res() res: Response) {
    console.log('export');
    const file = await this.filesService.handleExport();
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="treasure_hunt_data.json"',
    });
    res.send(file);
  }
}
