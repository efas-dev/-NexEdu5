/**
 * ScreenLayout Component
 *
 * Layout wrapper padrão para todas as telas
 * com SafeAreaView, ScrollView opcional e KeyboardAvoidingView
 */

import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useResponsive } from '../../hooks/useResponsive';

export interface ScreenLayoutProps {
  /**
   * Conteúdo da tela
   */
  children: React.ReactNode;

  /**
   * Se true, envolve conteúdo em ScrollView
   */
  scrollable?: boolean;

  /**
   * Se true, habilita KeyboardAvoidingView
   * (útil para telas com inputs)
   */
  keyboardAvoiding?: boolean;

  /**
   * Comportamento do KeyboardAvoidingView
   * - padding: Adiciona padding (recomendado iOS)
   * - height: Ajusta altura (recomendado Android)
   * - position: Ajusta posição
   */
  keyboardBehavior?: 'padding' | 'height' | 'position';

  /**
   * Se true, adiciona padding horizontal
   */
  withPadding?: boolean;

  /**
   * Padding customizado (sobrescreve withPadding)
   */
  padding?: number;

  /**
   * Cor de fundo customizada
   */
  backgroundColor?: string;

  /**
   * Estilo adicional
   */
  style?: ViewStyle;
}

/**
 * Componente ScreenLayout
 *
 * @example
 * // Layout simples
 * <ScreenLayout>
 *   <Text>Conteúdo</Text>
 * </ScreenLayout>
 *
 * @example
 * // Layout com scroll
 * <ScreenLayout scrollable>
 *   <LongContent />
 * </ScreenLayout>
 *
 * @example
 * // Layout com keyboard avoiding (para formulários)
 * <ScreenLayout keyboardAvoiding scrollable>
 *   <Input label="Nome" />
 *   <Input label="Email" />
 *   <Button>Salvar</Button>
 * </ScreenLayout>
 */
export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  scrollable = false,
  keyboardAvoiding = false,
  keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height',
  withPadding = true,
  padding,
  backgroundColor,
  style,
}) => {
  const theme = useTheme();
  const { horizontalPadding, maxContentWidth } = useResponsive();

  // Background padrão do tema
  const bgColor = backgroundColor || theme.colors.background;

  // Padding padrão - usa responsivo se withPadding, senão usa customizado ou 0
  const defaultPadding = padding !== undefined ? padding : (withPadding ? horizontalPadding : 0);

  // Container base
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: bgColor,
  };

  // Conteúdo com padding
  const contentStyle: ViewStyle = {
    flex: 1,
    padding: defaultPadding,
  };

  // Renderizar conteúdo
  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={containerStyle}
          contentContainerStyle={[
            contentStyle,
            { flexGrow: 1 },
            style,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={[containerStyle, contentStyle, style]}>
        {children}
      </View>
    );
  };

  // SafeAreaView + KeyboardAvoidingView (se necessário)
  return (
    <SafeAreaView style={[containerStyle, { padding: 0 }]} edges={['top', 'bottom']}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={keyboardBehavior}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {renderContent()}
        </KeyboardAvoidingView>
      ) : (
        renderContent()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default ScreenLayout;
