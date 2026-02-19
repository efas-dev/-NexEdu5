/**
 * ChamadaScreen
 *
 * Tela de registro de frequência dos alunos por turma e data (Professor)
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Surface,
  ActivityIndicator,
  Divider,
  Menu,
  Button as PaperButton,
  IconButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Turma, AlunoTurma } from '../types/Turma';
import { AttendanceRecord } from '../types/Attendance';
import { getTurmas, getTurmaAlunos } from '../services/turmaService';
import { getAttendanceByTurmaAndDate, saveBulkAttendance } from '../services/attendanceService';
import { useSnackbar } from '../context/SnackbarContext';
import { ScreenLayout } from '../components/layouts/ScreenLayout';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/ui/Button';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius, typography } from '../theme/tokens';

// Utilitário de data
const formatDateDisplay = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const toISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function ChamadaScreen() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [alunos, setAlunos] = useState<AlunoTurma[]>([]);
  const [attendance, setAttendance] = useState<Record<number, AttendanceRecord>>({});
  const [loadingTurmas, setLoadingTurmas] = useState(true);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const theme = useTheme();
  const { showSuccess, showError } = useSnackbar();

  // Carregar turmas
  const fetchTurmas = useCallback(async () => {
    try {
      const data = await getTurmas();
      setTurmas(data);
      if (data.length > 0 && !selectedTurma) {
        setSelectedTurma(data[0]);
      }
    } catch (error: any) {
      showError('Erro ao carregar turmas');
    } finally {
      setLoadingTurmas(false);
    }
  }, []);

  // Carregar alunos e presenças existentes
  const fetchAlunosAndAttendance = useCallback(async (turma: Turma, date: Date) => {
    setLoadingAlunos(true);
    try {
      const [alunosData, attendanceData] = await Promise.all([
        getTurmaAlunos(turma.id),
        getAttendanceByTurmaAndDate(turma.id, toISODate(date)).catch(() => null),
      ]);

      setAlunos(alunosData);

      // Inicializar attendance: todos presentes por padrão
      const initialAttendance: Record<number, AttendanceRecord> = {};
      alunosData.forEach((aluno: AlunoTurma) => {
        initialAttendance[aluno.id] = { alunoId: aluno.id, presente: true };
      });

      // Aplicar presenças existentes se houver
      if (attendanceData?.presencas && attendanceData.presencas.length > 0) {
        attendanceData.presencas.forEach((p: { alunoId: number; presente: boolean; justificativa?: string }) => {
          initialAttendance[p.alunoId] = {
            alunoId: p.alunoId,
            presente: p.presente,
            justificativa: p.justificativa,
          };
        });
      }

      setAttendance(initialAttendance);
    } catch (error: any) {
      showError('Erro ao carregar dados da turma');
    } finally {
      setLoadingAlunos(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchTurmas();
  }, []);

  useEffect(() => {
    if (selectedTurma) {
      fetchAlunosAndAttendance(selectedTurma, selectedDate);
    }
  }, [selectedTurma, selectedDate]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedTurma) {
      await fetchAlunosAndAttendance(selectedTurma, selectedDate);
    }
    setRefreshing(false);
  }, [selectedTurma, selectedDate, fetchAlunosAndAttendance]);

  const togglePresenca = useCallback((alunoId: number) => {
    setAttendance(prev => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        presente: !prev[alunoId]?.presente,
      },
    }));
  }, []);

  const marcarTodosPresentes = useCallback(() => {
    const newAttendance: Record<number, AttendanceRecord> = {};
    alunos.forEach(aluno => {
      newAttendance[aluno.id] = { alunoId: aluno.id, presente: true };
    });
    setAttendance(newAttendance);
  }, [alunos]);

  const marcarTodosAusentes = useCallback(() => {
    const newAttendance: Record<number, AttendanceRecord> = {};
    alunos.forEach(aluno => {
      newAttendance[aluno.id] = { alunoId: aluno.id, presente: false };
    });
    setAttendance(newAttendance);
  }, [alunos]);

  const navegarDia = useCallback((direcao: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direcao === 'next' ? 1 : -1));
      return newDate;
    });
  }, []);

  const salvarChamada = useCallback(async () => {
    if (!selectedTurma) return;

    setSaving(true);
    try {
      const presencas = Object.values(attendance).map(a => ({
        alunoId: a.alunoId,
        presente: a.presente,
        justificativa: a.justificativa || null,
      }));

      await saveBulkAttendance({
        turmaId: selectedTurma.id,
        data: toISODate(selectedDate),
        presencas,
      });

      showSuccess('Chamada salva com sucesso!');
    } catch (error: any) {
      showError(error.response?.data?.error || 'Erro ao salvar chamada');
    } finally {
      setSaving(false);
    }
  }, [selectedTurma, selectedDate, attendance, showSuccess, showError]);

  const presentesCount = useMemo(
    () => Object.values(attendance).filter(a => a.presente).length,
    [attendance]
  );
  const ausentesCount = useMemo(
    () => Object.values(attendance).filter(a => !a.presente).length,
    [attendance]
  );

  const turnoLabel = (turno: string) => {
    const labels: Record<string, string> = { MANHA: 'Manhã', TARDE: 'Tarde', NOITE: 'Noite' };
    return labels[turno] || turno;
  };

  if (loadingTurmas) {
    return <LoadingScreen />;
  }

  if (turmas.length === 0) {
    return (
      <ScreenLayout>
        <EmptyState
          icon="school"
          title="Nenhuma turma encontrada"
          message="Você ainda não está associado a nenhuma turma"
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
        {/* Seleção de Turma */}
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Text variant="titleSmall" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
            TURMA
          </Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={[styles.selector, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => setMenuVisible(true)}
              >
                <Icon name="school" size={20} color={theme.colors.primary} />
                <Text variant="bodyLarge" style={[styles.selectorText, { color: theme.colors.onSurface }]}>
                  {selectedTurma
                    ? `${selectedTurma.nome} - ${selectedTurma.serie} (${turnoLabel(selectedTurma.turno)})`
                    : 'Selecione uma turma'}
                </Text>
                <Icon name="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            }
          >
            {turmas.map(turma => (
              <Menu.Item
                key={turma.id}
                onPress={() => {
                  setSelectedTurma(turma);
                  setMenuVisible(false);
                }}
                title={`${turma.nome} - ${turma.serie} (${turnoLabel(turma.turno)})`}
                leadingIcon={selectedTurma?.id === turma.id ? 'check' : 'school-outline'}
              />
            ))}
          </Menu>
        </Surface>

        {/* Navegação de Data */}
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Text variant="titleSmall" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
            DATA
          </Text>
          <View style={styles.dateNav}>
            <IconButton
              icon="chevron-left"
              size={24}
              onPress={() => navegarDia('prev')}
              iconColor={theme.colors.primary}
            />
            <View style={styles.dateCenter}>
              <Text variant="headlineSmall" style={[styles.dateText, { color: theme.colors.onSurface }]}>
                {formatDateDisplay(selectedDate)}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {DIAS_SEMANA[selectedDate.getDay()]}
              </Text>
            </View>
            <IconButton
              icon="chevron-right"
              size={24}
              onPress={() => navegarDia('next')}
              iconColor={theme.colors.primary}
            />
          </View>
        </Surface>

        {/* Lista de Alunos */}
        {selectedTurma && (
          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            {/* Header com contadores e ações rápidas */}
            <View style={styles.listHeader}>
              <View>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  Lista de Alunos
                </Text>
                {!loadingAlunos && alunos.length > 0 && (
                  <View style={styles.counters}>
                    <View style={styles.counterBadge}>
                      <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {presentesCount} presentes
                      </Text>
                    </View>
                    <View style={styles.counterBadge}>
                      <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {ausentesCount} ausentes
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {!loadingAlunos && alunos.length > 0 && (
                <View style={styles.quickActions}>
                  <PaperButton
                    mode="outlined"
                    compact
                    icon="check-all"
                    onPress={marcarTodosPresentes}
                    style={styles.quickBtn}
                    labelStyle={styles.quickBtnLabel}
                  >
                    Todos
                  </PaperButton>
                  <PaperButton
                    mode="outlined"
                    compact
                    icon="close-circle-outline"
                    onPress={marcarTodosAusentes}
                    style={[styles.quickBtn, { borderColor: theme.colors.error }]}
                    labelStyle={[styles.quickBtnLabel, { color: theme.colors.error }]}
                  >
                    Nenhum
                  </PaperButton>
                </View>
              )}
            </View>

            <Divider style={styles.divider} />

            {loadingAlunos ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator animating color={theme.colors.primary} size="large" />
                <Text variant="bodyMedium" style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
                  Carregando alunos...
                </Text>
              </View>
            ) : alunos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="account-off" size={40} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  Nenhum aluno nesta turma
                </Text>
              </View>
            ) : (
              <>
                {alunos.map((aluno, index) => {
                  const isPresente = attendance[aluno.id]?.presente ?? true;
                  return (
                    <React.Fragment key={aluno.id}>
                      {index > 0 && <Divider />}
                      <TouchableOpacity
                        onPress={() => togglePresenca(aluno.id)}
                        style={[
                          styles.alunoItem,
                          {
                            backgroundColor: isPresente
                              ? theme.dark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)'
                              : theme.dark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.presencaIcon,
                            { backgroundColor: isPresente ? '#10B981' : '#EF4444' },
                          ]}
                        >
                          <Icon
                            name={isPresente ? 'check' : 'close'}
                            size={18}
                            color="#FFFFFF"
                          />
                        </View>
                        <View style={styles.alunoInfo}>
                          <Text
                            variant="bodyLarge"
                            style={[styles.alunoNome, { color: theme.colors.onSurface }]}
                          >
                            {aluno.name}
                          </Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            @{aluno.login}
                          </Text>
                        </View>
                        <Text
                          variant="labelMedium"
                          style={{
                            color: isPresente ? '#10B981' : '#EF4444',
                            fontWeight: '600',
                          }}
                        >
                          {isPresente ? 'Presente' : 'Ausente'}
                        </Text>
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })}

                {/* Botão Salvar */}
                <View style={styles.saveContainer}>
                  <Button
                    mode="contained"
                    onPress={salvarChamada}
                    loading={saving}
                    disabled={saving || alunos.length === 0}
                    icon="content-save"
                    style={styles.saveButton}
                  >
                    Salvar Chamada
                  </Button>
                </View>
              </>
            )}
          </Surface>
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
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  selectorText: {
    flex: 1,
    fontSize: typography.fontSize.base,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateCenter: {
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    fontWeight: '700',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  counters: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  quickBtn: {
    borderRadius: borderRadius.md,
  },
  quickBtnLabel: {
    fontSize: 11,
  },
  divider: {
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  loadingText: {
    marginTop: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyText: {
    textAlign: 'center',
  },
  alunoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  presencaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alunoInfo: {
    flex: 1,
  },
  alunoNome: {
    fontWeight: '500',
  },
  saveContainer: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  saveButton: {
    borderRadius: borderRadius.lg,
  },
});
