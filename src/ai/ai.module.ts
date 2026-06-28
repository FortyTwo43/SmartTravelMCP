import { Module } from '@nestjs/common';
import { AI_RECOMMENDER_TOKEN } from './interfaces/ai-recommender.interface';
import { CerebrasRecommenderStrategy } from './strategies/cerebras-recommender.strategy';
import { GroqRecommenderStrategy } from './strategies/groq-recommender.strategy';
import { FallbackRecommenderStrategy } from './strategies/fallback-recommender.strategy';

@Module({
  providers: [
    CerebrasRecommenderStrategy,
    GroqRecommenderStrategy,
    FallbackRecommenderStrategy,
    {
      provide: AI_RECOMMENDER_TOKEN,
      useExisting: FallbackRecommenderStrategy,
    },
  ],
  exports: [AI_RECOMMENDER_TOKEN],
})
export class AiModule {}
