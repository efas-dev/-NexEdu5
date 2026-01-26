/**
 * SnackbarContext
 *
 * Context para gerenciar Snackbars globalmente na aplicação
 * Fornece feedback visual para ações de sucesso/erro
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Snackbar, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius } from '../theme/tokens';

/**
 * Tipos de snackbar
 */
type SnackbarType = 'success' | 'error' | 'info' | 'warning';

/**
 * Configuração do snackbar
 */
interface SnackbarConfig {
  message: string;
  type?: SnackbarType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Interface do contexto
 */
interface SnackbarContextData {
  /**
   * Exibe um snackbar
   */
  show: (config: SnackbarConfig) => void;

  /**
   * Exibe snackbar de sucesso
   */
  showSuccess: (message: string, duration?: number) => void;

  /**
   * Exibe snackbar de erro
   */
  showError: (message: string, duration?: number) => void;

  /**
   * Exibe snackbar de info
   */
  showInfo: (message: string, duration?: number) => void;

  /**
   * Exibe snackbar de warning
   */
  showWarning: (message: string, duration?: number) => void;

  /**
   * Esconde o snackbar atual
   */
  hide: () => void;
}

const SnackbarContext = createContext<SnackbarContextData>({} as SnackbarContextData);

/**
 * Provider do contexto de Snackbar
 */
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<SnackbarConfig>({
    message: '',
    type: 'info',
    duration: 3000,
  });

  /**
   * Exibe snackbar com configuração customizada
   */
  const show = (newConfig: SnackbarConfig) => {
    setConfig({
      ...newConfig,
      type: newConfig.type || 'info',
      duration: newConfig.duration || 3000,
    });
    setVisible(true);
  };

  /**
   * Esconde o snackbar
   */
  const hide = () => {
    setVisible(false);
  };

  /**
   * Snackbar de sucesso
   */
  const showSuccess = (message: string, duration = 3000) => {
    show({ message, type: 'success', duration });
  };

  /**
   * Snackbar de erro
   */
  const showError = (message: string, duration = 4000) => {
    show({ message, type: 'error', duration });
  };

  /**
   * Snackbar de info
   */
  const showInfo = (message: string, duration = 3000) => {
    show({ message, type: 'info', duration });
  };

  /**
   * Snackbar de warning
   */
  const showWarning = (message: string, duration = 3500) => {
    show({ message, type: 'warning', duration });
  };

  /**
   * Retorna cor de fundo baseado no tipo (usando cores do tema para melhor integração)
   */
  const getBackgroundColor = () => {
    switch (config.type) {
      case 'success':
        // Verde suave integrado com o tema
        return theme.dark ? '#047857' : '#059669';
      case 'error':
        // Usa errorContainer para melhor integração
        return theme.colors.error;
      case 'warning':
        // Laranja/amarelo suave
        return theme.dark ? '#D97706' : '#EA580C';
      case 'info':
      default:
        // Usa a cor primária do tema (azul violeta NexEdu)
        return theme.colors.primary;
    }
  };

  /**
   * Retorna cor do texto que contrasta bem com o fundo
   */
  const getTextColor = () => {
    // Usa onPrimary do tema que sempre contrasta bem
    return theme.colors.onPrimary;
  };

  /**
   * Retorna ícone baseado no tipo
   */
  const getIcon = () => {
    switch (config.type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert';
      case 'info':
      default:
        return 'information';
    }
  };

  return (
    <SnackbarContext.Provider
      value={{
        show,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        hide,
      }}
    >
      {children}

      {visible && (
        <Snackbar
          visible={visible}
          onDismiss={hide}
          duration={config.duration}
          action={
            config.action
              ? {
                  label: config.action.label,
                  onPress: () => {
                    config.action?.onPress();
                    hide();
                  },
                  textColor: getTextColor(),
                }
              : undefined
          }
          style={[
            styles.snackbar,
            {
              backgroundColor: getBackgroundColor(),
            }
          ]}
          theme={{
            colors: {
              surface: getBackgroundColor(),
              onSurface: getTextColor(),
              inverseOnSurface: getTextColor(),
            }
          }}
        >
          <View style={styles.content}>
            <Icon name={getIcon()} size={20} color={getTextColor()} />
            <Text
              variant="bodyMedium"
              style={[styles.message, { color: getTextColor() }]}
            >
              {config.message}
            </Text>
          </View>
        </Snackbar>
      )}
    </SnackbarContext.Provider>
  );
}

/**
 * Hook para usar o contexto de Snackbar
 */
export function useSnackbar() {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error('useSnackbar deve ser usado dentro de um SnackbarProvider');
  }

  return context;
}

const styles = StyleSheet.create({
  snackbar: {
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  message: {
    flex: 1,
    fontWeight: '500',
  },
});
