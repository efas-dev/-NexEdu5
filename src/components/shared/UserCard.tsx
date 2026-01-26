/**
 * UserCard Component
 *
 * Card reutilizável para exibir usuários
 * com avatar, informações e badge de role
 */

import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Text, Avatar, IconButton, Chip } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '../ui/Card';
import { useTheme } from '../../hooks/useTheme';
import { spacing, typography } from '../../theme/tokens';
import { animationDurations, animationDelays } from '../../theme/animations';

export interface UserCardProps {
  /**
   * Nome do usuário
   */
  name: string;

  /**
   * Login do usuário
   */
  login: string;

  /**
   * Role do usuário (PROFESSOR ou ALUNO)
   */
  role: 'PROFESSOR' | 'ALUNO';

  /**
   * Se true, exibe botões de editar/excluir
   */
  canEdit?: boolean;

  /**
   * Se true, exibe botão de excluir (além de canEdit)
   */
  canDelete?: boolean;

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
 * Componente UserCard (Memoizado para performance)
 *
 * @example
 * <UserCard
 *   id={user.id}
 *   name={user.name}
 *   login={user.login}
 *   role={user.role}
 *   canEdit={true}
 *   onEdit={() => navigation.navigate('UserForm', { user })}
 *   onDelete={() => handleDelete(user.id)}
 * />
 */
export const UserCard = React.memo<UserCardProps>(({
  name,
  login,
  role,
  canEdit = false,
  canDelete = true,
  onPress,
  onEdit,
  onDelete,
  style,
  index = 0,
}) => {
  const theme = useTheme();

  // Pegar inicial do nome para o avatar
  const initial = name.charAt(0).toUpperCase();

  // Cor do chip baseado na role
  const chipColor = role === 'PROFESSOR' ? theme.colors.primary : theme.colors.secondary;

  // Calcular delay para animação em cascata
  const delay = index * animationDelays.short;

  return (
    <Animated.View
      entering={FadeInDown.duration(animationDurations.normal).delay(delay)}
    >
      <Card mode="elevated" style={[styles.card, style]}>
        <TouchableWithoutFeedback onPress={onPress} disabled={!onPress}>
          <View style={styles.cardContentWrapper}> {/* Wrapper para posicionamento relativo do chip */}
            <Card.Content>
              <View style={styles.content}>
                {/* Coluna do Avatar */}
                <View style={styles.avatarContainer}>
                  <Avatar.Text
                    size={48}
                    label={initial}
                    style={{ backgroundColor: chipColor }}
                  />
                </View>

                {/* Coluna de Informações e Ações */}
                <View style={styles.infoContainer}>
                  {/* Linha Superior: Nome e Ações */}
                  <View style={styles.topRow}>
                    <Text variant="titleMedium" style={styles.name} numberOfLines={1}>
                      {name}
                    </Text>
                    {canEdit && (
                      <View style={styles.actions}>
                        {onEdit && (
                          <IconButton
                            icon="pencil"
                            size={20}
                            iconColor={theme.colors.onSurfaceVariant}
                            onPress={onEdit}
                            style={styles.iconButton}
                            accessibilityLabel="Editar usuário"
                          />
                        )}
                        {canDelete && onDelete && (
                          <IconButton
                            icon="delete"
                            size={20}
                            iconColor={theme.colors.error}
                            onPress={onDelete}
                            style={styles.iconButton}
                            accessibilityLabel="Excluir usuário"
                          />
                        )}
                      </View>
                    )}
                  </View>

                  {/* Login */}
                  <Text variant="bodySmall" style={styles.login}>
                    @{login}
                  </Text>
                </View>
              </View>
            </Card.Content>

                        {/* Badge de Role - agora posicionado absolutamente no canto inferior direito */} 

                        <Chip

                          mode="outlined" // Revertido para 'outlined'

                          compact

                          textStyle={styles.chipText}

                          style={[

                            styles.chipAbsolute,

                            { borderColor: chipColor, backgroundColor: 'transparent' } // Estilo original

                          ]}

                        >

                          {role === 'PROFESSOR' ? 'Professor' : 'Aluno'}

                        </Chip>

                      </View>

                    </TouchableWithoutFeedback>

                  </Card>

                </Animated.View>

              );

            });

            

            const styles = StyleSheet.create({

              card: {

                marginBottom: spacing.md,

                overflow: 'hidden', // Importante para o posicionamento absoluto dentro do card

              },

              cardContentWrapper: {

                position: 'relative', // Contexto para o posicionamento absoluto do chip

                minHeight: 100, // Altura mínima para acomodar o chip na parte inferior, ajustar conforme necessário

                paddingBottom: spacing.md, // Espaçamento para o chip na parte inferior

              },

              content: {

                flexDirection: 'row',

                alignItems: 'flex-start',

                paddingVertical: spacing.sm,

              },

              avatarContainer: {

                marginRight: spacing.md,

                paddingTop: spacing.xs,

              },

              infoContainer: {

                flex: 1,

                justifyContent: 'center',

              },

              topRow: {

                flexDirection: 'row',

                justifyContent: 'space-between',

                alignItems: 'center',

                marginBottom: spacing.xs / 2,

              },

              name: {

                fontWeight: typography.fontWeight.semibold,

                flexShrink: 1,

              },

              login: {

                opacity: 0.7,

                marginBottom: spacing.sm,

              },

              chipAbsolute: {

                position: 'absolute',

                bottom: spacing.sm,

                right: spacing.sm,

                height: 28,

                borderRadius: 14, // Para garantir que o chip seja arredondado

                justifyContent: 'center', // Centraliza conteúdo verticalmente

                alignItems: 'center',     // Centraliza conteúdo horizontalmente

              },

              chipText: {

                fontSize: typography.fontSize.xs,

                fontWeight: 'bold',

                // Cor do texto removida para usar a cor padrão do tema

              },

            
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  iconButton: {
    margin: -4, // Reduz margem para aproximar botões
  },
});

export default UserCard;
