import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayersModule } from './players/players.module';
import { AuthModule } from './auth/auth.module';
import { TeamsModule } from './teams/teams.module';
import { RiddleModule } from './riddles/riddle.module';
import { PositionsModule } from './positions/positions.module';
import { ConfigModule } from '@nestjs/config';
import { SolutionsModule } from './solutions/solutions.module';

@Module({
  imports: [
    // MongooseModule.forRoot('mongodb://localhost:27017/chasse-au-tresor', {}),
    MongooseModule.forRoot(
      'mongodb+srv://famillemartin:VEJn3wSol1sHYE5T@cluster0.xntnh.mongodb.net/chasse-au-tresor?retryWrites=true&w=majority&appName=Cluster0',
      {},
    ),
    PlayersModule,
    AuthModule,
    TeamsModule,
    RiddleModule,
    PositionsModule,
    ConfigModule.forRoot(),
    SolutionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// famillemartin
// VEJn3wSol1sHYE5T
