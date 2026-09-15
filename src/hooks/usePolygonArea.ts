import { useState, useCallback, useMemo } from 'react';
import { GeoCoordinate, AreaPolygon, PolygonPoint } from '../types/geo';
import {
  calculatePolygonArea,
  AreaCalculationResult,
} from '../services/areaCalculationService';

export interface UsePolygonAreaReturn {
  polygonCoordinates: GeoCoordinate[];
  isDrawing: boolean;
  isEditing: boolean;
  hasPolygon: boolean;
  pointsCount: number;
  selectedVertexIndex: number | null;
  calculatedArea: AreaCalculationResult;
  startDrawing: () => void;
  addCoordinate: (coordinate: GeoCoordinate) => void;
  updateCoordinate: (index: number, newCoordinate: GeoCoordinate) => void;
  selectVertex: (index: number | null) => void;
  finishDrawing: () => boolean;
  startEditing: () => void;
  finishEditing: () => void;
  clearArea: () => void;
  getAreaPolygon: () => AreaPolygon | null;
}

/**
 * Hook customizado para gerenciar exclusivamente o estado e regras
 * de negócio dos dados do polígono (em memória).
 */
export function usePolygonArea(): UsePolygonAreaReturn {
  const [polygonCoordinates, setPolygonCoordinates] = useState<GeoCoordinate[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null);

  // Inicia o modo de desenho do zero
  const startDrawing = useCallback(() => {
    setPolygonCoordinates([]);
    setIsEditing(false);
    setSelectedVertexIndex(null);
    setIsDrawing(true);
  }, []);

  // Adiciona uma nova coordenada ao polígono
  const addCoordinate = useCallback((coordinate: GeoCoordinate) => {
    setPolygonCoordinates((prev) => [...prev, coordinate]);
  }, []);

  // Atualiza uma coordenada existente (usado durante reposicionamento de vértice)
  const updateCoordinate = useCallback((index: number, newCoordinate: GeoCoordinate) => {
    setPolygonCoordinates((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const updated = [...prev];
      updated[index] = newCoordinate;
      return updated;
    });
  }, []);

  // Seleciona ou desseleciona um vértice específico para movimentação
  const selectVertex = useCallback((index: number | null) => {
    setSelectedVertexIndex(index);
  }, []);

  // Finaliza o modo de desenho garantindo mínimo de 3 pontos
  const finishDrawing = useCallback((): boolean => {
    if (polygonCoordinates.length < 3) {
      return false;
    }
    setIsDrawing(false);
    setSelectedVertexIndex(null);
    return true;
  }, [polygonCoordinates.length]);

  // Habilita o modo de edição dos vértices existentes
  const startEditing = useCallback(() => {
    if (polygonCoordinates.length >= 3) {
      setIsDrawing(false);
      setIsEditing(true);
      setSelectedVertexIndex(null);
    }
  }, [polygonCoordinates.length]);

  // Conclui a edição dos vértices
  const finishEditing = useCallback(() => {
    setIsEditing(false);
    setSelectedVertexIndex(null);
  }, []);

  // Limpa o polígono atual e redefine os modos
  const clearArea = useCallback(() => {
    setPolygonCoordinates([]);
    setIsDrawing(false);
    setIsEditing(false);
    setSelectedVertexIndex(null);
  }, []);

  // Retorna a estrutura de dados oficial do polígono para exportação/cálculos
  const getAreaPolygon = useCallback((): AreaPolygon | null => {
    if (polygonCoordinates.length < 3) {
      return null;
    }
    return {
      points: polygonCoordinates.map((coord) => ({
        latitude: coord.latitude,
        longitude: coord.longitude,
      })),
    };
  }, [polygonCoordinates]);

  // Calcula a área real do polígono em m² de forma reativa e precisa
  const calculatedArea = useMemo(() => {
    return calculatePolygonArea(polygonCoordinates);
  }, [polygonCoordinates]);

  return {
    polygonCoordinates,
    isDrawing,
    isEditing,
    hasPolygon: polygonCoordinates.length >= 3,
    pointsCount: polygonCoordinates.length,
    selectedVertexIndex,
    calculatedArea,
    startDrawing,
    addCoordinate,
    updateCoordinate,
    selectVertex,
    finishDrawing,
    startEditing,
    finishEditing,
    clearArea,
    getAreaPolygon,
  };
}
