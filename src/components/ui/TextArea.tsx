/**
 * TextArea Component
 *
 * Wrapper sobre React Native Paper TextInput
 * com suporte multiline e contador de caracteres
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput as PaperTextInput, Text, useTheme as usePaperTheme } from 'react-native-paper';
import { useTheme } from '../../hooks/useTheme';
import { spacing, typography } from '../../theme/tokens';

export interface TextAreaProps {
  /**
   * Label do textarea (flutua ao focar)
   */
  label?: string;

  /**
   * Valor do textarea
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
   * Número de linhas visíveis inicialmente
   */
  numberOfLines?: number;

  /**
   * Se true, exibe estado de erro
   */
  error?: boolean;

  /**
   * Se true, desabilita o textarea
   */
  disabled?: boolean;

  /**
   * Número máximo de caracteres
   * Se fornecido, exibe contador de caracteres
   */
  maxLength?: number;

  /**
   * Se true, exibe contador de caracteres
   * (apenas se maxLength estiver definido)
   */
  showCharacterCount?: boolean;

  /**
   * Mensagem de ajuda ou erro
   */
  helperText?: string;

  /**
   * Modo do input
   */
  mode?: 'outlined' | 'flat';
}

/**
 * Componente TextArea
 *
 * @example
 * // TextArea básico
 * <TextArea
 *   label="Descrição"
 *   value={description}
 *   onChangeText={setDescription}
 *   numberOfLines={4}
 * />
 *
 * @example
 * // TextArea com contador de caracteres
 * <TextArea
 *   label="Conteúdo"
 *   value={content}
 *   onChangeText={setContent}
 *   numberOfLines={6}
 *   maxLength={500}
 *   showCharacterCount
 * />
 *
 * @example
 * // TextArea com erro
 * <TextArea
 *   label="Comentário"
 *   value={comment}
 *   onChangeText={setComment}
 *   error={commentError}
 *   helperText={commentError ? "Campo obrigatório" : ""}
 * />
 */
export const TextArea: React.FC<TextAreaProps> = ({
  mode = 'outlined',
  numberOfLines = 4,
  maxLength,
  showCharacterCount = true,
  error = false,
  helperText,
  value,
  ...props
}) => {
  const theme = useTheme();
  const paperTheme = usePaperTheme();

  // Calcular contador de caracteres
  const characterCount = value?.length || 0;
  const showCounter = showCharacterCount && maxLength !== undefined;

  return (
    <View style={styles.container}>
      <PaperTextInput
        mode={mode}
        multiline
        numberOfLines={numberOfLines}
        error={error}
        theme={theme}
        value={value}
        maxLength={maxLength}
        style={styles.textArea}
        {...props}
      />

      {/* Helper text ou contador de caracteres */}
      {(helperText || showCounter) && (
        <View style={styles.footer}>
          {/* Helper text (erro ou ajuda) */}
          {helperText && (
            <Text
              variant="bodySmall"
              style={[
                styles.helperText,
                error && { color: paperTheme.colors.error },
              ]}
            >
              {helperText}
            </Text>
          )}

          {/* Contador de caracteres */}
          {showCounter && (
            <Text
              variant="bodySmall"
              style={[
                styles.characterCount,
                characterCount > maxLength! && { color: paperTheme.colors.error },
              ]}
            >
              {characterCount}/{maxLength}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  textArea: {
    minHeight: 100,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  helperText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
  },
  characterCount: {
    fontSize: typography.fontSize.xs,
    marginLeft: spacing.sm,
  },
});

export default TextArea;
