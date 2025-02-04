
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class DashboardService {
  constructor(private readonly databaseservice: DatabaseService) {}

  async getDashboardData(username: string) {
    const user = await this.databaseservice.user.findUnique({ where: { username: username } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'STUDENT') {
      const studentData = await this.getStudentData(username);
      return studentData;
    } else if (user.role === 'TEACHER') {
      const teacherData = await this.getTeacherData(username);
      return teacherData;
    } else {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  async getStudentData(username: string) {
    const user = await this.databaseservice.user.findUnique({ 
      where: { username: username }, 
      include: { marks: true } 
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      username: user.username,
      class: user.class,
      marks: user.marks,
      role: user.role,
      message: 'Welcome to the student dashboard!',
    };
  }

  async getTeacherData(username: string) {
    const user = await this.databaseservice.user.findUnique({ where: { username: username } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      username: user.username,
      role: user.role,
      message: 'Welcome to the teacher dashboard! You can also upload content.',
    };
  }

  async uploadContent(username: string, content: any) {
    const user = await this.databaseservice.user.findUnique({ where: { username: username} });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'TEACHER') {
      throw new UnauthorizedException('Unauthorized');
    }

    // Handle the content upload logic here
    return { message: 'Content uploaded successfully!' };
  }
}
