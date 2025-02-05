import { Controller, Get, Post, Req, Body, UseGuards,Logger } from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/authguard/jwtauth.guard';

@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);
  constructor(private readonly dashboardService: DashboardService) {}



  
 @UseGuards(JwtAuthGuard) 
  @Get()
  async getDashboard(@Req() req: Request) {
    const user = req.user;

    if (!user) {
      this.logger.error('User not found in request');
      return { message: 'User not found' };
    }

    return this.dashboardService.getDashboardData(user.username);
  }

 @UseGuards(JwtAuthGuard)
  @Get('students')
   async getAllStudentsData(){
   this.logger.log('Fetching all student data');
     return this.dashboardService.getAllStudentData('STUDENT')
  }

@UseGuards(JwtAuthGuard)
 @Post('upload')
 async uploadContent(@Body() mark: { subject: string; mark: number; studentId: number }) {
   this.logger.log(`Uploading mark for student ID: ${mark.studentId}`);
   return this.dashboardService.uploadMark(mark);
 }
 
  


 
 
}
