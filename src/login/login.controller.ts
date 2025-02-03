import { Controller, Post, Body, HttpStatus, HttpException } from '@nestjs/common';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  async login(@Body() logindto: { username: string; password: string }) {
    try {
      const result = await this.loginService.authenticateuser(logindto.username, logindto.password);
      return { accessToken: result.accessToken };
    } catch (error) {
      console.log('Authentication failed:', error.message);
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }
}
