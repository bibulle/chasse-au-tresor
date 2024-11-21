import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PositionsModule } from 'src/positions/positions.module';
import { TeamsModule } from 'src/teams/teams.module';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { Player, PlayerSchema } from './schemas/player.schema';
import { Team, TeamSchema } from 'src/teams/schemas/team.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    PositionsModule,
    TeamsModule,
  ],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
