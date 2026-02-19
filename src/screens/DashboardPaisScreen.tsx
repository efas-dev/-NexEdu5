/**
 * DashboardPaisScreen
 *
 * Dashboard principal para Pais/Responsáveis
 * Mostra resumo dos filhos, frequência e mensagens não lidas
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import { ParentDashboardData } from '../types/Message';
import { getParentDashboard } from '../services/parentService';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { ScreenLayout } from '../components/layouts/ScreenLayout';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius, typography } from '../theme/tokens';

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getFrequenciaColor = (pct: number) => {
  if (pct >= 90) return '#10B981';
  if (pct >= 75) return '#F59E0B';
  return '#EF4444';
};

const getFrequenciaIcon = (pct: number) => {
  if (pct >= 90) return 'check-circle';
  if (pct >= 75) return 'alert-circle';
  return 'close-circle';
};

export default function DashboardPaisScreen() {
  const [data, setData] = useState<ParentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();
  const theme = useTheme();
  const { showError } = useSnackbar();
  const navigation = useNavigation<any>();

  const fetchDashboard = useCallback(async () => {
    try {
      const dashboardData = await getParentDashboard();
      setData(dashboardData);
    } catch (error: any) {
      showError('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  }, [fetchDashboard]);

  const primeiroNome = user?.name?.split(' ')[0] || 'Responsável';

  const mediaFrequencia = data && data.filhos.length > 0
    ? data.filhos.reduce((acc, f) => acc + f.frequencia.percentual, 0) / data.filhos.length
    : null;

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
        {/* Saudação */}
        <View style={styles.greeting}>
          <Text variant="headlineMedium" style={[styles.greetingTitle, { color: theme.colors.onBackground }]}>
            Olá, {primeiroNome}!
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Acompanhe o resumo escolar
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator animating size="large" color={theme.colors.primary} />
          </View>
        ) : !data ? (
          <Surface style={[styles.errorCard, { backgroundColor: theme.colors.errorContainer }]} elevation={1}>
            <Icon name="alert-circle" size={32} color={theme.colors.error} />
            <Text variant="bodyLarge" style={{ color: theme.colors.onErrorContainer }}>
              Erro ao carregar dados
            </Text>
          </Surface>
        ) : (
          <>
            {/* Cards de resumo */}
            <View style={styles.summaryRow}>
              {/* Total de filhos */}
              <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <View style={[styles.summaryIconBg, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Icon name="account-child" size={22} color={theme.colors.primary} />
                </View>
                <Text variant="headlineMedium" style={[styles.summaryValue, { color: theme.colors.primary }]}>
                  {data.filhos.length}
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                  {data.filhos.length === 1 ? 'Filho' : 'Filhos'}
                </Text>
              </Surface>

              {/* Mensagens não lidas */}
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => navigation.getParent()?.navigate('MeusAvisosTab')}
                activeOpacity={0.8}
              >
                <Surface
                  style={[
                    styles.summaryCard,
                    {
                      backgroundColor: data.mensagens.naoLidas > 0
                        ? theme.dark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'
                        : theme.colors.surface,
                      borderWidth: data.mensagens.naoLidas > 0 ? 1.5 : 0,
                      borderColor: data.mensagens.naoLidas > 0 ? theme.colors.primary : 'transparent',
                    },
                  ]}
                  elevation={data.mensagens.naoLidas > 0 ? 2 : 1}
                >
                  <View style={[styles.summaryIconBg, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Icon name="email" size={22} color={theme.colors.primary} />
                  </View>
                  <Text
                    variant="headlineMedium"
                    style={[styles.summaryValue, { color: theme.colors.primary }]}
                  >
                    {data.mensagens.naoLidas}
                  </Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                    Não lidos
                  </Text>
                </Surface>
              </TouchableOpacity>

              {/* Frequência média */}
              <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <View style={[styles.summaryIconBg, { backgroundColor: theme.colors.tertiaryContainer || theme.colors.secondaryContainer }]}>
                  <Icon name="trending-up" size={22} color={theme.colors.tertiary || theme.colors.secondary} />
                </View>
                <Text
                  variant="headlineMedium"
                  style={[styles.summaryValue, { color: mediaFrequencia !== null ? getFrequenciaColor(mediaFrequencia) : theme.colors.onSurface }]}
                >
                  {mediaFrequencia !== null ? `${mediaFrequencia.toFixed(0)}%` : '—'}
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                  Frequência
                </Text>
              </Surface>
            </View>

            {/* Filhos */}
            <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                  Meus Filhos
                </Text>
                <TouchableOpacity onPress={() => navigation.getParent()?.navigate('MeusFilhosTab')}>
                  <View style={styles.verMaisBtn}>
                    <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                      Ver detalhes
                    </Text>
                    <Icon name="arrow-right" size={16} color={theme.colors.primary} />
                  </View>
                </TouchableOpacity>
              </View>
              <Divider style={styles.divider} />

              {data.filhos.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="account-off" size={32} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Nenhum filho vinculado
                  </Text>
                </View>
              ) : (
                data.filhos.map((filho, index) => {
                  const freqColor = getFrequenciaColor(filho.frequencia.percentual);
                  const freqIcon = getFrequenciaIcon(filho.frequencia.percentual);
                  return (
                    <React.Fragment key={filho.id}>
                      {index > 0 && <Divider />}
                      <View style={styles.filhoItem}>
                        <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primaryContainer }]}>
                          <Icon name="account-school" size={22} color={theme.colors.primary} />
                        </View>
                        <View style={styles.filhoInfo}>
                          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                            {filho.name}
                          </Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {filho.turmasAluno[0]?.turma?.nome
                              ? `${filho.turmasAluno[0].turma.nome} • ${filho.turmasAluno[0].turma.serie}`
                              : 'Sem turma'}
                          </Text>
                        </View>
                        <View style={styles.freqBadge}>
                          <Icon name={freqIcon} size={16} color={freqColor} />
                          <Text variant="labelLarge" style={{ color: freqColor, fontWeight: '700' }}>
                            {filho.frequencia.percentual.toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                    </React.Fragment>
                  );
                })
              )}
            </Surface>

            {/* Últimas mensagens */}
            <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                  Últimos Avisos
                </Text>
                <TouchableOpacity onPress={() => navigation.getParent()?.navigate('MeusAvisosTab')}>
                  <View style={styles.verMaisBtn}>
                    <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                      Ver todos
                    </Text>
                    <Icon name="arrow-right" size={16} color={theme.colors.primary} />
                  </View>
                </TouchableOpacity>
              </View>
              <Divider style={styles.divider} />

              {data.mensagens.ultimas.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="email-off" size={32} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Nenhum aviso recebido
                  </Text>
                </View>
              ) : (
                data.mensagens.ultimas.map((msg, index) => (
                  <React.Fragment key={msg.id}>
                    {index > 0 && <Divider />}
                    <View
                      style={[
                        styles.msgItem,
                        !msg.lida && {
                          backgroundColor: theme.dark
                            ? 'rgba(99, 102, 241, 0.1)'
                            : 'rgba(99, 102, 241, 0.05)',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.mailIconSmall,
                          {
                            backgroundColor: !msg.lida
                              ? theme.colors.primaryContainer
                              : theme.colors.surfaceVariant,
                          },
                        ]}
                      >
                        <Icon
                          name={msg.lida ? 'email-open' : 'email'}
                          size={16}
                          color={!msg.lida ? theme.colors.primary : theme.colors.onSurfaceVariant}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          variant="bodyMedium"
                          style={{
                            color: theme.colors.onSurface,
                            fontWeight: !msg.lida ? '600' : '400',
                          }}
                          numberOfLines={1}
                        >
                          {msg.titulo}
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={{ color: theme.colors.onSurfaceVariant }}
                          numberOfLines={1}
                        >
                          {msg.conteudo}
                        </Text>
                      </View>
                    </View>
                  </React.Fragment>
                ))
              )}
            </Surface>

            {/* Alertas de faltas */}
            {data.filhos.some(f => f.ultimaFalta) && (
              <Surface style={[styles.alertCard, { backgroundColor: theme.dark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)', borderColor: '#F59E0B' }]} elevation={0}>
                <View style={styles.alertHeader}>
                  <Icon name="alert" size={20} color="#F59E0B" />
                  <Text variant="titleSmall" style={{ color: '#F59E0B', fontWeight: '700' }}>
                    Faltas Recentes
                  </Text>
                </View>
                {data.filhos
                  .filter(f => f.ultimaFalta)
                  .map(filho => (
                    <View key={filho.id} style={styles.alertItem}>
                      <Icon name="calendar-remove" size={16} color="#F59E0B" />
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                        <Text style={{ fontWeight: '600' }}>{filho.name}</Text> — última falta em{' '}
                        {formatDate(filho.ultimaFalta!)}
                      </Text>
                    </View>
                  ))}
              </Surface>
            )}
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
  greeting: {
    paddingVertical: spacing.sm,
  },
  greetingTitle: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  loadingCenter: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  errorCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontWeight: '700',
  },
  section: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  verMaisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  divider: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  filhoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filhoInfo: {
    flex: 1,
  },
  freqBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  msgItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  mailIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
});
