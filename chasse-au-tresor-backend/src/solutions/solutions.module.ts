import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptionsFactory } from '../config/multer.config';
import { Solution, SolutionSchema } from './schemas/solution.schema';
import { SolutionsController } from './solutions.controller';
import { SolutionsService } from './solutions.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Solution.name, schema: SolutionSchema },
    ]),
    MulterModule.registerAsync({
      imports: [ConfigModule], // Permet l'accès à ConfigService
      useFactory: multerOptionsFactory,
      inject: [ConfigService],
    }),
  ],
  controllers: [SolutionsController],
  providers: [SolutionsService],
})
export class SolutionsModule {}
