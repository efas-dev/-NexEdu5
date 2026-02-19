/**
 * PostCard Component
 *
 * Card reutilizável para exibir posts
 * com título, descrição, metadados e ações
 * Inclui animação de fade-in ao aparecer
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Card } from '../ui/Card';
import { useTheme } from '../../hooks/useTheme';
import { spacing, typography } from '../../theme/tokens';
import { animationDurations, animationDelays } from '../../theme/animations';

export interface PostCardProps {
  /**
   * ID do post
   */
  id: number;

  /**
   * Título do post
   */
  title: string;

  /**
   * Conteúdo do post (será truncado)
   */
  content: string;

  /**
   * Nome do autor
   */
  author: string;

  /**
   * Data de criação (formatada)
   */
  createdAt: string;

  /**
   * Se true, exibe botões de editar/excluir
   * (apenas para professor)
   */
  canEdit?: boolean;

  /**
   * Função chamada ao clicar no card
   */
  onPress?: () => void;

  /**
   * Função chamada ao clicar em editar
   */
  onEdit?: () => void;

  /**
   * Função chamada ao clicar em excluir
   */
  onDelete?: () => void;

  /**
   * Estilo customizado do card
   */
  style?: any;

  /**
   * Índice do card na lista (para animação em cascata)
   */
  index?: number;
}

/**
 * Componente PostCard (Memoizado para performance)
 *
 * @example
 * <PostCard
 *   id={post.id}
 *   title={post.Title}
 *   content={post.Content}
 *   author={post.Author}
 *   createdAt={formatDate(post.createdAt)}
 *   canEdit={user.role === 'PROFESSOR'}
 *   onPress={() => navigation.navigate('PostDetail', { post })}
 *   onEdit={() => navigation.navigate('EditPost', { post })}
 *   onDelete={() => handleDelete(post.id)}
 * />
 */
export const PostCard = React.memo<PostCardProps>(({
  title,
  content,
  author,
  createdAt,
  canEdit = false,
  onPress,
  onEdit,
  onDelete,
  style,
  index = 0,
}) => {
  const theme = useTheme();

  // Calcular delay para animação em cascata
  const delay = index * animationDelays.short;

  return (
    <Animated.View
      entering={FadeInDown.duration(animationDurations.normal).delay(delay)}
    >
      <Card mode="elevated" style={[styles.card, style]}>
        <TouchableWithoutFeedback onPress={onPress} disabled={!onPress}>
          <View>
            <Card.Content style={styles.cardContentContainer}>
              {/* Título */}
              <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
                {title}
              </Text>

              {/* Conteúdo (truncado) */}
              <Text
                variant="bodyMedium"
                style={styles.content}
                numberOfLines={canEdit ? 3 : 5} // Condicional: 3 linhas para professor, 5 para aluno
              >
                {content}
              </Text>

              {/* Metadados (autor e data) */}
              <View style={styles.metadata}>
                <Text variant="bodySmall" style={styles.metadataText}>
                  Por {author}
                </Text>
                <Text variant="bodySmall" style={styles.metadataText}>
                  {' • '}
                </Text>
                <Text variant="bodySmall" style={styles.metadataText}>
                  {createdAt}
                </Text>
              </View>
            </Card.Content>
          </View>
        </TouchableWithoutFeedback>

        {/* Ações (apenas se canEdit) */}
        {canEdit && (
          <Card.Actions style={styles.actions}>
            {onEdit && (
              <IconButton
                icon="pencil"
                size={20}
                iconColor={theme.colors.primary}
                onPress={onEdit}
                accessibilityLabel="Editar post"
              />
            )}
            {onDelete && (
              <IconButton
                icon="delete"
                size={20}
                iconColor={theme.colors.error}
                onPress={onDelete}
                accessibilityLabel="Excluir post"
              />
            )}
          </Card.Actions>
        )}
      </Card>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  title: {
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  content: {
    marginBottom: spacing.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  metadataText: {
    opacity: 0.7,
  },
  actions: {
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.sm,
  },
  cardContentContainer: {
    padding: spacing.md, // Espaçamento interno padrão para o conteúdo do card
  },
});

export default PostCard;
