import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DatabaseModule } from 'src/database/database.module';
import { JwtAuthGuard } from 'src/authguard/jwtauth.guard';
import { AuthModule } from 'src/authguard/jwtauth.module';

@Module({
  imports : [DatabaseModule,  AuthModule],
  controllers: [DashboardController],
  providers: [DashboardService, JwtAuthGuard],
})
export class DashboardModule {}
