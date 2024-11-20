import { Module } from '@nestjs/common';
import { PositionsGateway } from './positions.gateway';

@Module({
  providers: [PositionsGateway],
  exports: [PositionsGateway],
})
export class PositionsModule {}
