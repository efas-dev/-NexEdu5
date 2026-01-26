/**
 * Constantes de Animação
 *
 * Define durações, delays e easings padronizados
 * para animações consistentes na aplicação
 */

/**
 * Durações padrão de animações (em ms)
 */
export const animationDurations = {
  /**
   * Animações muito rápidas (micro-interações)
   * Ex: ripple, hover
   */
  fastest: 100,

  /**
   * Animações rápidas (transições de estado)
   * Ex: toggle, checkbox
   */
  fast: 150,

  /**
   * Animações normais (padrão)
   * Ex: fade-in, slide
   */
  normal: 250,

  /**
   * Animações médias (transições de tela)
   * Ex: modal, drawer
   */
  medium: 300,

  /**
   * Animações lentas (efeitos complexos)
   * Ex: page transitions, loading states
   */
  slow: 400,

  /**
   * Animações muito lentas (animações especiais)
   * Ex: skeleton shimmer, success feedback
   */
  slowest: 600,
} as const;

/**
 * Delays padrão para animações em cascata
 */
export const animationDelays = {
  /**
   * Sem delay
   */
  none: 0,

  /**
   * Delay pequeno (staggered animations)
   * Ex: cards em lista
   */
  short: 50,

  /**
   * Delay médio
   */
  medium: 100,

  /**
   * Delay longo
   */
  long: 200,
} as const;

/**
 * Easing functions (curvas de animação)
 * Baseado em Material Design Motion
 */
export const animationEasings = {
  /**
   * Standard easing - Transições gerais
   * Aceleração no início, desaceleração no fim
   */
  standard: [0.4, 0.0, 0.2, 1] as const,

  /**
   * Emphasized easing - Transições com ênfase
   * Aceleração mais agressiva
   */
  emphasized: [0.4, 0.0, 0.6, 1] as const,

  /**
   * Decelerate easing - Objetos entrando na tela
   * Apenas desaceleração
   */
  decelerate: [0.0, 0.0, 0.2, 1] as const,

  /**
   * Accelerate easing - Objetos saindo da tela
   * Apenas aceleração
   */
  accelerate: [0.4, 0.0, 1, 1] as const,

  /**
   * Linear easing - Sem curva
   * Para animações contínuas (loading, shimmer)
   */
  linear: [0.0, 0.0, 1, 1] as const,
} as const;

/**
 * Configurações de transições entre telas
 */
export const screenTransitions = {
  /**
   * Fade transition (padrão)
   */
  fade: {
    animation: 'fade' as const,
    duration: animationDurations.medium,
  },

  /**
   * Slide from right (iOS style)
   */
  slideRight: {
    animation: 'slide_from_right' as const,
    duration: animationDurations.normal,
  },

  /**
   * Slide from bottom (modal style)
   */
  slideBottom: {
    animation: 'slide_from_bottom' as const,
    duration: animationDurations.medium,
  },

  /**
   * No animation
   */
  none: {
    animation: 'none' as const,
    duration: 0,
  },
} as const;

/**
 * Configurações de spring animations
 */
export const springConfigs = {
  /**
   * Gentle spring (suave)
   */
  gentle: {
    damping: 15,
    mass: 1,
    stiffness: 100,
  },

  /**
   * Default spring (padrão)
   */
  default: {
    damping: 10,
    mass: 1,
    stiffness: 120,
  },

  /**
   * Bouncy spring (com bounce)
   */
  bouncy: {
    damping: 8,
    mass: 1,
    stiffness: 150,
  },

  /**
   * Stiff spring (rígida)
   */
  stiff: {
    damping: 20,
    mass: 1,
    stiffness: 200,
  },
} as const;

/**
 * Configurações de animação para componentes específicos
 */
export const componentAnimations = {
  /**
   * Card fade-in
   */
  cardFadeIn: {
    duration: animationDurations.normal,
    delay: animationDelays.short,
    easing: animationEasings.decelerate,
  },

  /**
   * Skeleton shimmer
   */
  skeletonShimmer: {
    duration: animationDurations.slowest * 2, // 1200ms
    easing: animationEasings.linear,
    loop: true,
  },

  /**
   * Success feedback
   */
  successFeedback: {
    duration: animationDurations.slow,
    easing: animationEasings.emphasized,
  },

  /**
   * Modal backdrop
   */
  modalBackdrop: {
    duration: animationDurations.fast,
    easing: animationEasings.standard,
  },

  /**
   * FAB scale
   */
  fabScale: {
    duration: animationDurations.fast,
    easing: animationEasings.emphasized,
  },
} as const;
