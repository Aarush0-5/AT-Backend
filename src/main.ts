import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import  helmet from "helmet"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config();

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'https://amiteshtutorials.netlify.app'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://amiteshtutorials.netlify.app' ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://amiteshtutorials.netlify.app'  ],
        imgSrc: ["'self'", "data:", 'https://amiteshtutorials.netlify.app'],
        connectSrc: ["'self'", 'https://amiteshtutorials.netlify.app'],
        fontSrc: ["'self'", 'https://amiteshtutorials.netlify.app'],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    frameguard: {
      action: 'deny',
    },
    referrerPolicy: {
      policy: 'no-referrer',
    },
    dnsPrefetchControl: {
      allow: false,
    },
    xssFilter: true,
    noSniff: true,
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000, 
      includeSubDomains: true,
      preload: true,
    },
  }));
  
  app.enableCors({
    origin: ['https://amiteshtutorials.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
