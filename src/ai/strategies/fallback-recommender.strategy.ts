import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CerebrasRecommenderStrategy } from './cerebras-recommender.strategy';
import { GroqRecommenderStrategy } from './groq-recommender.strategy';
import { IAiRecommender, RecommendationResult } from '../interfaces/ai-recommender.interface';

/**
 * FallbackRecommenderStrategy implements the Strategy pattern with automatic failover.
 * It first tries Cerebras. If it fails (e.g. high traffic), it falls back to Groq.
 */
@Injectable()
export class FallbackRecommenderStrategy implements IAiRecommender {
  private readonly logger = new Logger(FallbackRecommenderStrategy.name);

  constructor(
    private readonly cerebras: CerebrasRecommenderStrategy,
    private readonly groq: GroqRecommenderStrategy,
  ) {}

  async getRecommendations(
    userInterests: string[],
    candidates: any[],
    limit: number,
  ): Promise<RecommendationResult[]> {
    try {
      this.logger.log('Attempting recommendation with Cerebras...');
      const result = await this.cerebras.getRecommendations(userInterests, candidates, limit);
      this.logger.log('Cerebras returned recommendations successfully.');
      return result;
    } catch (cerebrasError) {
      this.logger.warn(
        `Cerebras failed (${(cerebrasError as Error).message}). Falling back to Groq...`,
      );

      try {
        const result = await this.groq.getRecommendations(userInterests, candidates, limit);
        console.log(result);
        this.logger.log('Groq returned recommendations successfully.');
        return result;
      } catch (groqError) {
        this.logger.error(`Groq also failed: ${(groqError as Error).message}`);
        throw new InternalServerErrorException(
          'All AI providers failed to generate recommendations. Please try again later.',
        );
      }
    }
  }
}
