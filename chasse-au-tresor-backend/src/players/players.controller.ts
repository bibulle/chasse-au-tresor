import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
    const alreadyExists = await this.playersService.alreadyExists(
      body.username,
    );
    if (alreadyExists) {
      throw new BadRequestException('Le nom du joueur est déjà pris.');
    }

    return this.playersService.createPlayer(body.username);
  }
  @Delete(':playerId')
  async deletePlayer(@Param('playerId') playerId) {
    return this.playersService.deletePlayer(playerId);
  }

  @Get('')
  async getAllPlayers(): Promise<any> {
    return this.playersService.getAllPlayers();
  }

  @Get('already-exists')
  async alreadyExists(@Query('username') username: string): Promise<boolean> {
    return this.playersService.alreadyExists(username);
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
