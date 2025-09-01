import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Logger, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from 'src/authguard/jwtauth.guard';
import { Request } from 'express';

@Controller('quiz')
export class QuizController {
  private readonly logger = new Logger(QuizController.name);

  constructor(private readonly quizService: QuizService) {}

  @UseGuards(JwtAuthGuard)
  @Get('students')
  async getStudentsData(@Req() req: Request) {
    this.logger.log('Fetching student data');
    const user = req.user as { username: string };
    return this.quizService.getStudentData(user.username);
  }

@UseGuards(JwtAuthGuard)
@Post('generate')
async generateQuiz(
  @Req() req: Request,
  @Body() body: { topic: string },
) {
  const username = (req.user as { username: string }).username;
  return this.quizService.generateQuiz(username, body.topic);
}


  @UseGuards(JwtAuthGuard)
  @Post('evaluate')
  async evaluate(
    @Req() req: Request, 
    @Body() body: { quiz: any; answers: any },
  ) {
    const { quiz, answers } = body;
    const user = req.user as { username: string };
    return this.quizService.evaluateQuiz(quiz, answers, user.username);
  }

  @Get('leaderboard')
  async getLeaderboardData() {
    this.logger.log('Fetching leaderboard data');
    return this.quizService.getLeaderboardData();
  }
}
