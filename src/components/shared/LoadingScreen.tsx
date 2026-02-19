/**
 * LoadingScreen Component
 *
 * Tela de loading centralizada com ActivityIndicator
 * e mensagem opcional
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../theme/tokens';

export interface LoadingScreenProps {
  /**
   * Mensagem exibida abaixo do indicator (opcional)
   */
  message?: string;

  /**
   * Tamanho do indicator
   */
  size?: 'small' | 'large' | number;
}

/**
 * Componente LoadingScreen
 *
 * @example
 * // Loading simples
 * <LoadingScreen />
 *
 * @example
 * // Loading com mensagem
 * <LoadingScreen message="Carregando posts..." />
 *
 * @example
 * // Loading grande
 * <LoadingScreen size="large" message="Processando..." />
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message,
  size = 'large',
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator
        animating
        size={size}
        color={theme.colors.primary}
      />
      {message && (
        <Text variant="bodyMedium" style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  message: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default LoadingScreen;
