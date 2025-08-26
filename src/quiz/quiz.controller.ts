import { Controller, Post, Body } from '@nestjs/common';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('generate')
  async generate(@Body() body: { topic: string; difficulty: string; numQuestions: number }) {
    const { topic, difficulty, numQuestions } = body;
    return this.quizService.generateQuiz(topic, difficulty, numQuestions);
  }

  @Post('evaluate')
  async evaluate(@Body() body: { quiz: any; answers: any }) {
    const { quiz, answers } = body;
    return this.quizService.evaluateQuiz(quiz, answers);
  }
}
