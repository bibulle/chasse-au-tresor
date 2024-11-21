import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesModule } from './admin/files/files.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';
import { PositionsModule } from './positions/positions.module';
import { RiddleModule } from './riddles/riddle.module';
import { SolutionsModule } from './solutions/solutions.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [
    // MongooseModule.forRoot('mongodb://localhost:27017/chasse-au-tresor', {}),
    MongooseModule.forRoot(
      // 'mongodb+srv://famillemartin:VEJn3wSol1sHYE5T@cluster0.xntnh.mongodb.net/chasse-au-tresor?retryWrites=true&w=majority&appName=Cluster0',
      'mongodb://localhost:27017/chasse-au-tresor',
      {},
    ),
    PlayersModule,
    AuthModule,
    TeamsModule,
    RiddleModule,
    PositionsModule,
    ConfigModule.forRoot(),
    SolutionsModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// famillemartin
// VEJn3wSol1sHYE5T
