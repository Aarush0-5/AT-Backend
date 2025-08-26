import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class QuizService {
  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    });
  }

  async generateQuiz(topic: string, difficulty: string, numQuestions: number) {
    const prompt = `
      Generate ${numQuestions || 5} ${difficulty || 'easy'} math questions on ${topic || 'general math'}.
      Format output strictly as JSON:
      [
        {
          "question": "string",
          "options": ["a","b","c","d"],
          "correct_answer": "string"
        }
      ]
    `;

    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    return response.text;
  }

  async evaluateQuiz(quiz: any, answers: any) {
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

    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    return response.text;
  }
}
