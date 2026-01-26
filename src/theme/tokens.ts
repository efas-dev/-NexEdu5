/**
 * Design Tokens - NexEdu Mobile
 *
 * Sistema de design baseado na identidade visual NexEdu
 * adaptado para Material Design 3 via React Native Paper
 */

// Cores da Marca NexEdu
export const brandColors = {
  // Cor primária da marca NexEdu (azul violeta profissional)
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',

  // Cores secundárias e de suporte
  secondary: '#06B6D4',    // Cyan (complementar)
  error: '#EF4444',        // Vermelho para ações destrutivas
  success: '#10B981',      // Verde para sucesso
  warning: '#F59E0B',      // Amarelo para avisos
  info: '#3B82F6',         // Azul para informações
}

// Sistema de Espaçamento (baseado em múltiplos de 4)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
}

// Border Radius (Material Design 3)
export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 6,    // Padrão Material Design 3
  lg: 8,
  xl: 14,    // Extra large para botões FAB
  full: 9999,
}

// Sistema de Tipografia
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
}

// Elevations/Shadows (baseado em Material Design)
export const elevation = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  xxl: 16,
}

// Opacidades
export const opacity = {
  disabled: 0.38,
  hover: 0.04,
  focus: 0.12,
  pressed: 0.16,
  divider: 0.12,
}

// Durações de Animação (em ms)
export const duration = {
  shortest: 150,
  shorter: 200,
  short: 250,
  standard: 300,
  complex: 375,
  entering: 225,
  leaving: 195,
}

// Curvas de Easing
export const easing = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
}

// Z-Index Layers
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
}
