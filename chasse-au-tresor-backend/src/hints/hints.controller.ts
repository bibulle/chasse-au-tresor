import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { HintsService } from './hints.service';

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
}
