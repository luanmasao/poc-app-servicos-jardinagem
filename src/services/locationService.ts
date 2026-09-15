import * as Location from 'expo-location';
import { GeoCoordinate } from '../types/geo';

export interface LocationResult {
  success: boolean;
  coordinate?: GeoCoordinate;
  errorMessage?: string;
}

/**
 * Serviço isolado para gerenciamento de localização do dispositivo.
 * Não utiliza background location nem rastreamento contínuo.
 */
export async function getCurrentDeviceLocation(): Promise<LocationResult> {
  try {
    // 1. Verifica se os serviços de localização (GPS) estão ativados no aparelho
    const isServiceEnabled = await Location.hasServicesEnabledAsync();
    if (!isServiceEnabled) {
      return {
        success: false,
        errorMessage: 'O serviço de localização (GPS) está desativado no dispositivo. Por favor, ative-o nas configurações.',
      };
    }

    // 2. Verifica a permissão atual em primeiro plano
    let permissionResponse = await Location.getForegroundPermissionsAsync();

    // Se ainda não foi concedida, solicita permissão ao usuário
    if (permissionResponse.status !== Location.PermissionStatus.GRANTED) {
      permissionResponse = await Location.requestForegroundPermissionsAsync();
    }

    // 3. Trata permissão negada
    if (permissionResponse.status !== Location.PermissionStatus.GRANTED) {
      return {
        success: false,
        errorMessage: 'Permissão de acesso à localização negada. Habilite a permissão para centralizar no seu terreno.',
      };
    }

    // 4. Obtém a localização atual pontual (Foreground apenas)
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      success: true,
      coordinate: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      errorMessage: error?.message || 'Não foi possível obter a localização atual.',
    };
  }
}
