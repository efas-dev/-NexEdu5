/**
 * useTheme Hook
 *
 * Hook customizado para acessar o tema React Native Paper
 * com tipagem TypeScript completa
 */

import { useTheme as usePaperTheme } from 'react-native-paper';
import type { AppTheme } from '../theme/theme';

/**
 * Hook para acessar o tema atual (light ou dark)
 * com todos os design tokens e cores Material Design 3
 *
 * @example
 * const theme = useTheme();
 * const primaryColor = theme.colors.primary;
 */
export const useTheme = () => {
  return usePaperTheme<AppTheme>();
};

export default useTheme;
