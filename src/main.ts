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
        defaultSrc: ["'self'", 'https://amiteshtutorials.netlify.app', ' http://localhost:8081'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://amiteshtutorials.netlify.app', ' http://localhost:8081' ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://amiteshtutorials.netlify.app' , ' http://localhost:8081' ],
        imgSrc: ["'self'", "data:", 'https://amiteshtutorials.netlify.app', ' http://localhost:8081'],
        connectSrc: ["'self'", 'https://amiteshtutorials.netlify.app', ' http://localhost:8081'],
        fontSrc: ["'self'", 'https://amiteshtutorials.netlify.app', ' http://localhost:8081'],
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
    origin: ['https://amiteshtutorials.netlify.app',  'http://localhost:8081'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
