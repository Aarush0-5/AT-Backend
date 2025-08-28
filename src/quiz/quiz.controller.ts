import { Controller, Post, Get, Body, Logger } from '@nestjs/common';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
  private readonly logger = new Logger(QuizController.name);

  constructor(private readonly quizService: QuizService) {}

  @Get('students')
  async getStudentsData() {
    this.logger.log('Fetching all student data');
    return this.quizService.getStudentData(user.username);
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
