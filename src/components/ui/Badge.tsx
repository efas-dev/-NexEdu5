/**
 * Badge Component
 *
 * Wrapper fino sobre React Native Paper Badge
 * com variantes para roles (Professor/Aluno)
 */

import React from 'react';
import { Badge as PaperBadge, BadgeProps as PaperBadgeProps } from 'react-native-paper';
import { useTheme } from '../../hooks/useTheme';

export interface BadgeProps extends Omit<PaperBadgeProps, 'theme'> {
  /**
   * Conteúdo do badge (número ou texto curto)
   */
  children?: React.ReactNode;

  /**
   * Tamanho do badge
   */
  size?: number;

  /**
   * Se true, badge fica visível
   */
  visible?: boolean;

  /**
   * Variante do badge (customizada para NexEdu)
   * - primary: Cor primária (para Professor)
   * - secondary: Cor secundária (para Aluno)
   * - error: Cor de erro
   * - success: Cor de sucesso
   */
  variant?: 'primary' | 'secondary' | 'error' | 'success';
}

/**
 * Componente Badge
 *
 * @example
 * // Badge de notificação
 * <Badge size={20}>3</Badge>
 *
 * @example
 * // Badge de role (Professor)
 * <Badge variant="primary">Professor</Badge>
 *
 * @example
 * // Badge de role (Aluno)
 * <Badge variant="secondary">Aluno</Badge>
 *
 * @example
 * // Badge em ícone (não visível se 0)
 * <View>
 *   <Icon name="bell" />
 *   <Badge visible={notifications > 0}>{notifications}</Badge>
 * </View>
 */
export const Badge: React.FC<BadgeProps> = ({
  variant,
  visible = true,
  size = 20,
  style,
  children,
  ...props
}) => {
  const theme = useTheme();

  // Mapear variante para cor do tema
  const getBackgroundColor = () => {
    if (!variant) return undefined;

    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'error':
        return theme.colors.error;
      case 'success':
        return '#10B981'; // green (não há success no MD3 padrão)
      default:
        return undefined;
    }
  };

  const backgroundColor = getBackgroundColor();

  return (
    <PaperBadge
      visible={visible}
      size={size}
      theme={theme}
      style={[backgroundColor && { backgroundColor }, style]}
      {...props}
    >
      {children}
    </PaperBadge>
  );
};

export default Badge;
