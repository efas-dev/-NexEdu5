/**
 * HomeScreen
 *
 * Tela principal com lista de posts em cards modernos
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, Alert, StyleSheet, RefreshControl } from 'react-native';
import { FAB } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PostsStackParamList } from '../navigation/AppNavigator';
import { Post } from '../types/Post';
import { getPosts, deletePost } from '../services/postService';
import { useAuth } from '../context/AuthContext';
import { ScreenLayout } from '../components/layouts/ScreenLayout';
import { PostCard } from '../components/shared/PostCard';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { EmptyState } from '../components/shared/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { spacing } from '../theme/tokens';
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../hooks/useResponsive';

type Props = NativeStackScreenProps<PostsStackParamList, 'Home'>;

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
};

export default function HomeScreen({ navigation }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();
  const theme = useTheme();
  const { numColumns } = useResponsive();

  // Memoizar se é professor
  const isProfessor = useMemo(() => user?.role === 'PROFESSOR', [user?.role]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao atualizar posts');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchPosts);
    return unsubscribe;
  }, [navigation, fetchPosts]);

  const handleDelete = useCallback((postId: number) => {
    setPostToDelete(postId);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (postToDelete === null) return;

    setIsDeleting(true);
    try {
      await deletePost(postToDelete);
      setShowDeleteDialog(false);
      setPostToDelete(null);
      fetchPosts();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao excluir post');
    } finally {
      setIsDeleting(false);
    }
  }, [postToDelete, fetchPosts]);

  // Otimização: keyExtractor memoizado
  const keyExtractor = useCallback((item: Post) => item.id.toString(), []);

  // Otimização: renderItem memoizado
  const renderItem = useCallback(
    ({ item, index }: { item: Post; index: number }) => (
      <PostCard
        id={item.id}
        title={item.Title}
        content={item.Content}
        author={item.author?.name || 'Autor desconhecido'}
        createdAt={formatDate(item.createdAt || new Date().toISOString())}
        canEdit={isProfessor}
        onPress={() => navigation.navigate('PostDetail', { post: item })}
        onEdit={() => navigation.navigate('EditPost', { post: item })}
        onDelete={() => handleDelete(item.id)}
        style={[
          styles.postCard,
          numColumns > 1 && {
            flex: 1,
            marginHorizontal: spacing.xs,
            maxWidth: numColumns === 2 ? '48%' : '31%',
          },
        ]}
        index={index}
      />
    ),
    [isProfessor, navigation, handleDelete, numColumns]
  );

  // Otimização: getItemLayout para melhor performance
  const ITEM_HEIGHT = 200; // Altura aproximada do card
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScreenLayout scrollable={false} withPadding={true}>
      {posts.length === 0 ? (
        <EmptyState
          icon="post"
          title="Nenhum post encontrado"
          message="Crie seu primeiro post para começar"
          actionLabel="Criar Post"
          onActionPress={() => navigation.navigate('CreatePost')}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={keyExtractor}
          key={numColumns} // Forçar re-render quando numColumns muda
          numColumns={numColumns}
          renderItem={renderItem}
          // Otimizações de performance
          getItemLayout={numColumns === 1 ? getItemLayout : undefined}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={10}
          initialNumToRender={10}
          // Estilo e refresh
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
              progressBackgroundColor={theme.colors.surface}
            />
          }
        />
      )}

      {/* FAB para criar post */}
      <FAB
        icon="plus"
        onPress={() => navigation.navigate('CreatePost')}
        style={styles.fab}
      />

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        visible={showDeleteDialog}
        title="Confirmar exclusão"
        message="Deseja realmente excluir este post?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        destructive={true}
        loading={isDeleting}
        onConfirm={confirmDelete}
        onDismiss={() => {
          setShowDeleteDialog(false);
          setPostToDelete(null);
        }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.xl + 56, // padding extra para o FAB
  },
  postCard: {
    marginBottom: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
});
