import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config()
  app.enableCors({
    origin: 'https://amiteshtutorials.netlify.app/',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  })
  app.setGlobalPrefix('api')

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
