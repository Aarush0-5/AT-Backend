import { Controller, Get, Post, Req, Body, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/authguard/jwtauth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard) 
  @Get()
  async getDashboard(@Req() req: Request) {
    const user = req.user;

    if (!user) {
      return { message: 'User not found' };
    }

    return this.dashboardService.getDashboardData(user.username);
  }

  @UseGuards(JwtAuthGuard) 
  @Post('upload')
  async uploadContent(@Req() req: Request, @Body() content: any) {
    const user = req.user;

    if (!user) {
      return { message: 'User not found' };
    }

    return this.dashboardService.uploadContent(user.username, content);
  }
}
