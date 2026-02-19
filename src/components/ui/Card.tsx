/**
 * Card Component
 *
 * Wrapper fino sobre React Native Paper Card
 * com tipagem TypeScript e tema NexEdu
 *
 * Variantes nativas do Paper:
 * - elevated: Card com sombra/elevation (padrão MD3)
 * - filled: Card com background preenchido
 * - outlined: Card com borda
 */

import React from 'react';
import { Card as PaperCard, CardProps as PaperCardProps } from 'react-native-paper';
import { useTheme } from '../../hooks/useTheme';

export interface CardProps extends Omit<PaperCardProps, 'theme'> {
  /**
   * Variante do card (nativas do Paper)
   * - elevated: Com sombra (padrão)
   * - filled: Com background
   * - outlined: Com borda
   */
  mode?: 'elevated' | 'filled' | 'outlined';

  /**
   * Conteúdo do card
   */
  children: React.ReactNode;

  /**
   * Função chamada ao pressionar o card (opcional)
   * Se fornecida, o card se torna interativo
   */
  onPress?: () => void;

  /**
   * Função chamada ao pressionar longamente (opcional)
   */
  onLongPress?: () => void;
}

/**
 * Componente Card
 *
 * @example
 * // Card elevado (com sombra)
 * <Card mode="elevated">
 *   <Card.Content>
 *     <Text>Conteúdo do card</Text>
 *   </Card.Content>
 * </Card>
 *
 * @example
 * // Card interativo (clicável)
 * <Card mode="elevated" onPress={handlePress}>
 *   <Card.Content>
 *     <Text>Card clicável</Text>
 *   </Card.Content>
 * </Card>
 *
 * @example
 * // Card com título e ações
 * <Card mode="outlined">
 *   <Card.Title title="Título" subtitle="Subtítulo" />
 *   <Card.Content>
 *     <Text>Conteúdo</Text>
 *   </Card.Content>
 *   <Card.Actions>
 *     <Button mode="text">Cancelar</Button>
 *     <Button mode="text">OK</Button>
 *   </Card.Actions>
 * </Card>
 */
export const Card: React.FC<CardProps> & {
  Content: typeof PaperCard.Content;
  Title: typeof PaperCard.Title;
  Cover: typeof PaperCard.Cover;
  Actions: typeof PaperCard.Actions;
} = ({ mode = 'elevated', children, onPress, style, ...props }) => {
  const theme = useTheme();

  return (
    <PaperCard
      mode={mode}
      theme={theme}
      onPress={onPress}
      style={style}
      {...props}
    >
      {children}
    </PaperCard>
  );
};

// Expor subcomponentes do Paper.Card
Card.Content = PaperCard.Content;
Card.Title = PaperCard.Title;
Card.Cover = PaperCard.Cover;
Card.Actions = PaperCard.Actions;

export default Card;
