import { Controller, Post, Body, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginDTO } from './dto/dto';

@Controller('login')
export class LoginController {
  private readonly logger = new Logger(LoginController.name);
  constructor(private readonly loginService: LoginService) {}

  @Post()
  async login(@Body() loginDTO: LoginDTO) {
    try {
      const result = await this.loginService.authenticateuser(loginDTO.username, loginDTO.password);
      this.logger.log(`New log in recorded from ${loginDTO.username}`);
      return { accessToken: result.accessToken };
    } catch (error) {
      this.logger.error("Invalid credentials");
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }
}
