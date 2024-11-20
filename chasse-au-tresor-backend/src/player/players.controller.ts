import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  async createPlayer(@Body() body: CreatePlayerDto) {
    const isUnique = await this.playersService.isUsernameUnique(body.username);
    if (!isUnique) {
      throw new BadRequestException('Le nom du joueur est déjà pris.');
    }

    return this.playersService.createPlayer(body.username);
  }

  @Get('')
  async getAllPlayers(): Promise<any> {
    return this.playersService.getAllPlayers();
  }

  @Get('is-unique')
  async isUsernameUnique(
    @Query('username') username: string,
  ): Promise<boolean> {
    return this.playersService.isUsernameUnique(username);
  }

  @Get(':username')
  async getPlayerByName(@Param('username') username): Promise<any> {
    return this.playersService.getPlayerByName(username);
  }

  @Patch(':id/position')
  async updatePosition(
    @Param('id') playerId: string,
    @Body() positionDto: { latitude: number; longitude: number },
  ) {
    const updatedPlayer = await this.playersService.updatePosition(
      playerId,
      positionDto,
    );
    return updatedPlayer;
  }
}
