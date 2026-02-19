/**
 * EmptyState Component
 *
 * Componente para exibir estado vazio (sem dados)
 * com ícone, mensagem e call-to-action opcional
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { spacing, typography } from '../../theme/tokens';

export interface EmptyStateProps {
  /**
   * Nome do ícone (Material Community Icons)
   */
  icon?: string;

  /**
   * Tamanho do ícone
   */
  iconSize?: number;

  /**
   * Título da mensagem
   */
  title: string;

  /**
   * Descrição/subtítulo (opcional)
   */
  description?: string;

  /**
   * Label do botão de ação (opcional)
   * Se não fornecido, não exibe botão
   */
  actionLabel?: string;

  /**
   * Função chamada ao clicar no botão de ação
   */
  onAction?: () => void;

  /**
   * Ícone do botão de ação (opcional)
   */
  actionIcon?: string;
}

/**
 * Componente EmptyState
 *
 * @example
 * // Estado vazio simples
 * <EmptyState
 *   icon="inbox"
 *   title="Nenhum post encontrado"
 *   description="Comece criando seu primeiro post"
 * />
 *
 * @example
 * // Estado vazio com ação
 * <EmptyState
 *   icon="account-multiple"
 *   title="Nenhum usuário cadastrado"
 *   description="Adicione usuários para começar"
 *   actionLabel="Adicionar Usuário"
 *   actionIcon="plus"
 *   onAction={() => navigation.navigate('UserForm')}
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  iconSize = 80,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Ícone */}
      <Icon
        name={icon}
        size={iconSize}
        color={theme.colors.onSurfaceDisabled}
        style={styles.icon}
      />

      {/* Título */}
      <Text variant="titleLarge" style={styles.title}>
        {title}
      </Text>

      {/* Descrição */}
      {description && (
        <Text variant="bodyMedium" style={styles.description}>
          {description}
        </Text>
      )}

      {/* Botão de ação */}
      {actionLabel && onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          icon={actionIcon}
          style={styles.action}
        >
          {actionLabel}
        </Button>
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
  icon: {
    marginBottom: spacing.lg,
    opacity: 0.5,
  },
  title: {
    textAlign: 'center',
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: spacing.lg,
  },
  action: {
    marginTop: spacing.md,
  },
});

export default EmptyState;
