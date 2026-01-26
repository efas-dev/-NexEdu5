/**
 * EditPostScreen
 *
 * Tela para editar post existente com formulário moderno
 */

import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PostsStackParamList } from '../navigation/AppNavigator';
import { updatePost } from '../services/postService';
import { useSnackbar } from '../context/SnackbarContext';
import { ScreenLayout } from '../components/layouts/ScreenLayout';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Button } from '../components/ui/Button';
import { spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<PostsStackParamList, 'EditPost'>;

export default function EditPostScreen({ route, navigation }: Props) {
  const { post } = route.params;

  const [title, setTitle] = useState(post.Title);
  const [content, setContent] = useState(post.Content);
  const [loading, setLoading] = useState(false);

  const { showSuccess, showError } = useSnackbar();

  const handleUpdate = async () => {
    if (!title || !content) {
      showError('Preencha título e conteúdo');
      return;
    }

    try {
      setLoading(true);
      await updatePost(post.id, title, content);
      showSuccess('Post atualizado com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || 'Não foi possível atualizar o post';
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
        onPress={handleUpdate}
        loading={loading}
        disabled={loading}
        icon="content-save"
        style={styles.button}
      >
        Atualizar Post
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
