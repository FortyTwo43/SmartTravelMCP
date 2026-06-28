import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { IAiRecommender, RecommendationResult } from '../interfaces/ai-recommender.interface';

@Injectable()
export class GroqRecommenderStrategy implements IAiRecommender {
  private client: Groq;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is missing in the configuration.');
    }
    this.client = new Groq({ apiKey });
  }

  async getRecommendations(
    userInterests: string[],
    candidates: any[],
    limit: number,
  ): Promise<RecommendationResult[]> {
    const prompt = `
      You are an expert travel recommender AI.
      The user has the following interests: ${userInterests.join(', ')}.
      Here is a list of candidate destinations (in JSON format):
      ${JSON.stringify(candidates)}

      Your task is to select exactly ${limit} destinations from the candidate list that best match the user's interests.
      You MUST return your response as a valid JSON array of objects. Do not include any markdown formatting, backticks, or other text outside of the JSON array.
      Each object in the array must have exactly two properties:
      1. "id_destino": the ID of the selected destination (string).
      2. "motivo": a short, personalized reason (in Spanish) explaining why this destination is recommended for this user based on their interests (string).
    `;

    const response = await this.client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-20b',
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from Groq API');
    }

    const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed: RecommendationResult[] = JSON.parse(cleanedContent);

    return parsed.slice(0, limit);
  }
}
