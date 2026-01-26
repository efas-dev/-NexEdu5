/**
 * CreatePostScreen
 *
 * Tela para criar novo post com formulário moderno
 */

import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PostsStackParamList } from '../navigation/AppNavigator';
import { createPost } from '../services/postService';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { ScreenLayout } from '../components/layouts/ScreenLayout';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Button } from '../components/ui/Button';
import { spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<PostsStackParamList, 'CreatePost'>;

export default function CreatePostScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();

  const handleSave = async () => {
    if (!title || !content) {
      showError('Preencha título e conteúdo');
      return;
    }

    try {
      setLoading(true);
      await createPost(title, content, user?.name || 'Anônimo');
      showSuccess('Post criado com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || 'Não foi possível criar o post';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout keyboardAvoiding={true} scrollable={true} withPadding={true}>
      <Input
        label="Título"
        placeholder="Digite o título do post"
        value={title}
        onChangeText={setTitle}
        disabled={loading}
        left={<Input.Icon icon="format-title" />}
        style={styles.input}
      />

      <TextArea
        label="Conteúdo"
        placeholder="Digite o conteúdo do post"
        value={content}
        onChangeText={setContent}
        disabled={loading}
        numberOfLines={6}
        maxLength={5000}
        showCharacterCount={true}
        style={styles.textArea}
      />

      <Button
        mode="contained"
        onPress={handleSave}
        loading={loading}
        disabled={loading}
        icon="content-save"
        style={styles.button}
      >
        Salvar Post
      </Button>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: spacing.md,
  },
  textArea: {
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.sm,
  },
});
