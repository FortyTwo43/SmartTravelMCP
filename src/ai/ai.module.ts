import { Module } from '@nestjs/common';
import { AI_RECOMMENDER_TOKEN } from './interfaces/ai-recommender.interface';
import { CerebrasRecommenderStrategy } from './strategies/cerebras-recommender.strategy';

@Module({
  providers: [
    {
      provide: AI_RECOMMENDER_TOKEN,
      useClass: CerebrasRecommenderStrategy,
    },
  ],
  exports: [AI_RECOMMENDER_TOKEN],
})
export class AiModule {}
