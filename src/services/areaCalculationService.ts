import { area } from '@turf/area';
import { polygon } from '@turf/helpers';
import type { PolygonPoint } from '../types/geo';

export interface AreaCalculationResult {
  success: boolean;
  areaInSquareMeters: number;
  formattedArea: string;
  pointsCount: number;
  errorMessage?: string;
}

/**
 * Formata um valor numérico em metros quadrados no padrão brasileiro (pt-BR).
 * Exemplo: 1243.567 -> "1.243,57 m²"
 */
export function formatArea(areaInSquareMeters: number): string {
  try {
    return (
      new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(areaInSquareMeters) + ' m²'
    );
  } catch {
    const parts = areaInSquareMeters.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${integerPart},${parts[1]} m²`;
  }
}

/**
 * Valida a integridade de um vértice de coordenada geográfica (WGS84).
 */
function isValidCoordinate(point: PolygonPoint | null | undefined): boolean {
  if (!point || typeof point !== 'object') {
    return false;
  }
  const { latitude, longitude } = point;
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    isNaN(latitude) ||
    isNaN(longitude) ||
    !isFinite(latitude) ||
    !isFinite(longitude)
  ) {
    return false;
  }
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

/**
 * Calcula a área real de um polígono sobre a superfície terrestre (elipsoide WGS84)
 * utilizando o algoritmo de Chamberlain-Duquette (NASA JPL) via @turf/area.
 *
 * Não assume que a Terra é plana nem que 1 grau possui distância fixa.
 *
 * @param points Lista ordenada de vértices { latitude, longitude }
 * @returns AreaCalculationResult com o valor exato, formatado e status
 */
export function calculatePolygonArea(points: PolygonPoint[]): AreaCalculationResult {
  // 1. Trata polígono vazio ou nulo
  if (!points || !Array.isArray(points) || points.length === 0) {
    return {
      success: false,
      areaInSquareMeters: 0,
      formattedArea: '0,00 m²',
      pointsCount: 0,
      errorMessage: 'Polígono vazio: nenhum vértice fornecido.',
    };
  }

  // 2. Trata polígono com menos de 3 pontos
  if (points.length < 3) {
    return {
      success: false,
      areaInSquareMeters: 0,
      formattedArea: '0,00 m²',
      pointsCount: points.length,
      errorMessage: `Pontos insuficientes: o polígono possui ${points.length} ponto(s), mínimo exigido é 3.`,
    };
  }

  // 3. Valida individualmente cada coordenada
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (!isValidCoordinate(pt)) {
      return {
        success: false,
        areaInSquareMeters: 0,
        formattedArea: '0,00 m²',
        pointsCount: points.length,
        errorMessage: `Vértice inválido detectado no índice ${i}: latitude ou longitude fora dos limites terrestres válidos.`,
      };
    }
  }

  try {
    // 4. Converte para o anel de coordenadas GeoJSON [longitude, latitude]
    const ring: [number, number][] = points.map((pt) => [pt.longitude, pt.latitude]);

    // 5. Garante que o anel GeoJSON seja fechado (primeiro ponto == último ponto)
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    if (
      firstPoint.latitude !== lastPoint.latitude ||
      firstPoint.longitude !== lastPoint.longitude
    ) {
      ring.push([firstPoint.longitude, firstPoint.latitude]);
    }

    // 6. Calcula a área geodésica em metros quadrados via Chamberlain-Duquette
    const geoJsonPolygon = polygon([ring]);
    const rawArea = area(geoJsonPolygon);

    // Valida se o resultado gerado é um número válido e positivo
    const safeArea = Math.max(0, isFinite(rawArea) && !isNaN(rawArea) ? rawArea : 0);

    return {
      success: true,
      areaInSquareMeters: safeArea,
      formattedArea: formatArea(safeArea),
      pointsCount: points.length,
    };
  } catch (error) {
    return {
      success: false,
      areaInSquareMeters: 0,
      formattedArea: '0,00 m²',
      pointsCount: points.length,
      errorMessage:
        error instanceof Error ? error.message : 'Falha ao calcular a área geodésica do polígono.',
    };
  }
}
