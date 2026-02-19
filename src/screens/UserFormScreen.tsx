/**
 * UserFormScreen
 *
 * Formulário para criar/editar usuário com validação e seletor de role
 */

import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { UsersStackParamList } from '../navigation/AppNavigator';
import { createUser, updateUser } from '../services/userService';
import { useSnackbar } from '../context/SnackbarContext';
import { ScreenLayout } from '../components/layouts/ScreenLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<UsersStackParamList, 'UserForm'>;

export default function UserFormScreen({ route, navigation }: Props) {
  const { user } = route.params || {};
  const isEditing = !!user;

  const [name, setName] = useState(user?.name || '');
  const [login, setLogin] = useState(user?.login || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'PROFESSOR' | 'ALUNO'>(user?.role || 'ALUNO');
  const [loading, setLoading] = useState(false);

  const { showSuccess, showError } = useSnackbar();

  const handleSave = async () => {
    // Validações
    if (!name || !login) {
      showError('Preencha nome e login');
      return;
    }

    if (!isEditing && !password) {
      showError('Preencha a senha');
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        // Atualizar usuário existente
        const updateData: any = { name, login, role };
        if (password) {
          updateData.password = password;
        }
        await updateUser(user!.id, updateData);
        showSuccess('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        await createUser({ name, login, password, role });
        showSuccess('Usuário criado com sucesso!');
      }

      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || `Erro ao ${isEditing ? 'atualizar' : 'criar'} usuário`;
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout keyboardAvoiding={true} scrollable={true} withPadding={true}>
      {/* Campo Nome */}
      <Input
        label="Nome Completo"
        placeholder="Digite o nome completo"
        value={name}
        onChangeText={setName}
        disabled={loading}
        left={<Input.Icon icon="account" />}
        style={styles.input}
      />

      {/* Campo Login */}
      <Input
        label="Login"
        placeholder="Digite o login"
        value={login}
        onChangeText={setLogin}
        autoCapitalize="none"
        disabled={loading}
        left={<Input.Icon icon="account-circle" />}
        style={styles.input}
      />

      {/* Campo Senha */}
      <Input
        label={isEditing ? 'Nova Senha (opcional)' : 'Senha'}
        placeholder={isEditing ? 'Deixe em branco para manter' : 'Digite a senha'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        disabled={loading}
        left={<Input.Icon icon="lock" />}
        helperText={isEditing ? 'Deixe em branco para manter a senha atual' : ''}
        style={styles.input}
      />

      {/* Seletor de Role */}
      <SegmentedButtons
        value={role}
        onValueChange={(value) => setRole(value as 'PROFESSOR' | 'ALUNO')}
        buttons={[
          {
            value: 'ALUNO',
            label: 'Aluno',
            icon: 'school',
          },
          {
            value: 'PROFESSOR',
            label: 'Professor',
            icon: 'account-tie',
          },
        ]}
        style={[styles.segmentedButtons, { pointerEvents: loading ? 'none' : 'auto' } as any]}
        disabled={loading}
      />

      {/* Botão Salvar */}
      <Button
        mode="contained"
        onPress={handleSave}
        loading={loading}
        disabled={loading}
        icon="content-save"
        style={styles.button}
      >
        {isEditing ? 'Atualizar Usuário' : 'Criar Usuário'}
      </Button>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: spacing.md,
  },
  segmentedButtons: {
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.sm,
  },
});
