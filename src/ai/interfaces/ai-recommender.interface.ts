export interface RecommendationResult {
  id_destino: string;
  motivo: string;
}

export interface IAiRecommender {
  getRecommendations(
    userInterests: string[],
    candidates: any[],
    limit: number,
  ): Promise<RecommendationResult[]>;
}

export const AI_RECOMMENDER_TOKEN = Symbol('AI_RECOMMENDER_TOKEN');
