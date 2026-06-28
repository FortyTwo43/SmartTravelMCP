import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { IAiRecommender, RecommendationResult } from '../interfaces/ai-recommender.interface';

@Injectable()
export class CerebrasRecommenderStrategy implements IAiRecommender {
  private client: Cerebras;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('CEREBRAS_API_KEY');
    if (!apiKey) {
      throw new Error('CEREBRAS_API_KEY is missing in the configuration.');
    }
    this.client = new Cerebras({
      apiKey,
    });
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

    try {
      const response = await this.client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3.1-8b', // Using a default Cerebras model, adjust if needed
        temperature: 0.2, // Low temperature for more deterministic output
      });

      const content = (response as any).choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content returned from Cerebras API');
      }

      // Try to parse the response as JSON. We assume the AI followed the strict JSON instruction.
      // Might need to clean up backticks if the AI still adds them despite instructions.
      const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed: RecommendationResult[] = JSON.parse(cleanedContent);

      return parsed.slice(0, limit);
    } catch (error) {
      console.error('Error fetching recommendations from Cerebras:', error);
      throw new InternalServerErrorException('Failed to generate AI recommendations');
    }
  }
}
