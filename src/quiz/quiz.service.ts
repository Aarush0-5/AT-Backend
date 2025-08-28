import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class QuizService {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
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

    const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const response = await model.generateContent([
      { role: 'user', parts: [{ text: prompt }] },
    ]);

    return response.response.text(); // return clean text
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

    const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const response = await model.generateContent([
      { role: 'user', parts: [{ text: prompt }] },
    ]);

    return response.response.text();
  }
}
