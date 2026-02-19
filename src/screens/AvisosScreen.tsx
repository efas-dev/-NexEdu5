/**
 * AvisosScreen
 *
 * Tela de gerenciamento de avisos/mensagens (Professor/Admin)
 * - Lista avisos enviados
 * - Cria novos avisos para turma ou global
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  FAB,
  Portal,
  Modal,
  Divider,
  ActivityIndicator,
  SegmentedButtons,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Message, MessageCategoria } from '../types/Message';
import { Turma } from '../types/Turma';
import { getSentMessages, sendTurmaMessage, sendGlobalMessage } from '../services/messageService';
import { getTurmas } from '../services/turmaService';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import { ScreenLayout } from '../components/layouts/ScreenLayout';
import { EmptyState } from '../components/shared/EmptyState';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius, typography } from '../theme/tokens';

const CATEGORIAS: { value: MessageCategoria; label: string; icon: string }[] = [
  { value: 'AVISO', label: 'Aviso', icon: 'bell' },
  { value: 'EVENTO', label: 'Evento', icon: 'calendar-star' },
  { value: 'FERIADO', label: 'Feriado', icon: 'calendar-remove' },
];

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AvisosScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [sending, setSending] = useState(false);

  // Form state
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tipo, setTipo] = useState<'TURMA' | 'GERAL'>('TURMA');
  const [categoria, setCategoria] = useState<MessageCategoria>('AVISO');
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('');
  const [turmaMenuVisible, setTurmaMenuVisible] = useState(false);

  const { user } = useAuth();
  const theme = useTheme();
  const { showSuccess, showError } = useSnackbar();

  const isAdmin = user?.role === 'ADMIN';

  const fetchMessages = useCallback(async () => {
    try {
      const data = await getSentMessages();
      setMessages(data.mensagens || []);
    } catch (error: any) {
      showError('Erro ao carregar avisos');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const fetchTurmas = useCallback(async () => {
    try {
      const data = await getTurmas();
      setTurmas(data);
      if (data.length > 0) {
        setSelectedTurmaId(String(data[0].id));
      }
    } catch (error: any) {
      // silencioso
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    fetchTurmas();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  }, [fetchMessages]);

  const resetForm = useCallback(() => {
    setTitulo('');
    setConteudo('');
    setTipo('TURMA');
    setCategoria('AVISO');
    if (turmas.length > 0) setSelectedTurmaId(String(turmas[0].id));
    setTurmaMenuVisible(false);
  }, [turmas]);

  const handleEnviar = useCallback(async () => {
    if (!titulo.trim() || !conteudo.trim()) {
      showError('Preencha o título e o conteúdo');
      return;
    }
    if (tipo === 'TURMA' && !selectedTurmaId) {
      showError('Selecione uma turma');
      return;
    }

    setSending(true);
    try {
      if (tipo === 'GERAL') {
        await sendGlobalMessage({ titulo: titulo.trim(), conteudo: conteudo.trim(), categoria });
      } else {
        await sendTurmaMessage({
          titulo: titulo.trim(),
          conteudo: conteudo.trim(),
          turmaId: parseInt(selectedTurmaId),
          categoria,
        });
      }
      showSuccess('Aviso enviado com sucesso!');
      resetForm();
      setModalVisible(false);
      fetchMessages();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Erro ao enviar aviso');
    } finally {
      setSending(false);
    }
  }, [titulo, conteudo, tipo, selectedTurmaId, categoria, showSuccess, showError, resetForm, fetchMessages]);

  const getCategoriaInfo = (cat?: string) => {
    return CATEGORIAS.find(c => c.value === cat) || CATEGORIAS[0];
  };

  const selectedTurmaLabel = useMemo(() => {
    const turma = turmas.find(t => String(t.id) === selectedTurmaId);
    return turma ? `${turma.nome} - ${turma.serie}` : 'Selecione uma turma';
  }, [turmas, selectedTurmaId]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const catInfo = getCategoriaInfo(item.categoria);
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedMessage(item);
          setDetailVisible(true);
        }}
        activeOpacity={0.75}
      >
        <Surface style={[styles.messageCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={[styles.catIcon, { backgroundColor: theme.colors.primaryContainer }]}>
            <Icon name={catInfo.icon} size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.messageBody}>
            <View style={styles.messageTitle}>
              <Text
                variant="bodyLarge"
                style={[styles.messageTitleText, { color: theme.colors.onSurface }]}
                numberOfLines={1}
              >
                {item.titulo}
              </Text>
              <View style={[styles.tipoBadge, { backgroundColor: theme.colors.secondaryContainer }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>
                  {item.tipo === 'GERAL' ? 'Global' : item.turma?.nome || 'Turma'}
                </Text>
              </View>
            </View>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
              numberOfLines={2}
            >
              {item.conteudo}
            </Text>
            <View style={styles.messageMeta}>
              <View style={[styles.catBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {catInfo.label}
                </Text>
              </View>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
        </Surface>
      </TouchableOpacity>
    );
  }, [theme]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScreenLayout scrollable={false} withPadding={false}>
      {messages.length === 0 ? (
        <EmptyState
          icon="bell-off"
          title="Nenhum aviso enviado"
          message="Crie seu primeiro aviso para os pais dos alunos"
          actionLabel="Criar Aviso"
          onActionPress={() => setModalVisible(true)}
        />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={renderMessage}
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
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <FAB
        icon="plus"
        onPress={() => setModalVisible(true)}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
      />

      {/* Modal - Criar Aviso */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            if (!sending) {
              resetForm();
              setModalVisible(false);
            }
          }}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Novo Aviso
          </Text>

          {/* Categoria */}
          <Text variant="labelLarge" style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
            Categoria
          </Text>
          <View style={styles.categoriaRow}>
            {CATEGORIAS.map(cat => (
              <TouchableOpacity
                key={cat.value}
                onPress={() => setCategoria(cat.value)}
                style={[
                  styles.catOption,
                  {
                    borderColor: categoria === cat.value ? theme.colors.primary : theme.colors.outline,
                    backgroundColor: categoria === cat.value ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                  },
                ]}
              >
                <Icon
                  name={cat.icon}
                  size={18}
                  color={categoria === cat.value ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="labelMedium"
                  style={{ color: categoria === cat.value ? theme.colors.primary : theme.colors.onSurfaceVariant }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tipo (apenas Admin vê GERAL) */}
          {isAdmin && (
            <>
              <Text variant="labelLarge" style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
                Destinatários
              </Text>
              <SegmentedButtons
                value={tipo}
                onValueChange={v => setTipo(v as 'TURMA' | 'GERAL')}
                buttons={[
                  { value: 'TURMA', label: 'Turma', icon: 'account-group' },
                  { value: 'GERAL', label: 'Todos os Pais', icon: 'earth' },
                ]}
                style={styles.segmented}
              />
            </>
          )}

          {/* Seleção de Turma */}
          {tipo === 'TURMA' && (
            <>
              <Text variant="labelLarge" style={[styles.fieldLabel, { color: theme.colors.onSurface }]}>
                Turma
              </Text>
              <View>
                <TouchableOpacity
                  style={[styles.selector, {
                    borderColor: theme.colors.outline,
                    backgroundColor: theme.colors.surfaceVariant,
                  }]}
                  onPress={() => setTurmaMenuVisible(!turmaMenuVisible)}
                >
                  <Icon name="school" size={18} color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={[{ flex: 1, color: theme.colors.onSurface }]}>
                    {selectedTurmaLabel}
                  </Text>
                  <Icon name={turmaMenuVisible ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
                {turmaMenuVisible && (
                  <Surface style={[styles.dropdown, { backgroundColor: theme.colors.surface }]} elevation={4}>
                    {turmas.map(turma => (
                      <TouchableOpacity
                        key={turma.id}
                        style={[
                          styles.dropdownItem,
                          String(turma.id) === selectedTurmaId && { backgroundColor: theme.colors.primaryContainer },
                        ]}
                        onPress={() => {
                          setSelectedTurmaId(String(turma.id));
                          setTurmaMenuVisible(false);
                        }}
                      >
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                          {turma.nome} - {turma.serie}
                        </Text>
                        {String(turma.id) === selectedTurmaId && (
                          <Icon name="check" size={18} color={theme.colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </Surface>
                )}
              </View>
            </>
          )}

          {/* Título */}
          <Input
            label="Título"
            value={titulo}
            onChangeText={setTitulo}
            disabled={sending}
            left={<Input.Icon icon="format-title" />}
            style={styles.formInput}
          />

          {/* Conteúdo */}
          <TextArea
            label="Conteúdo"
            value={conteudo}
            onChangeText={setConteudo}
            disabled={sending}
            numberOfLines={4}
            style={styles.formTextArea}
          />

          {/* Botões */}
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                resetForm();
                setModalVisible(false);
              }}
              disabled={sending}
              style={styles.cancelBtn}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleEnviar}
              loading={sending}
              disabled={sending}
              icon="send"
              style={styles.sendBtn}
            >
              Enviar
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Modal - Detalhe */}
      <Portal>
        <Modal
          visible={detailVisible}
          onDismiss={() => setDetailVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          {selectedMessage && (
            <>
              <View style={styles.detailHeader}>
                <View style={[styles.catIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Icon
                    name={getCategoriaInfo(selectedMessage.categoria).icon}
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                    {selectedMessage.titulo}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {formatDate(selectedMessage.createdAt)} •{' '}
                    {selectedMessage.tipo === 'GERAL' ? 'Global' : selectedMessage.turma?.nome}
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium" style={[styles.detailContent, { color: theme.colors.onSurface }]}>
                {selectedMessage.conteudo}
              </Text>
              <Button
                mode="contained"
                onPress={() => setDetailVisible(false)}
                style={styles.closeBtn}
              >
                Fechar
              </Button>
            </>
          )}
        </Modal>
      </Portal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl + 56,
    gap: spacing.sm,
  },
  messageCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBody: {
    flex: 1,
    gap: spacing.xs,
  },
  messageTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  messageTitleText: {
    fontWeight: '600',
    flex: 1,
  },
  tipoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  catBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    borderRadius: borderRadius.xl,
  },
  modal: {
    margin: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontWeight: '600',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  categoriaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  catOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  segmented: {
    marginBottom: spacing.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  dropdown: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  formInput: {
    marginTop: spacing.sm,
  },
  formTextArea: {
    marginTop: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
  },
  sendBtn: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  divider: {
    marginBottom: spacing.md,
  },
  detailContent: {
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  closeBtn: {
    borderRadius: borderRadius.lg,
  },
});
