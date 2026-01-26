/**
 * UserListScreen
 *
 * Tela de listagem de usuários com filtros e gestão (professor apenas)
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, Alert, StyleSheet, RefreshControl } from 'react-native';
import { FAB } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { UsersStackParamList } from '../navigation/AppNavigator';
import { User } from '../types/User';
import { getUsers, deleteUser } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { ScreenLayout } from '../components/layouts/ScreenLayout';
import { UserCard } from '../components/shared/UserCard';
import { FilterChips } from '../components/shared/FilterChips';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { EmptyState } from '../components/shared/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { spacing } from '../theme/tokens';
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../hooks/useResponsive';

type Props = NativeStackScreenProps<UsersStackParamList, 'UserList'>;

type FilterType = 'TODOS' | 'PROFESSOR' | 'ALUNO';

export default function UserListScreen({ navigation }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('TODOS');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user: currentUser } = useAuth();
  const theme = useTheme();
  const { numColumns } = useResponsive();

  // Memoizar counts dos filtros
  const filterCounts = useMemo(() => ({
    todos: users.length,
    professores: users.filter(u => u.role === 'PROFESSOR').length,
    alunos: users.filter(u => u.role === 'ALUNO').length,
  }), [users]);

  const applyFilter = useCallback((data: User[], selectedFilter: FilterType) => {
    if (selectedFilter === 'TODOS') {
      setFilteredUsers(data);
    } else {
      setFilteredUsers(data.filter(u => u.role === selectedFilter));
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
      applyFilter(data, filter);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, [filter, applyFilter]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await getUsers();
      setUsers(data);
      applyFilter(data, filter);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao atualizar usuários');
    } finally {
      setRefreshing(false);
    }
  }, [filter, applyFilter]);

  const handleFilterChange = useCallback((selectedFilter: FilterType) => {
    setFilter(selectedFilter);
    applyFilter(users, selectedFilter);
  }, [users, applyFilter]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchUsers);
    return unsubscribe;
  }, [navigation, fetchUsers]);

  const handleDelete = useCallback((userId: number) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (userToDelete === null) return;

    setIsDeleting(true);
    try {
      await deleteUser(userToDelete);
      setShowDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao excluir usuário');
    } finally {
      setIsDeleting(false);
    }
  }, [userToDelete, fetchUsers]);

  // Otimização: keyExtractor memoizado
  const keyExtractor = useCallback((item: User) => item.id.toString(), []);

  // Otimização: renderItem memoizado
  const renderItem = useCallback(
    ({ item, index }: { item: User; index: number }) => (
      <UserCard
        name={item.name}
        login={item.login}
        role={item.role}
        canEdit={true}
        canDelete={currentUser?.id !== item.id}
        onEdit={() => navigation.navigate('UserForm', { user: item })}
        onDelete={() => handleDelete(item.id)}
        style={[
          styles.userCard,
          numColumns > 1 && {
            flex: 1,
            marginHorizontal: spacing.xs,
            maxWidth: numColumns === 2 ? '48%' : '31%',
          },
        ]}
        index={index}
      />
    ),
    [currentUser?.id, navigation, handleDelete, numColumns]
  );

  // Otimização: getItemLayout para melhor performance
  const ITEM_HEIGHT = 100; // Altura aproximada do card de usuário
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // Memoizar as opções de filtro
  const filterOptions = useMemo(() => [
    { value: 'TODOS' as FilterType, label: 'Todos', count: filterCounts.todos },
    { value: 'PROFESSOR' as FilterType, label: 'Professores', count: filterCounts.professores },
    { value: 'ALUNO' as FilterType, label: 'Alunos', count: filterCounts.alunos },
  ], [filterCounts]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScreenLayout scrollable={false} withPadding={true}>
      {/* Filtros */}
      <FilterChips
        options={filterOptions}
        selected={filter}
        onSelect={handleFilterChange}
        showCount={true}
      />

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon="account-off"
          title="Nenhum usuário encontrado"
          message={`Não há ${filter === 'TODOS' ? 'usuários cadastrados' : filter === 'PROFESSOR' ? 'professores' : 'alunos'} no sistema`}
          actionLabel="Criar Usuário"
          onActionPress={() => navigation.navigate('UserForm', {})}
        />
      ) : (
        <FlatList
          data={filteredUsers}
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

      {/* FAB para criar usuário */}
      <FAB
        icon="plus"
        onPress={() => navigation.navigate('UserForm', {})}
        style={styles.fab}
      />

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        visible={showDeleteDialog}
        title="Confirmar exclusão"
        message="Deseja realmente excluir este usuário?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        destructive={true}
        loading={isDeleting}
        onConfirm={confirmDelete}
        onDismiss={() => {
          setShowDeleteDialog(false);
          setUserToDelete(null);
        }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  filters: {
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xl + 56, // padding extra para o FAB
  },
  userCard: {
    marginBottom: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
});
