import { Injectable, Inject, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AI_RECOMMENDER_TOKEN } from '../ai/interfaces/ai-recommender.interface';
import type { IAiRecommender } from '../ai/interfaces/ai-recommender.interface';
import { v4 as uuidv4 } from 'uuid'; // need to import or use crypto.randomUUID

@Injectable()
export class RecommendationsService {
  constructor(
    private supabaseService: SupabaseService,
    @Inject(AI_RECOMMENDER_TOKEN)
    private aiRecommender: IAiRecommender,
  ) {}

  async generateDailyRecommendations(id_perfil: string) {
    const supabase = this.supabaseService.getClient();

    // 0. Verificar si ya existen recomendaciones para hoy (comparando solo el día)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { data: existingRecommendations, error: existingError } = await supabase
      .from('recomendacion')
      .select('*')
      .eq('id_perfil', id_perfil)
      .gte('fecha_generada', todayStart.toISOString())
      .lte('fecha_generada', todayEnd.toISOString());

    if (!existingError && existingRecommendations && existingRecommendations.length > 0) {
      // Ya hay recomendaciones de hoy, las retornamos sin llamar a la IA
      return existingRecommendations;
    }

    // 1. Obtener los intereses del usuario
    const { data: perfilViajero, error: perfilError } = await supabase
      .from('perfil_viajero')
      .select('intereses')
      .eq('id', id_perfil)
      .single();

    if (perfilError || !perfilViajero) {
      throw new NotFoundException(`Perfil viajero no encontrado para el id: ${id_perfil}`);
    }

    const interesesString = perfilViajero.intereses || '';
    const interesesArray = interesesString.split(',').map((i) => i.trim()).filter((i) => i.length > 0);

    if (interesesArray.length === 0) {
      throw new NotFoundException('El usuario no tiene intereses registrados.');
    }

    // 2. Buscar 20 candidatos basados en los intereses
    const { data: candidatos, error: candidatosError } = await supabase
      .from('destino')
      .select('*')
      .in('tipo_experiencia', interesesArray)
      .limit(20);

    if (candidatosError) {
      console.error('Error fetching candidates:', candidatosError);
      throw new InternalServerErrorException('Error al buscar destinos candidatos.');
    }

    if (!candidatos || candidatos.length === 0) {
      return []; // No hay candidatos
    }

    // 3. Llamar a la IA para seleccionar 6
    const recommendations = await this.aiRecommender.getRecommendations(interesesArray, candidatos, 6);

    // 4. Guardar las recomendaciones en la base de datos
    // Las recomendaciones antiguas se conservan en el historial (se identifican por fecha_generada)
    const recordsToInsert = recommendations.map((rec) => ({
      id: crypto.randomUUID(),
      id_perfil: id_perfil,
      id_destino: rec.id_destino,
      motivo: rec.motivo,
      fecha_generada: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('recomendacion')
      .insert(recordsToInsert);

    if (insertError) {
      console.error('Error inserting recommendations:', insertError);
      throw new InternalServerErrorException('Error al guardar las recomendaciones.');
    }

    // 5. Retornar las recomendaciones al cliente
    return recordsToInsert;
  }
}
