/**
 * HeaderBar Component
 *
 * Header customizado com título, ações e elevation
 * Usado nas telas que não usam header de navegação
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../theme/tokens';

export interface HeaderBarProps {
  /**
   * Título do header
   */
  title: string;

  /**
   * Subtítulo (opcional)
   */
  subtitle?: string;

  /**
   * Se true, exibe botão de voltar
   */
  showBack?: boolean;

  /**
   * Função chamada ao clicar em voltar
   */
  onBack?: () => void;

  /**
   * Ações no lado direito do header (ícones)
   */
  actions?: Array<{
    icon: string;
    label?: string;
    onPress: () => void;
    disabled?: boolean;
  }>;

  /**
   * Elevation do header
   */
  elevation?: number;
}

/**
 * Componente HeaderBar
 *
 * @example
 * // Header simples
 * <HeaderBar title="Detalhes do Post" />
 *
 * @example
 * // Header com botão voltar
 * <HeaderBar
 *   title="Editar Post"
 *   showBack
 *   onBack={() => navigation.goBack()}
 * />
 *
 * @example
 * // Header com ações
 * <HeaderBar
 *   title="Post"
 *   subtitle="Por João Silva"
 *   actions={[
 *     { icon: 'pencil', label: 'Editar', onPress: handleEdit },
 *     { icon: 'delete', label: 'Excluir', onPress: handleDelete },
 *   ]}
 * />
 */
export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  actions = [],
  elevation = 4,
}) => {
  const theme = useTheme();

  return (
    <Appbar.Header
      elevated={elevation > 0}
      style={[
        styles.header,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      {/* Botão voltar */}
      {showBack && onBack && (
        <Appbar.BackAction onPress={onBack} style={{ pointerEvents: 'auto' } as any} />
      )}

      {/* Título e subtítulo */}
      <Appbar.Content
        title={title}
        subtitle={subtitle}
        titleStyle={styles.title}
      />

      {/* Ações */}
      {actions.map((action, index) => (
        <Appbar.Action
          key={index}
          icon={action.icon}
          onPress={action.onPress}
          disabled={action.disabled}
          style={{ pointerEvents: action.disabled ? 'none' : 'auto' } as any}
          accessibilityLabel={action.label}
        />
      ))}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 4,
  },
  title: {
    fontWeight: '600',
  },
});

export default HeaderBar;
