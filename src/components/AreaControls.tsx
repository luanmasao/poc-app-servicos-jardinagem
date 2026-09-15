import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { AreaCalculationResult } from '../services/areaCalculationService';

interface AreaControlsProps {
  isDrawing: boolean;
  isEditing: boolean;
  pointsCount: number;
  hasPolygon: boolean;
  selectedVertexIndex?: number | null;
  calculatedArea?: AreaCalculationResult;
  onStartDrawing: () => void;
  onFinishDrawing: () => void;
  onStartEditing: () => void;
  onFinishEditing: () => void;
  onClearArea: () => void;
  onDeselectVertex?: () => void;
  onViewCoordinates?: () => void;
}

export const AreaControls: React.FC<AreaControlsProps> = ({
  isDrawing,
  isEditing,
  pointsCount,
  hasPolygon,
  selectedVertexIndex = null,
  calculatedArea,
  onStartDrawing,
  onFinishDrawing,
  onStartEditing,
  onFinishEditing,
  onClearArea,
  onDeselectVertex,
  onViewCoordinates,
}) => {
  return (
    <View style={styles.container}>
      {/* Indicador de status contextual */}
      {isDrawing && (
        <View style={[styles.statusBadge, styles.badgeDrawing]}>
          <View style={[styles.statusDot, { backgroundColor: '#22c55e' }]} />
          <Text style={styles.statusText}>
            Modo Desenho • {pointsCount} {pointsCount === 1 ? 'ponto' : 'pontos'} (mínimo 3)
          </Text>
        </View>
      )}

      {isEditing && selectedVertexIndex !== null && (
        <View style={[styles.statusBadge, styles.badgeSelectedVertex]}>
          <View style={[styles.statusDot, { backgroundColor: '#38bdf8' }]} />
          <Text style={styles.statusText}>
            Vértice {selectedVertexIndex + 1} selecionado • Toque no mapa para posicionar
          </Text>
        </View>
      )}

      {isEditing && selectedVertexIndex === null && (
        <View style={[styles.statusBadge, styles.badgeEditing]}>
          <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.statusText}>
            Modo Edição • Toque em um vértice para selecionar
          </Text>
        </View>
      )}

      {/* Exibição da Área Calculada em m² */}
      {hasPolygon && calculatedArea && calculatedArea.success && (
        <View style={styles.areaBadge}>
          <View style={styles.areaRow}>
            <Text style={styles.areaLabel}>Área calculada:</Text>
            <Text style={styles.areaValue}>{calculatedArea.formattedArea}</Text>
          </View>
          <Text style={styles.areaExactText}>
            Exato: {calculatedArea.areaInSquareMeters.toFixed(4)} m²
          </Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        {/* Caso 1: Em modo de desenho */}
        {isDrawing && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.finishButton]}
              onPress={onFinishDrawing}
              activeOpacity={0.8}
            >
              <Text style={styles.finishButtonText}>✓ Finalizar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onClearArea}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Limpar</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Caso 2: Em modo de edição */}
        {isEditing && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.finishEditingButton]}
              onPress={onFinishEditing}
              activeOpacity={0.8}
            >
              <Text style={styles.finishEditingButtonText}>✓ Concluir edição</Text>
            </TouchableOpacity>

            {selectedVertexIndex !== null && onDeselectVertex && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onDeselectVertex}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Desmarcar</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Caso 3: Repouso com polígono pronto */}
        {!isDrawing && !isEditing && hasPolygon && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={onStartEditing}
              activeOpacity={0.8}
            >
              <Text style={styles.editButtonText}>✋ Editar vértices</Text>
            </TouchableOpacity>

            {onViewCoordinates && (
              <TouchableOpacity
                style={[styles.button, styles.viewCoordsButton]}
                onPress={onViewCoordinates}
                activeOpacity={0.8}
              >
                <Text style={styles.viewCoordsButtonText}>📍 Ver coordenadas</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onStartDrawing}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Nova área</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={onClearArea}
              activeOpacity={0.8}
            >
              <Text style={styles.dangerButtonText}>🗑️</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Caso 4: Repouso sem polígono */}
        {!isDrawing && !isEditing && !hasPolygon && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onStartDrawing}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>✏️ Desenhar área</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeDrawing: {
    borderColor: '#22c55e',
  },
  badgeEditing: {
    borderColor: '#f59e0b',
  },
  badgeSelectedVertex: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(12, 74, 110, 0.95)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
  },
  areaBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#22c55e',
    alignItems: 'center',
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  areaLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  areaValue: {
    color: '#22c55e',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  areaExactText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderWidth: 1,
    borderColor: '#3b82f6',
    paddingHorizontal: 22,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  finishButton: {
    backgroundColor: '#16a34a',
    borderWidth: 1,
    borderColor: '#22c55e',
    paddingHorizontal: 22,
  },
  finishButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: '#d97706',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  viewCoordsButton: {
    backgroundColor: '#0284c7',
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  viewCoordsButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  finishEditingButton: {
    backgroundColor: '#16a34a',
    borderWidth: 1,
    borderColor: '#22c55e',
    paddingHorizontal: 24,
  },
  finishEditingButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderWidth: 1,
    borderColor: '#475569',
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: 'rgba(185, 28, 28, 0.9)',
    borderWidth: 1,
    borderColor: '#dc2626',
    paddingHorizontal: 14,
  },
  dangerButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
