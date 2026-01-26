/**
 * LoginScreen
 *
 * Tela de autenticação com design moderno Material Design 3
 */

import React, { useState } from 'react';
import { View, Image, Alert, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { ScreenLayout } from '../components/layouts/ScreenLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  async function handleLogin() {
    if (!username || !password) {
      Alert.alert('Erro', 'Preencha login e senha para entrar.');
      return;
    }

    try {
      setLoading(true);
      await login(username, password);

      // A navegação para MainTabs agora é tratada automaticamente no AppNavigator
      // após a atualização do estado do usuário.
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenLayout keyboardAvoiding={true} scrollable={false} withPadding={false}>
      <View style={styles.container}>
        {/* Logo do app */}
        <Image
          source={require('../imagens/Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Título de boas-vindas */}
        <Text variant="headlineSmall" style={styles.title}>
          Bem-vindo ao NexEdu
        </Text>

        {/* Campo de entrada do login */}
        <Input
          label="Login"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          disabled={loading}
          left={<Input.Icon icon="account" />}
          style={styles.input}
        />

        {/* Campo de entrada da senha */}
        <Input
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          disabled={loading}
          left={<Input.Icon icon="lock" />}
          style={styles.input}
        />

        {/* Botão de login */}
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Entrar
        </Button>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: spacing.md,
  },
  button: {
    width: '100%',
    marginTop: spacing.sm,
  },
});
