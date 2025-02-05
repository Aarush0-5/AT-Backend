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

  async getAllStudentData(role: 'STUDENT') {
    return this.databaseservice.user.findMany({
      where: {
        role
      },
      include: {
        marks: true
      }
    });
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
  async uploadMark(mark: { subject: string; mark: number; studentId: number }) {
    try {
      await this.databaseservice.mark.create({
        data: {
          subject: mark.subject,
          mark: mark.mark,
          student: {
            connect: {
              id: mark.studentId,
            },
          },
        },
      });
  
      return { message: 'Mark uploaded successfully!' };
    } catch (error) {
      console.error('Mark upload failed:', error);
      throw new Error('Mark upload failed');
    }
  }
  
  }
  
