import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, Platform, Alert } from 'react-native';
import MapView, {
  Marker,
  Polygon,
  Polyline,
  PROVIDER_GOOGLE,
  MapPressEvent,
} from 'react-native-maps';
import { GeoCoordinate } from '../types/geo';
import { getCurrentDeviceLocation } from '../services/locationService';
import { usePolygonArea } from '../hooks/usePolygonArea';
import { LocationButton } from '../components/LocationButton';
import { AreaControls } from '../components/AreaControls';
import { CoordinatesModal } from '../components/CoordinatesModal';

// Coordenadas centrais padrão para teste inicial antes da obtenção do GPS
const INITIAL_TEST_REGION = {
  latitude: -15.7942,
  longitude: -47.8822,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export const PocMapScreen: React.FC = () => {
  const mapRef = useRef<MapView>(null);

  // Estado da localização do usuário (isolado)
  const [currentLocation, setCurrentLocation] = useState<GeoCoordinate | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Controle de visibilidade do modal de coordenadas para validação da POC
  const [isCoordsModalVisible, setIsCoordsModalVisible] = useState<boolean>(false);

  // Estado e regras de negócio do polígono (hook isolado)
  const {
    polygonCoordinates,
    isDrawing,
    isEditing,
    hasPolygon,
    pointsCount,
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
  } = usePolygonArea();

  // Obtém a localização pontual do dispositivo
  const handleGetLocation = async () => {
    setIsLocating(true);
    const result = await getCurrentDeviceLocation();
    setIsLocating(false);

    if (!result.success || !result.coordinate) {
      Alert.alert(
        'Localização',
        result.errorMessage || 'Não foi possível obter a sua localização atual.'
      );
      return;
    }

    const { latitude, longitude } = result.coordinate;
    setCurrentLocation({ latitude, longitude });

    // Centraliza o mapa suavemente na posição obtida com zoom adequado para satélite
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      },
      1000
    );
  };

  // Trata o toque no mapa para adicionar coordenadas (desenho) ou mover vértice selecionado (edição)
  const handleMapPress = (e: MapPressEvent) => {
    const { coordinate } = e.nativeEvent;
    if (isDrawing) {
      addCoordinate(coordinate);
    } else if (isEditing && selectedVertexIndex !== null) {
      updateCoordinate(selectedVertexIndex, coordinate);
    }
  };

  // Finaliza o modo de desenho validando se há pelo menos 3 pontos
  const handleFinishDrawing = () => {
    const success = finishDrawing();
    if (!success) {
      Alert.alert(
        'Pontos insuficientes',
        'Para delimitar uma área, marque pelo menos 3 pontos no mapa.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        mapType="satellite"
        initialRegion={INITIAL_TEST_REGION}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
        showsCompass={true}
        onPress={handleMapPress}
      >
        {/* Marcador da localização atual do dispositivo */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Minha localização"
            description="Posição atual do dispositivo"
            pinColor="#2563eb"
          />
        )}

        {/* Polígono completo em tempo real (3 ou mais pontos) */}
        {polygonCoordinates.length >= 3 && (
          <Polygon
            coordinates={polygonCoordinates}
            strokeColor={isEditing ? '#f59e0b' : '#22c55e'}
            fillColor={isEditing ? 'rgba(245, 158, 11, 0.35)' : 'rgba(34, 197, 94, 0.35)'}
            strokeWidth={isEditing ? 3 : 2.5}
          />
        )}

        {/* Linha inicial quando há exatamente 2 pontos */}
        {polygonCoordinates.length === 2 && (
          <Polyline
            coordinates={polygonCoordinates}
            strokeColor="#22c55e"
            strokeWidth={2.5}
          />
        )}

        {/* Vértices do polígono: toque para selecionar e mover durante a edição */}
        {polygonCoordinates.map((coord, index) => {
          const isSelected = isEditing && selectedVertexIndex === index;
          return (
            <Marker
              key={`poly-vertex-${index}`}
              coordinate={coord}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={(e) => {
                if (isEditing) {
                  e.stopPropagation?.();
                  selectVertex(isSelected ? null : index);
                }
              }}
              tracksViewChanges={isEditing}
            >
              <View
                pointerEvents="none"
                style={[
                  styles.vertexMarker,
                  isEditing && styles.vertexMarkerEditing,
                  isSelected && styles.vertexMarkerSelected,
                ]}
              >
                <Text
                  style={[
                    styles.vertexText,
                    isSelected && styles.vertexTextSelected,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Controles de Área (Desenho e Edição) */}
      <AreaControls
        isDrawing={isDrawing}
        isEditing={isEditing}
        pointsCount={pointsCount}
        hasPolygon={hasPolygon}
        selectedVertexIndex={selectedVertexIndex}
        calculatedArea={calculatedArea}
        onStartDrawing={startDrawing}
        onFinishDrawing={handleFinishDrawing}
        onStartEditing={startEditing}
        onFinishEditing={finishEditing}
        onClearArea={clearArea}
        onDeselectVertex={() => selectVertex(null)}
        onViewCoordinates={() => setIsCoordsModalVisible(true)}
      />

      {/* Botão flutuante Minha Localização (oculto durante edição para desobstruir) */}
      {!isEditing && (
        <LocationButton
          onPress={handleGetLocation}
          isLoading={isLocating}
        />
      )}

      {/* Modal de inspeção e validação de coordenadas da POC */}
      <CoordinatesModal
        visible={isCoordsModalVisible}
        areaPolygon={getAreaPolygon()}
        calculatedArea={calculatedArea}
        onClose={() => setIsCoordsModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  vertexMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  vertexMarkerEditing: {
    backgroundColor: '#f59e0b',
    borderColor: '#ffffff',
    transform: [{ scale: 1.15 }],
    elevation: 6,
  },
  vertexMarkerSelected: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
    borderWidth: 2.5,
    transform: [{ scale: 1.35 }],
    elevation: 10,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
  },
  vertexText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  vertexTextSelected: {
    fontSize: 11,
    fontWeight: '900',
  },
});
