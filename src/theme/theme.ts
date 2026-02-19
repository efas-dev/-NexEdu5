/**
 * Paper Theme - NexEdu Mobile
 *
 * Configuração do tema React Native Paper (Material Design 3)
 * com a identidade visual NexEdu
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { brandColors, borderRadius } from './tokens';

// Light Theme (tema claro)
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  // Configurar roundness (border radius padrão)
  roundness: borderRadius.md,
  colors: {
    ...MD3LightTheme.colors,
    // Primary colors (cor primária da marca NexEdu)
    primary: brandColors.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: brandColors.primaryLight,
    onPrimaryContainer: '#21005D',

    // Secondary colors
    secondary: brandColors.secondary,
    onSecondary: '#FFFFFF',
    secondaryContainer: '#B2F5FF',
    onSecondaryContainer: '#001F24',

    // Tertiary colors (mantém padrão MD3)
    tertiary: MD3LightTheme.colors.tertiary,
    onTertiary: MD3LightTheme.colors.onTertiary,
    tertiaryContainer: MD3LightTheme.colors.tertiaryContainer,
    onTertiaryContainer: MD3LightTheme.colors.onTertiaryContainer,

    // Error colors
    error: brandColors.error,
    onError: '#FFFFFF',
    errorContainer: '#FECDD3',
    onErrorContainer: '#7F1D1D',

    // Background colors
    background: '#FFFFFF',
    onBackground: '#1A1C1E',

    // Surface colors (para cards, dialogs, etc)
    surface: '#FFFFFF',
    onSurface: '#1A1C1E',
    surfaceVariant: '#E7E0EC',
    onSurfaceVariant: '#49454F',
    surfaceDisabled: 'rgba(26, 28, 30, 0.12)',
    onSurfaceDisabled: 'rgba(26, 28, 30, 0.38)',

    // Outline colors (bordas)
    outline: '#79747E',
    outlineVariant: '#CAC4D0',

    // Shadow colors
    shadow: '#000000',
    scrim: '#000000',

    // Inverse colors (para botões FAB, etc)
    inverseSurface: '#2F3033',
    inverseOnSurface: '#F1F0F4',
    inversePrimary: brandColors.primaryLight,

    // Elevation colors (backgrounds com elevação)
    elevation: {
      level0: 'transparent',
      level1: '#F5F1FC',    // Levemente tintado com primary
      level2: '#F0ECFA',
      level3: '#EBE7F8',
      level4: '#E9E5F7',
    level5: '#E6E2F6',
    },

    // Backdrop (para modais)
    backdrop: 'rgba(0, 0, 0, 0.4)',
  },
};

// Dark Theme (tema escuro)
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: borderRadius.md,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary colors (ajustado para melhor legibilidade no dark)
    primary: brandColors.primaryLight,
    onPrimary: '#381E72',
    primaryContainer: '#4F378B',
    onPrimaryContainer: '#E9DDFF',

    // Secondary colors
    secondary: '#4DD0E1',
    onSecondary: '#003640',
    secondaryContainer: '#004F58',
    onSecondaryContainer: '#B2F5FF',

    // Tertiary colors (mantém padrão MD3)
    tertiary: MD3DarkTheme.colors.tertiary,
    onTertiary: MD3DarkTheme.colors.onTertiary,
    tertiaryContainer: MD3DarkTheme.colors.tertiaryContainer,
    onTertiaryContainer: MD3DarkTheme.colors.onTertiaryContainer,

    // Error colors
    error: '#FF6B6B',
    onError: '#690000',
    errorContainer: '#93000A',
    onErrorContainer: '#FECDD3',

    // Background colors
    background: '#1A1C1E',
    onBackground: '#E3E2E6',

    // Surface colors
    surface: '#1A1C1E',
    onSurface: '#E3E2E6',
    surfaceVariant: '#49454F',
    onSurfaceVariant: '#CAC4D0',
    surfaceDisabled: 'rgba(227, 226, 230, 0.12)',
    onSurfaceDisabled: 'rgba(227, 226, 230, 0.38)',

    // Outline colors
    outline: '#938F99',
    outlineVariant: '#49454F',

    // Shadow colors
    shadow: '#000000',
    scrim: '#000000',

    // Inverse colors
    inverseSurface: '#E3E2E6',
    inverseOnSurface: '#2F3033',
    inversePrimary: brandColors.primary,

    // Elevation colors (backgrounds escuros com elevação)
    elevation: {
      level0: 'transparent',
      level1: '#252427',
      level2: '#2A282C',
      level3: '#2F2D31',
      level4: '#323033',
      level5: '#353336',
    },

    // Backdrop
    backdrop: 'rgba(0, 0, 0, 0.6)',
  },
};

// Tipo do tema exportado
export type AppTheme = typeof lightTheme;
