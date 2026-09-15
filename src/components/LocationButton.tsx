import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
} from 'react-native';

interface LocationButtonProps {
  onPress: () => void;
  isLoading: boolean;
}

export const LocationButton: React.FC<LocationButtonProps> = ({
  onPress,
  isLoading,
}) => {
  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <View style={styles.contentRow}>
          <ActivityIndicator size="small" color="#ffffff" />
          <Text style={styles.buttonText}>Buscando GPS...</Text>
        </View>
      ) : (
        <View style={styles.contentRow}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.buttonText}>Minha localização</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
