import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { DatabaseService } from 'src/database/database.service';
import fs from 'fs';
import path from 'path';

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
      class: user.class,
    };
  }

  async generateQuiz(username: string, topic: string) {

    // Load topics.json
    const topicsPath = path.join(__dirname, '..', 'public', 'topics.json');
    const topicsData = JSON.parse(fs.readFileSync(topicsPath, 'utf-8'));

    // Check if the topic belongs to common or unique section
    const commonTopic = topicsData.common_topics.find((t: any) => t.topic === topic);
    const uniqueTopic = topicsData.unique_topics.find((t: any) => t.topic === topic);

    let prompt = '';

    if (uniqueTopic) {
      // Unique topic → 45 questions for that class
      const classLevel = uniqueTopic.class;
      prompt = `
      You are a quiz generator.
      Generate 15 beginner, 15 moderate, and 15 advanced multiple-choice math questions 
      on ${topic} for class ${classLevel}.

      Constraints:
      - Only generate questions if the topic is related to math.
      - Ensure that the difficulty and wording of the questions match the level of a class ${classLevel} student.
      - Output strictly as JSON, no text, no markdown, no explanations.

      Format:
      {
        "beginner": [ { "question": "string", "options": ["a","b","c","d"], "correct_answer": "string" } ],
        "moderate": [ { "question": "string", "options": ["a","b","c","d"], "correct_answer": "string" } ],
        "advanced": [ { "question": "string", "options": ["a","b","c","d"], "correct_answer": "string" } ]
      }
      `;
    } else if (commonTopic) {
      // Common topic → 45 per class
      const classLevels = commonTopic.classes;
      prompt = `
      You are a quiz generator.
      For the topic ${topic}, generate quizzes for the following classes: ${classLevels.join(', ')}.

      For each class, generate 15 beginner, 15 moderate, and 15 advanced multiple-choice math questions.

      Constraints:
      - Only generate questions if the topic is related to math.
      - Ensure that the difficulty and wording of the questions match the level of each class.
      - Output strictly as JSON, no text, no markdown, no explanations.

      Format:
      {
        "class_${classLevels[0]}": {
          "beginner": [ { "question": "string", "options": ["a","b","c","d"], "correct_answer": "string" } ],
          "moderate": [ { "question": "string", "options": ["a","b","c","d"], "correct_answer": "string" } ],
          "advanced": [ { "question": "string", "options": ["a","b","c","d"], "correct_answer": "string" } ]
        },
        ...
      }
      `;
    } else {
      this.logger.warn(`Topic ${topic} not found in topics.json`);
      return '[]';
    }

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ text: prompt }],
      });

      const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) throw new Error('Failed to get a valid response from the model.');
      return textResponse;
    } catch (error: any) {
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
      if (!textResponse) throw new Error('Failed to get a valid evaluation response from the model.');

      const cleanResponse = textResponse.replace(/```json|```/g, '').trim();
      const quizResults = JSON.parse(cleanResponse);
      const finalScore = quizResults.score || 0;

      if (typeof finalScore === 'number') {
        await this.saveScore(username, finalScore);
      }

      return quizResults;
    } catch (error: any) {
      this.logger.error(`Error evaluating quiz: ${error.message}`);
      throw new Error('Could not evaluate the quiz.');
    }
  }

  async getLeaderboardData() {
    try {
      const leaderboard = await this.databaseService.score.findMany({
        orderBy: { score: 'desc' },
        include: {
          student: { select: { username: true } },
        },
        take: 10,
      });
      return leaderboard;
    } catch (error: any) {
      this.logger.error(`Failed to fetch leaderboard data: ${error.message}`);
      throw new Error('Could not retrieve leaderboard data.');
    }
  }

  private async saveScore(username: string, finalScore: number) {
    try {
      const user = await this.databaseService.user.findUnique({
        where: { username },
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
        this.logger.log(
          `Score updated for user: ${username}. New total: ${existingScore.score + finalScore}`,
        );
      } else {
        await this.databaseService.score.create({
          data: { studentId: user.id, score: finalScore },
        });
        this.logger.log(`New score record created for user: ${username}. Score: ${finalScore}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to save score for user ${username}: ${error.message}`);
      throw error;
    }
  }
}
