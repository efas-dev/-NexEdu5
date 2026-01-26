/**
 * ProfileScreen
 *
 * Tela de perfil do usuário com informações, configurações de tema e logout
 */

import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Avatar, Divider, List, Portal, Dialog, RadioButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useThemeContext, ThemePreference } from '../context/ThemeContext';
import { useTheme } from '../hooks/useTheme';
import { spacing } from '../theme/tokens';
import type { ProfileStackParamList, TabsParamList, RootStackParamList } from '../navigation/AppNavigator';

type ProfileScreenNavigationProp = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: ProfileScreenNavigationProp) {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const { themePreference, setThemePreference } = useThemeContext();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [showThemeDialog, setShowThemeDialog] = React.useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const [selectedTheme, setSelectedTheme] = React.useState<ThemePreference>(themePreference);

  // Pegar inicial do nome para o avatar
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  // Cor do avatar baseado na role
  const avatarColor = user?.role === 'PROFESSOR' ? theme.colors.primary : theme.colors.secondary;

  // Função para abrir dialog de tema
  const handleOpenThemeDialog = () => {
    setSelectedTheme(themePreference);
    setShowThemeDialog(true);
  };

  // Função para aplicar nova preferência de tema
  const handleApplyTheme = async () => {
    try {
      await setThemePreference(selectedTheme);
      setShowThemeDialog(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar o tema');
    }
  };

  // Label do tema atual
  const getThemeLabel = (preference: ThemePreference): string => {
    switch (preference) {
      case 'auto':
        return 'Automático (segue o sistema)';
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Escuro';
      default:
        return 'Automático';
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutDialog(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível fazer logout');
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header com Avatar e Info */}
      <Card mode="elevated" style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Avatar.Text
            size={80}
            label={initial}
            style={[styles.avatar, { backgroundColor: avatarColor }]}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {user?.name || 'Usuário'}
          </Text>
          <Text variant="bodyMedium" style={styles.login}>
            @{user?.login || 'user'}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: `${theme.colors.primary}20` }]}>
            <Icon
              name={user?.role === 'PROFESSOR' ? 'account-tie' : 'account'}
              size={16}
              color={theme.colors.primary}
            />
            <Text variant="labelMedium" style={[styles.roleText, { color: theme.colors.primary }]}>
              {user?.role === 'PROFESSOR' ? 'Professor' : 'Aluno'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Opções */}
      <Card mode="elevated" style={styles.optionsCard}>
        <List.Section>
          <List.Subheader>Configurações</List.Subheader>
          <Divider />
          <List.Item
            title="Tema"
            description={getThemeLabel(themePreference)}
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleOpenThemeDialog}
          />
          <Divider />
          <List.Item
            title="Sobre"
            description="Versão 1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('NexEdu Mobile', 'Versão 1.0.0\n\nSistema educacional moderno')}
          />
        </List.Section>
      </Card>

      {/* Dialog de Seleção de Tema */}
      <Portal>
        <Dialog visible={showThemeDialog} onDismiss={() => setShowThemeDialog(false)}>
          <Dialog.Title>Escolher tema</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => setSelectedTheme(value as ThemePreference)}
              value={selectedTheme}
            >
              <View style={styles.radioOption}>
                <RadioButton.Item
                  label="Automático (segue o sistema)"
                  value="auto"
                  position="leading"
                />
              </View>
              <View style={styles.radioOption}>
                <RadioButton.Item
                  label="Claro"
                  value="light"
                  position="leading"
                />
              </View>
              <View style={styles.radioOption}>
                <RadioButton.Item
                  label="Escuro"
                  value="dark"
                  position="leading"
                />
              </View>
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="text" onPress={() => setShowThemeDialog(false)}>
              Cancelar
            </Button>
            <Button mode="text" onPress={handleApplyTheme}>
              Aplicar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Botão Logout */}
      <Button
        mode="outlined"
        onPress={handleLogout}
        icon="logout"
        textColor={theme.colors.error}
        style={styles.logoutButton}
        loading={isLoggingOut}
        disabled={isLoggingOut}
      >
        Sair
      </Button>

      {/* Dialog de confirmação de logout */}
      <ConfirmDialog
        visible={showLogoutDialog}
        title="Sair"
        message="Deseja realmente sair da aplicação?"
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        destructive={true}
        loading={isLoggingOut}
        onConfirm={confirmLogout}
        onDismiss={() => setShowLogoutDialog(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatar: {
    marginBottom: spacing.md,
  },
  name: {
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  login: {
    opacity: 0.7,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  roleText: {
    // Cor será definida inline usando theme.colors.primary
  },
  optionsCard: {
    marginBottom: spacing.md,
  },
  logoutButton: {
    marginTop: spacing.sm,
  },
  radioOption: {
    marginVertical: -spacing.xs / 2,
  },
});
