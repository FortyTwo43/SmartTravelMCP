import { Controller, Post, Body } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationDto } from './dto/recommendation.dto';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post('today')
  async getDailyRecommendations(@Body() dto: CreateRecommendationDto) {
    return this.recommendationsService.generateDailyRecommendations(dto.id_perfil);
  }
}
