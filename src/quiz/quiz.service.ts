import { Injectable, Logger , NotFoundException} from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class QuizService {
  private client: GoogleGenAI;

  private readonly logger = new Logger(QuizService.name);

  constructor(private readonly databaseservice: DatabaseService) {
     this.client = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });
   }


   async getStudentData(username: string) {
    const user = await this.databaseservice.user.findUnique({ 
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
     `

    const response = await this.client.models.generateContent({
      model: 'gemini-1.5-flash',
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
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    return response.text;
  }
}
