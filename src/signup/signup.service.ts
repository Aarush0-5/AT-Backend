import { Injectable , Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SignupService {
  private readonly logger = new Logger(SignupService.name);
  constructor(private readonly databaseservice: DatabaseService) {}

  async create(createSignupDto: Prisma.UserCreateInput) {
    const saltOrRounds = 10;
    createSignupDto.password = await bcrypt.hash(createSignupDto.password, saltOrRounds);
    this.logger.log(`New user created`)
    return this.databaseservice.user.create({ data: createSignupDto });
  }

  async findAll(role?: 'STUDENT' | 'TEACHER') {
    return this.databaseservice.user.findMany({
      where: {
        role,
      }
    });
  }

  async findOne(id: number) {
    return this.databaseservice.user.findUnique({
      where: {
        id,
      }
    });
  }

  async update(id: number, updateSignupDto: Prisma.UserUpdateInput) {
    if (updateSignupDto.password) {
      const saltOrRounds = 10;
      updateSignupDto.password = await bcrypt.hash(updateSignupDto.password, saltOrRounds);
    }
    return this.databaseservice.user.update({
      where: {
        id,
      },
      data: updateSignupDto,
    });
  }

  async remove(id: number) {
    return this.databaseservice.user.delete({
      where: {
        id,
      }
    });
  }
}
