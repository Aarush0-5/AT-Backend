import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name);
  constructor(private readonly databaseservice: DatabaseService) {}

  async authenticateuser(username: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.databaseservice.user.findUnique({ where: { username } });

    if (!user) {
      this.logger.error(`User not found: ${username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.error(`Wrong Password : ${username}`)
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const secretkey = process.env.JWT_SECRET_KEY;
    if (!secretkey) {
      this.logger.warn("MHM! KEY MISSING")
      throw new Error('JWT secret key is missing');
    }
    
    const payload = { username: user.username };
    const accessToken = jwt.sign(payload, secretkey, { expiresIn: '1h' });

    return { accessToken };
  }
}
