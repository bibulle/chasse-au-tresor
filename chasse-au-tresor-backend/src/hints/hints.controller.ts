import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { HintsService } from './hints.service';
import { Hint } from './schemas/hint.schema';

@Controller('hints')
export class HintsController {
  constructor(private hintsService: HintsService) {}

  @Get(':hintId/purchase')
  async purchaseHint(@Param('hintId') hintId: string) {
    if (!hintId) {
      throw new BadRequestException("L'indice est obligatoire");
    }

    return this.hintsService.purchaseHint(hintId);
  }

  @Post()
  async saveHint(@Body('hint') hint: any, @Body('teamRiddleId') teamRiddleId: string) {
    if (!hint) {
      throw new BadRequestException("Pas d'indice");
    }
    if (!teamRiddleId) {
      throw new BadRequestException('Pas de team riddle');
    }

    return this.hintsService.saveHint(hint as Hint, teamRiddleId);
  }

  @Delete(':hintId')
  async deleteRiddle(@Param('hintId') hintId: string): Promise<void> {
    return this.hintsService.deleteHint(hintId);
  }
}
