/**
 * MeusFilhosScreen
 *
 * Tela de acompanhamento de frequência dos filhos (PAI/Responsável)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Surface,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { FilhoDetalhado, getParentChildren, getChildAttendance } from '../services/parentService';
import { PresencaRegistro, FrequenciaStats } from '../types/Attendance';
import { useSnackbar } from '../context/SnackbarContext';
import { ScreenLayout } from '../components/layouts/ScreenLayout';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { EmptyState } from '../components/shared/EmptyState';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius, typography } from '../theme/tokens';

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getFreqColor = (pct: number) => {
  if (pct >= 90) return '#10B981';
  if (pct >= 75) return '#F59E0B';
  return '#EF4444';
};

export default function MeusFilhosScreen() {
  const [filhos, setFilhos] = useState<FilhoDetalhado[]>([]);
  const [selectedFilhoId, setSelectedFilhoId] = useState<number | null>(null);
  const [frequencia, setFrequencia] = useState<PresencaRegistro[]>([]);
  const [stats, setStats] = useState<FrequenciaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFrequencia, setLoadingFrequencia] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const theme = useTheme();
  const { showError } = useSnackbar();

  const fetchFilhos = useCallback(async () => {
    try {
      const data = await getParentChildren();
      setFilhos(data);
      if (data.length > 0 && selectedFilhoId === null) {
        setSelectedFilhoId(data[0].id);
      }
    } catch (error: any) {
      showError('Erro ao carregar filhos');
    } finally {
      setLoading(false);
    }
  }, [showError, selectedFilhoId]);

  const fetchFrequencia = useCallback(async (filhoId: number) => {
    setLoadingFrequencia(true);
    try {
      const data = await getChildAttendance(filhoId);
      setFrequencia(data.frequencia || []);
      setStats(data.estatisticas || null);
    } catch (error: any) {
      showError('Erro ao carregar frequência');
    } finally {
      setLoadingFrequencia(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchFilhos();
  }, []);

  useEffect(() => {
    if (selectedFilhoId !== null) {
      fetchFrequencia(selectedFilhoId);
    }
  }, [selectedFilhoId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFilhos();
    if (selectedFilhoId !== null) {
      await fetchFrequencia(selectedFilhoId);
    }
    setRefreshing(false);
  }, [fetchFilhos, fetchFrequencia, selectedFilhoId]);

  const filhoSelecionado = filhos.find(f => f.id === selectedFilhoId);

  const renderPresenca = useCallback(({ item }: { item: PresencaRegistro }) => (
    <Surface
      style={[
        styles.presencaCard,
        {
          backgroundColor: item.presente
            ? theme.dark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)'
            : theme.dark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
          borderLeftWidth: 4,
          borderLeftColor: item.presente ? '#10B981' : '#EF4444',
        },
      ]}
      elevation={0}
    >
      <View style={styles.presencaLeft}>
        <Icon
          name={item.presente ? 'check-circle' : 'close-circle'}
          size={24}
          color={item.presente ? '#10B981' : '#EF4444'}
        />
        <View>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
            {formatDate(item.data)}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {item.turma.nome} — {item.turma.serie}
          </Text>
          {item.justificativa && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic' }}>
              {item.justificativa}
            </Text>
          )}
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.presente ? '#10B981' : '#EF4444' }]}>
        <Text variant="labelSmall" style={{ color: '#FFFFFF', fontWeight: '700' }}>
          {item.presente ? 'Presente' : 'Ausente'}
        </Text>
      </View>
    </Surface>
  ), [theme]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (filhos.length === 0) {
    return (
      <ScreenLayout>
        <EmptyState
          icon="account-off"
          title="Nenhum filho vinculado"
          message="Sua conta não possui filhos vinculados"
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable={false} withPadding={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Seletor de filho */}
        <Surface style={[styles.selectorCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Text variant="labelMedium" style={[styles.selectorLabel, { color: theme.colors.onSurfaceVariant }]}>
            SELECIONAR FILHO
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filhosScroll}>
            {filhos.map(filho => {
              const isSelected = selectedFilhoId === filho.id;
              return (
                <TouchableOpacity
                  key={filho.id}
                  onPress={() => setSelectedFilhoId(filho.id)}
                  style={[
                    styles.filhoChip,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceVariant,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Icon
                    name="account-school"
                    size={16}
                    color={isSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                  />
                  <Text
                    variant="labelMedium"
                    style={{ color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface }}
                  >
                    {filho.name.split(' ')[0]}
                  </Text>
                  {filho.principal && (
                    <Icon
                      name="star"
                      size={12}
                      color={isSelected ? theme.colors.onPrimary : '#F59E0B'}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Surface>

        {/* Estatísticas do filho selecionado */}
        {filhoSelecionado && (
          <>
            <Surface style={[styles.filhoHeader, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
              <View style={styles.filhoHeaderContent}>
                <View style={[styles.avatarLarge, { backgroundColor: theme.colors.primary }]}>
                  <Icon name="account-school" size={28} color={theme.colors.onPrimary} />
                </View>
                <View>
                  <Text variant="titleLarge" style={{ color: theme.colors.onPrimaryContainer, fontWeight: '700' }}>
                    {filhoSelecionado.name}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer + 'CC' }}>
                    {filhoSelecionado.parentesco}
                    {filhoSelecionado.principal ? ' • Principal' : ''}
                  </Text>
                </View>
              </View>
            </Surface>

            {/* Stats cards */}
            {stats && (
              <View style={styles.statsRow}>
                <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                  <Icon name="calendar-check" size={20} color={theme.colors.primary} />
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                    {stats.totalAulas}
                  </Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                    Total Aulas
                  </Text>
                </Surface>
                <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                  <Icon name="check-circle" size={20} color="#10B981" />
                  <Text variant="titleMedium" style={{ color: '#10B981', fontWeight: '700' }}>
                    {stats.presencas}
                  </Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                    Presenças
                  </Text>
                </Surface>
                <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                  <Icon name="close-circle" size={20} color="#EF4444" />
                  <Text variant="titleMedium" style={{ color: '#EF4444', fontWeight: '700' }}>
                    {stats.faltas}
                  </Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                    Faltas
                  </Text>
                </Surface>
                <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                  <Icon
                    name="trending-up"
                    size={20}
                    color={getFreqColor(stats.percentualPresenca)}
                  />
                  <Text
                    variant="titleMedium"
                    style={{ color: getFreqColor(stats.percentualPresenca), fontWeight: '700' }}
                  >
                    {stats.percentualPresenca.toFixed(0)}%
                  </Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                    Frequência
                  </Text>
                </Surface>
              </View>
            )}

            {/* Histórico */}
            <Surface style={[styles.historicoSection, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <Text variant="titleMedium" style={[styles.historicoTitle, { color: theme.colors.onSurface }]}>
                Histórico de Frequência
              </Text>
              <Divider style={styles.divider} />

              {loadingFrequencia ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator animating size="small" color={theme.colors.primary} />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Carregando...
                  </Text>
                </View>
              ) : frequencia.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="calendar-blank" size={36} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Nenhum registro de frequência
                  </Text>
                </View>
              ) : (
                <View style={styles.presencaList}>
                  {frequencia.map(registro => (
                    <View key={registro.id}>
                      {renderPresenca({ item: registro })}
                    </View>
                  ))}
                </View>
              )}
            </Surface>
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  selectorCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  selectorLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  filhosScroll: {
    marginHorizontal: -spacing.xs,
  },
  filhoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
  },
  filhoHeader: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  filhoHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  historicoSection: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  historicoTitle: {
    fontWeight: '700',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  divider: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  presencaList: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  presencaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  presencaLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
});
