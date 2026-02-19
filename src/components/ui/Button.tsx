/**
 * Button Component
 *
 * Wrapper fino sobre React Native Paper Button
 * com tipagem TypeScript e tema NexEdu
 *
 * Variantes nativas do Paper:
 * - contained: Botão preenchido (ação primária)
 * - outlined: Botão com borda (ação secundária)
 * - text: Botão sem background (ação terciária)
 */

import React from 'react';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import { useTheme } from '../../hooks/useTheme';

export interface ButtonProps extends Omit<PaperButtonProps, 'theme'> {
  /**
   * Variante do botão (nativas do Paper)
   * - contained: Preenchido com cor primária
   * - outlined: Com borda
   * - text: Sem background
   */
  mode?: 'contained' | 'outlined' | 'text';

  /**
   * Se true, exibe loading indicator e desabilita botão
   */
  loading?: boolean;

  /**
   * Se true, desabilita o botão
   */
  disabled?: boolean;

  /**
   * Função chamada ao pressionar
   */
  onPress?: () => void;

  /**
   * Conteúdo do botão (texto ou ícone)
   */
  children: React.ReactNode;

  /**
   * Ícone à esquerda do texto
   */
  icon?: string;

  /**
   * Cor customizada do botão (opcional)
   * Por padrão usa cor primária do tema
   */
  buttonColor?: string;

  /**
   * Cor customizada do texto (opcional)
   */
  textColor?: string;
}

/**
 * Componente Button
 *
 * @example
 * // Botão primário
 * <Button mode="contained" onPress={handleSave}>
 *   Salvar
 * </Button>
 *
 * @example
 * // Botão secundário
 * <Button mode="outlined" onPress={handleCancel}>
 *   Cancelar
 * </Button>
 *
 * @example
 * // Botão destrutivo
 * <Button mode="text" textColor={theme.colors.error} onPress={handleDelete}>
 *   Excluir
 * </Button>
 *
 * @example
 * // Botão com loading
 * <Button mode="contained" loading={isLoading} onPress={handleSubmit}>
 *   Enviar
 * </Button>
 */
export const Button: React.FC<ButtonProps> = ({
  mode = 'contained',
  loading = false,
  disabled = false,
  children,
  style,
  ...props
}) => {
  const theme = useTheme();

  return (
    <PaperButton
      mode={mode}
      loading={loading}
      disabled={disabled || loading}
      theme={theme}
      style={style}
      {...props}
    >
      {children}
    </PaperButton>
  );
};

export default Button;
