/**
 * Skeleton Component
 *
 * Componente de loading placeholder com animação shimmer
 * (Paper não tem Skeleton nativo, então criamos customizado)
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { borderRadius } from '../../theme/tokens';
import { componentAnimations } from '../../theme/animations';

export interface SkeletonProps {
  /**
   * Largura do skeleton (número ou string com %)
   */
  width?: number | string;

  /**
   * Altura do skeleton
   */
  height?: number;

  /**
   * Tamanho (para skeleton circular)
   * Se fornecido, sobrescreve width e height
   */
  size?: number;

  /**
   * Variante do skeleton
   * - text: Linha de texto (altura padrão 16px)
   * - card: Card placeholder (altura padrão 120px)
   * - circle: Avatar circular
   * - rectangular: Retângulo customizado
   */
  variant?: 'text' | 'card' | 'circle' | 'rectangular';

  /**
   * Border radius customizado
   */
  borderRadius?: number;

  /**
   * Estilo adicional
   */
  style?: ViewStyle;
}

/**
 * Componente Skeleton
 *
 * @example
 * // Skeleton de texto
 * <Skeleton variant="text" width={200} />
 *
 * @example
 * // Skeleton de card
 * <Skeleton variant="card" width="100%" height={120} />
 *
 * @example
 * // Skeleton de avatar circular
 * <Skeleton variant="circle" size={40} />
 *
 * @example
 * // Lista de skeletons
 * <View>
 *   <Skeleton variant="circle" size={40} />
 *   <Skeleton variant="text" width={150} />
 *   <Skeleton variant="text" width={100} />
 * </View>
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height,
  size,
  variant = 'rectangular',
  borderRadius: customBorderRadius,
  style,
}) => {
  const theme = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Animação de shimmer (loop infinito) com configurações do design system
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: componentAnimations.skeletonShimmer.duration,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => animation.stop();
  }, [shimmerAnim]);

  // Interpolação para efeito shimmer suave
  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  // Dimensões baseadas na variante
  const getDimensions = () => {
    if (size) {
      return { width: size, height: size };
    }

    switch (variant) {
      case 'text':
        return { width, height: height || 16 };
      case 'card':
        return { width, height: height || 120 };
      case 'circle':
        return { width: 40, height: 40 };
      case 'rectangular':
      default:
        return { width, height: height || 100 };
    }
  };

  // Border radius baseado na variante
  const getBorderRadius = () => {
    if (customBorderRadius !== undefined) return customBorderRadius;

    switch (variant) {
      case 'text':
        return borderRadius.xs;
      case 'card':
        return borderRadius.md;
      case 'circle':
        return borderRadius.full;
      case 'rectangular':
      default:
        return borderRadius.sm;
    }
  };

  const dimensions = getDimensions();
  const radius = getBorderRadius();

  return (
    <View
      style={[
        styles.container,
        {
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: radius,
          backgroundColor: theme.dark
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.11)',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: theme.dark
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.08)',
            opacity,
            borderRadius: radius,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default Skeleton;
