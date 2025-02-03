import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwtauth.guard';
import { DatabaseModule } from 'src/database/database.module'; 

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    DatabaseModule, 
  ],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule], 
})
export class AuthModule {}
