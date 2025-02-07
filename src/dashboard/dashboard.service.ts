import { Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly databaseservice: DatabaseService) {}

  async getDashboardData(username: string) {
    const user = await this.databaseservice.user.findUnique({ where: { username } });

    if (!user) {
      this.logger.error(`User not found: ${username}`);
      throw new NotFoundException('User not found');
    }

    if (user.role === 'STUDENT') {
      const studentData = await this.getStudentData(username);
      return studentData;
    } else if (user.role === 'TEACHER') {
      const teacherData = await this.getTeacherData(username);
      return teacherData;
    } else {
      this.logger.warn(`Unauthorized access attempt by user: ${username}`);
      throw new UnauthorizedException('Unauthorized');
    }
  }

  async getStudentData(username: string) {
    const user = await this.databaseservice.user.findUnique({ 
      where: { username }, 
      include: { marks: true } 
    });

    if (!user) {
      this.logger.error(`User not found: ${username}`);
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
    const user = await this.databaseservice.user.findUnique({ where: { username } });
    
    if (!user) {
      this.logger.error(`User not found: ${username}`);
      throw new NotFoundException('User not found');
    }
    
    return [
      {
        username: user.username,
        role: user.role,
      }
    ];
  }

  async getAllStudentData(role: 'STUDENT') {
    const studentAndMarks = await this.databaseservice.user.findMany({
      where: { role },
      include: { marks: true },
    });

    return studentAndMarks.map(student => ({
      StudentName: student.username,
      StudentId: student.id,
      Class: student.class,
      Marks: student.marks,
    }));
  }


  async uploadMark(mark: { subject: string; mark: number; studentId: number }) {
    try {
      await this.databaseservice.mark.create({
        data: {
          subject: mark.subject,
          mark: mark.mark,
          student: {
            connect: { id: mark.studentId },
          },
        },
      });
  
      this.logger.log(`Mark uploaded successfully for student ID: ${mark.studentId}`);
      return { message: 'Mark uploaded successfully!' };
    } catch (error) {
      this.logger.error(`Mark upload failed: ${error.message}`);
      throw new Error('Mark upload failed');
    }
  }
}
