import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesModule } from './admin/files/files.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RiddleModule } from './riddles/riddle.module';
import { SolutionsModule } from './solutions/solutions.module';
import { TeamsModule } from './teams/teams.module';
import { FilesController } from './files/files.controller';
import { RequestLoggerMiddleware } from './request-logger/request-logger.middleware';
import { HintsModule } from './hints/hints.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Charge les variables d'environnement
    // 'mongodb://localhost:27017/chasse-au-tresor'
    // 'mongodb+srv://famillemartin:VEJn3wSol1sHYE5T@cluster0.xntnh.mongodb.net/chasse-au-tresor?retryWrites=true&w=majority&appName=Cluster0'
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'), // Récupère l'URI depuis les variables d'environnement
      }),
      inject: [ConfigService],
    }),
    PlayersModule,
    AuthModule,
    TeamsModule,
    RiddleModule,
    NotificationsModule,
    ConfigModule.forRoot(),
    SolutionsModule,
    FilesModule,
    HintsModule,
  ],
  controllers: [AppController, FilesController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}

// famillemartin
// VEJn3wSol1sHYE5T
