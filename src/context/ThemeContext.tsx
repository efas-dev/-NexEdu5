/**
 * ThemeContext
 *
 * Context para gerenciar o tema da aplicação
 * Permite alternar entre: Automático (segue sistema), Claro, Escuro
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MD3Theme } from 'react-native-paper';
import { lightTheme, darkTheme } from '../theme/theme';

// Tipos de preferência de tema
export type ThemePreference = 'auto' | 'light' | 'dark';

// Tipo do contexto
interface ThemeContextType {
  theme: MD3Theme;
  themePreference: ThemePreference;
  isDark: boolean;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
}

// Criar o contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Key para AsyncStorage
const THEME_STORAGE_KEY = '@NexEdu:theme_preference';

// Provider
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('auto');
  const [isLoading, setIsLoading] = useState(true);

  // Carregar preferência salva ao iniciar
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && (saved === 'auto' || saved === 'light' || saved === 'dark')) {
        setThemePreferenceState(saved as ThemePreference);
      }
    } catch (error) {
      console.error('Erro ao carregar preferência de tema:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para alterar preferência de tema
  const setThemePreference = async (preference: ThemePreference) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
      setThemePreferenceState(preference);
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
      throw error;
    }
  };

  // Determinar se está em dark mode
  const isDark =
    themePreference === 'dark' ||
    (themePreference === 'auto' && systemColorScheme === 'dark');

  // Selecionar tema atual
  const theme = isDark ? darkTheme : lightTheme;

  // Mostrar splash ou loading inicial se necessário
  if (isLoading) {
    return null; // Ou <SplashScreen />
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themePreference,
        isDark,
        setThemePreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Hook para usar o tema
export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext deve ser usado dentro de ThemeProvider');
  }
  return context;
}
