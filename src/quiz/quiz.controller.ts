import { Controller, Post, Get, Body, Logger, Param } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from 'src/authguard/jwtauth.guard';

@Controller('quiz')
export class QuizController {
  private readonly logger = new Logger(QuizController.name);

  constructor(private readonly quizService: QuizService) {}

@UseGuards(JwtAuthGuard)
 @Get('students')
  async getStudentsData(username: string) {
   this.logger.log('Fetching student data');
   return this.quizService.getStudentData(username);
  }

  @Post('generate')
  async generate(
    @Body() body: { topic: string; difficulty: string; numQuestions: number },
  ) {
    const { topic, difficulty, numQuestions } = body;
    return this.quizService.generateQuiz(topic, difficulty, numQuestions);
  }

  @Post('evaluate')
  async evaluate(@Body() body: { quiz: any; answers: any }) {
    const { quiz, answers } = body;
    return this.quizService.evaluateQuiz(quiz, answers);
  }
}
