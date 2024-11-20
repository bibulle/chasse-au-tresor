import { Controller, Get } from '@nestjs/common';

@Controller('riddle')
export class RiddleController {
  @Get('current')
  getCurrentRiddle(): string {
    return 'Trouver le trésor caché'; // Exemple statique, à remplacer par une logique réelle
  }
}
