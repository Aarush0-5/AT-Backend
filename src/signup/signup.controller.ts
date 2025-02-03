import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SignupService } from './signup.service';
import { Prisma } from '@prisma/client';

@Controller('signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post()
  create(@Body() createSignupDto: Prisma.UserCreateInput) {
    return this.signupService.create(createSignupDto);
  }

  @Get()
  findAll(@Query('role') role?: 'STUDENT' | 'TEACHER') {
    return this.signupService.findAll(role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.signupService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSignupDto: Prisma.UserUpdateInput) {
    return this.signupService.update(+id, updateSignupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.signupService.remove(+id);
  }
}
