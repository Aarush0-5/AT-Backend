import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class QuizService {
  private client: GoogleGenAI;

  private readonly logger = new Logger(QuizService.name);

  constructor(private readonly databaseService: DatabaseService) {
    this.client = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  async getStudentData(username: string) {
    const user = await this.databaseService.user.findUnique({
      where: { username },
    });

    if (!user) {
      this.logger.error(`User not found: ${username}`);
      throw new NotFoundException('User not found');
    }

    return {
      username: user.username,
    };
  }

  async generateQuiz(topic: string, difficulty: string, numQuestions: number) {
    const prompt = `You are a quiz generator.
    Generate ${numQuestions || 5} ${difficulty || 'easy'} multiple-choice math questions on ${topic || 'general math'}.

    Constraints:
    - Only generate questions if the topic is related to math or science.
    - If the input is not math or science related, return an empty JSON array: []
    - Output strictly as JSON, no text, no markdown, no explanations.

    Format:
    [
      {
      "question": "string",
      "options": ["a", "b", "c", "d"],
      "correct_answer": "string"
      }
    ]

    Each object must contain exactly these keys:
    - 'question' (string)
    - 'options' (array of exactly 4 strings)
    - 'correct_answer' (string, matching one of the options)
    `;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ text: prompt }],
      });
      const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error('Failed to get a valid response from the model.');
      }
      return textResponse;
    } catch (error) {
      this.logger.error(`Error generating quiz: ${error.message}`);
      return '[]';
    }
  }

  async evaluateQuiz(quiz: any, answers: any, username: string) {
    this.logger.log(`Evaluating quiz for user: ${username}`);
    const prompt = `
      Here are the quiz questions with correct answers:
      ${JSON.stringify(quiz)}

      Here are the student's answers:
      ${JSON.stringify(answers)}

      Compare them and return JSON:
      {
        "score": int,
        "total": int,
        "correct": [indexes],
        "wrong": [indexes],
        "feedback": ["short explanation per wrong answer"]
      }
    `;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ text: prompt }],
      });
      const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error('Failed to get a valid evaluation response from the model.');
      }

      const quizResults = JSON.parse(textResponse);
      const finalScore = quizResults.score || 0;


      if (typeof finalScore === 'number') {
        await this.saveScore(username, finalScore);
      }

      return quizResults;
    } catch (error) {
      this.logger.error(`Error evaluating quiz: ${error.message}`);
      throw new Error('Could not evaluate the quiz.');
    }
  }
  async getLeaderboardData() {
    try {
      const leaderboard = await this.databaseService.score.findMany({
        orderBy: {
          score: 'desc', // Order by score from highest to lowest
        },
        include: {
          student: {
            select: {
              username: true,
            },
          },
        },
        take: 10, 
      });
      return leaderboard;
    } catch (error) {
      this.logger.error(`Failed to fetch leaderboard data: ${error.message}`);
      throw new Error('Could not retrieve leaderboard data.');
    }
  }

  private async saveScore(username: string, finalScore: number) {
    try {
      const user = await this.databaseService.user.findFirst({
        where: { username: username },
      });

      if (!user) {
        this.logger.error(`User not found when trying to save score: ${username}`);
        throw new NotFoundException('User not found.');
      }
      const existingScore = await this.databaseService.score.findUnique({
        where: { studentId: user.id },
      });

      if (existingScore) {
        await this.databaseService.score.update({
          where: { studentId: user.id },
          data: { score: existingScore.score + finalScore },
        });
        this.logger.log(`Score updated for user: ${username}. New total: ${existingScore.score + finalScore}`);
      } else {
        await this.databaseService.score.create({
          data: {
            studentId: user.id,
            score: finalScore,
          },
        });
        this.logger.log(`New score record created for user: ${username}. Score: ${finalScore}`);
      }
    } catch (error) {
      this.logger.error(`Failed to save score for user ${username}: ${error.message}`);
      throw error;
    }
  }
}
