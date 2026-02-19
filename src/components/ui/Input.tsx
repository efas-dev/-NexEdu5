/**
 * Input Component
 *
 * Wrapper fino sobre React Native Paper TextInput
 * com tipagem TypeScript e tema NexEdu
 *
 * Modo outlined padrão (mais moderno que flat)
 */

import React from 'react';
import { TextInput as PaperTextInput, TextInputProps as PaperTextInputProps } from 'react-native-paper';
import { useTheme } from '../../hooks/useTheme';

export interface InputProps extends Omit<PaperTextInputProps, 'theme'> {
  /**
   * Modo do input
   * - outlined: Com borda (padrão, mais moderno)
   * - flat: Sem borda, com underline
   */
  mode?: 'outlined' | 'flat';

  /**
   * Label do input (flutua ao focar)
   */
  label?: string;

  /**
   * Valor do input
   */
  value: string;

  /**
   * Função chamada ao alterar texto
   */
  onChangeText?: (text: string) => void;

  /**
   * Placeholder (exibido quando vazio)
   */
  placeholder?: string;

  /**
   * Se true, exibe estado de erro
   */
  error?: boolean;

  /**
   * Se true, desabilita o input
   */
  disabled?: boolean;

  /**
   * Tipo de teclado
   */
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';

  /**
   * Auto capitalize
   */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';

  /**
   * Se true, oculta o texto (para senhas)
   */
  secureTextEntry?: boolean;

  /**
   * Ícone à esquerda
   */
  left?: React.ReactNode;

  /**
   * Ícone à direita
   */
  right?: React.ReactNode;

  /**
   * Mensagem de ajuda ou erro (exibida abaixo do input)
   */
  helperText?: string;

  /**
   * Número máximo de caracteres
   */
  maxLength?: number;
}

/**
 * Componente Input
 *
 * @example
 * // Input básico
 * <Input
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   keyboardType="email-address"
 * />
 *
 * @example
 * // Input com ícone
 * <Input
 *   label="Buscar"
 *   value={search}
 *   onChangeText={setSearch}
 *   left={<TextInput.Icon icon="magnify" />}
 * />
 *
 * @example
 * // Input de senha
 * <Input
 *   label="Senha"
 *   value={password}
 *   onChangeText={setPassword}
 *   secureTextEntry
 *   left={<TextInput.Icon icon="lock" />}
 * />
 *
 * @example
 * // Input com erro
 * <Input
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={emailError}
 *   helperText={emailError ? "Email inválido" : ""}
 * />
 */
export const Input = React.forwardRef<any, InputProps>(
  ({ mode = 'outlined', error = false, ...props }, ref) => {
    const theme = useTheme();

    return (
      <PaperTextInput
        ref={ref}
        mode={mode}
        error={error}
        theme={theme}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

// Expor subcomponentes do Paper.TextInput
Input.Icon = PaperTextInput.Icon;
Input.Affix = PaperTextInput.Affix;

export default Input;
