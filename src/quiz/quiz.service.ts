import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class QuizService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
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

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message?.content;
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

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message?.content;
  }
}
