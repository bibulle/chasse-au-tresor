import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  // Activer les validations globales
  app.useGlobalPipes(new ValidationPipe());

  // Autoriser les requêtes depuis n'importe quelle origine
  app.enableCors({
    origin: 'http://localhost:4200', // Adresse du frontend
    methods: 'GET,POST,PATCH,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
