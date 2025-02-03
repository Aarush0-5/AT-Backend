import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignupModule } from './signup/signup.module';
import { DatabaseModule } from './database/database.module';
import { LoginModule } from './login/login.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [SignupModule, DatabaseModule, LoginModule, DashboardModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 5
    }])
  ],
  controllers: [AppController],
  providers: [AppService,
    {provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule {}
