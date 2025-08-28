import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { DatabaseModule } from 'src/database/database.module';
import { JwtAuthGuard } from 'src/authguard/jwtauth.guard';
import { AuthModule } from 'src/authguard/jwtauth.module';

@Module({
  imports : [DatabaseModule, AuthModule] ,
  controllers: [QuizController],
  providers: [QuizService, JwtAuthGuard],
})
export class QuizModule {}
