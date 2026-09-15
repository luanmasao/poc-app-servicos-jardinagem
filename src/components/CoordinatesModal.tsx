import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AreaPolygon } from '../types/geo';
import { AreaCalculationResult } from '../services/areaCalculationService';

interface CoordinatesModalProps {
  visible: boolean;
  areaPolygon: AreaPolygon | null;
  calculatedArea?: AreaCalculationResult;
  onClose: () => void;
}

export const CoordinatesModal: React.FC<CoordinatesModalProps> = ({
  visible,
  areaPolygon,
  calculatedArea,
  onClose,
}) => {
  if (!areaPolygon) return null;

  const points = areaPolygon.points;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>📍 Coordenadas da Área</Text>
              <Text style={styles.subtitle}>
                Estrutura AreaPolygon em memória ({points.length} vértices)
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeIconButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Conteúdo Rolável */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Resumo da Área Calculada */}
            {calculatedArea && calculatedArea.success && (
              <View style={styles.areaSummaryCard}>
                <Text style={styles.areaSummaryLabel}>ÁREA CALCULADA</Text>
                <Text style={styles.areaSummaryFormatted}>
                  {calculatedArea.formattedArea}
                </Text>
                <Text style={styles.areaSummaryExact}>
                  Valor exato: {calculatedArea.areaInSquareMeters.toFixed(6)} m²
                </Text>
              </View>
            )}

            {/* Lista formatada de vértices */}
            <Text style={styles.sectionTitle}>VÉRTICES FORMATADOS</Text>
            {points.map((point, index) => (
              <View key={`coord-item-${index}`} style={styles.pointCard}>
                <View style={styles.pointBadge}>
                  <Text style={styles.pointBadgeText}>{index + 1}</Text>
                </View>
                <View style={styles.coordDetails}>
                  <View style={styles.coordRow}>
                    <Text style={styles.coordLabel}>Latitude:</Text>
                    <Text style={styles.coordValue}>{point.latitude.toFixed(7)}°</Text>
                  </View>
                  <View style={styles.coordRow}>
                    <Text style={styles.coordLabel}>Longitude:</Text>
                    <Text style={styles.coordValue}>{point.longitude.toFixed(7)}°</Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Estrutura JSON pura em memória */}
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
              JSON (OBJETO AreaPolygon)
            </Text>
            <View style={styles.jsonBox}>
              <Text style={styles.jsonText}>
                {JSON.stringify(areaPolygon, null, 2)}
              </Text>
            </View>
          </ScrollView>

          {/* Rodapé com botão Fechar */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '82%',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  closeIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollArea: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 18,
  },
  areaSummaryCard: {
    backgroundColor: '#022c22',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#059669',
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
    gap: 4,
  },
  areaSummaryLabel: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  areaSummaryFormatted: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  areaSummaryExact: {
    color: '#a7f3d0',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  pointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  pointBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  coordDetails: {
    flex: 1,
    gap: 2,
  },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coordLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  coordValue: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  jsonBox: {
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  jsonText: {
    color: '#38bdf8',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  closeButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
