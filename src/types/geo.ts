/**
 * Tipos fundamentais para a POC de medição de área em mapas.
 */

export type PolygonPoint = {
  latitude: number;
  longitude: number;
};

export type AreaPolygon = {
  points: PolygonPoint[];
};

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface MapRegion extends GeoCoordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}

export type MapTypeMode = 'satellite' | 'standard' | 'hybrid';

export interface PolygonData {
  id: string;
  coordinates: GeoCoordinate[];
  areaInSquareMeters: number;
}

