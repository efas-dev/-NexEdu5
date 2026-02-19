/**
 * useResponsive Hook
 *
 * Hook para detectar tamanho de tela e retornar
 * configurações responsivas (tablet, colunas, etc)
 */

import { useWindowDimensions } from 'react-native';

/**
 * Breakpoints do design system
 */
const BREAKPOINTS = {
  // Smartphones (< 600px)
  mobile: 600,

  // Tablets pequenos (600px - 768px)
  tabletSmall: 768,

  // Tablets grandes (768px - 1024px)
  tabletLarge: 1024,

  // Desktop (> 1024px)
  desktop: 1024,
} as const;

/**
 * Interface de retorno do hook
 */
export interface ResponsiveConfig {
  /**
   * Largura atual da tela
   */
  width: number;

  /**
   * Altura atual da tela
   */
  height: number;

  /**
   * Se é smartphone (< 600px)
   */
  isMobile: boolean;

  /**
   * Se é tablet (>= 600px)
   */
  isTablet: boolean;

  /**
   * Se é tablet pequeno (600px - 768px)
   */
  isTabletSmall: boolean;

  /**
   * Se é tablet grande (768px+)
   */
  isTabletLarge: boolean;

  /**
   * Se é desktop (> 1024px)
   */
  isDesktop: boolean;

  /**
   * Número de colunas recomendado para grid
   * - Mobile: 1
   * - Tablet pequeno: 2
   * - Tablet grande: 3
   * - Desktop: 3
   */
  numColumns: 1 | 2 | 3;

  /**
   * Padding horizontal recomendado
   */
  horizontalPadding: number;

  /**
   * Orientação da tela
   */
  isLandscape: boolean;

  /**
   * Orientação da tela
   */
  isPortrait: boolean;
}

/**
 * Hook useResponsive
 *
 * @example
 * const { isTablet, numColumns } = useResponsive();
 *
 * <FlatList
 *   numColumns={numColumns}
 *   key={numColumns} // Necessário quando numColumns muda
 * />
 */
export function useResponsive(): ResponsiveConfig {
  const { width, height } = useWindowDimensions();

  // Detectar tipo de dispositivo
  const isMobile = width < BREAKPOINTS.mobile;
  const isTablet = width >= BREAKPOINTS.mobile;
  const isTabletSmall = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tabletSmall;
  const isTabletLarge = width >= BREAKPOINTS.tabletSmall;
  const isDesktop = width >= BREAKPOINTS.desktop;

  // Orientação
  const isLandscape = width > height;
  const isPortrait = height >= width;

  // Número de colunas baseado no tamanho da tela
  let numColumns: 1 | 2 | 3 = 1;
  if (isDesktop || isTabletLarge) {
    numColumns = 3;
  } else if (isTabletSmall) {
    numColumns = 2;
  } else {
    numColumns = 1;
  }

  // Padding horizontal adaptativo
  let horizontalPadding = 16; // mobile padrão
  if (isTabletLarge) {
    horizontalPadding = 32;
  } else if (isTabletSmall) {
    horizontalPadding = 24;
  }

  return {
    width,
    height,
    isMobile,
    isTablet,
    isTabletSmall,
    isTabletLarge,
    isDesktop,
    numColumns,
    horizontalPadding,
    isLandscape,
    isPortrait,
  };
}

export default useResponsive;
