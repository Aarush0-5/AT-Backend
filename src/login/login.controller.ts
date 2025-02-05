import { Controller, Post, Body, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  private readonly logger = new Logger(LoginController.name);
  constructor(private readonly loginService: LoginService) {}

  @Post()
  async login(@Body() logindto: { username: string; password: string }) {
    try {
      const result = await this.loginService.authenticateuser(logindto.username, logindto.password);
      this.logger.log(`New log in recorded`)
      return { accessToken: result.accessToken };
    } catch (error) {
      this.logger.error("Invalid credentials")
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }
}
