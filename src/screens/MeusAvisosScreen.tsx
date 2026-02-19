/**
 * MeusAvisosScreen
 *
 * Caixa de entrada de avisos para Pais/Responsáveis
 */

import React, { useEffect, useState, useCallback } from 'react';
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
  Divider,
  Portal,
  Modal,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { InboxMessage } from '../types/Message';
import { getInboxMessages, markMessageAsRead } from '../services/messageService';
import { useSnackbar } from '../context/SnackbarContext';
import { ScreenLayout } from '../components/layouts/ScreenLayout';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/ui/Button';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius, typography } from '../theme/tokens';

const CATEGORIAS: Record<string, { label: string; icon: string }> = {
  FERIADO: { label: 'Feriado', icon: 'calendar-remove' },
  EVENTO: { label: 'Evento', icon: 'calendar-star' },
  AVISO: { label: 'Aviso', icon: 'bell' },
};

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

export default function MeusAvisosScreen() {
  const [mensagens, setMensagens] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMensagem, setSelectedMensagem] = useState<InboxMessage | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const theme = useTheme();
  const { showError } = useSnackbar();

  const fetchMensagens = useCallback(async () => {
    try {
      const data = await getInboxMessages();
      setMensagens(data.mensagens || []);
    } catch (error: any) {
      showError('Erro ao carregar avisos');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchMensagens();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMensagens();
    setRefreshing(false);
  }, [fetchMensagens]);

  const handleOpen = useCallback(async (mensagem: InboxMessage) => {
    setSelectedMensagem(mensagem);
    setDetailVisible(true);

    if (!mensagem.lida) {
      try {
        await markMessageAsRead(mensagem.id);
        setMensagens(prev =>
          prev.map(m =>
            m.id === mensagem.id
              ? { ...m, lida: true, lidaEm: new Date().toISOString() }
              : m
          )
        );
      } catch {
        // silencioso
      }
    }
  }, []);

  const getCategoriaInfo = (cat?: string) => {
    return CATEGORIAS[cat || 'AVISO'] || CATEGORIAS.AVISO;
  };

  const naoLidas = mensagens.filter(m => !m.lida).length;

  const renderMensagem = useCallback(({ item }: { item: InboxMessage }) => {
    const catInfo = getCategoriaInfo(item.categoria);
    const naoLida = !item.lida;

    return (
      <TouchableOpacity onPress={() => handleOpen(item)} activeOpacity={0.75}>
        <Surface
          style={[
            styles.card,
            {
              backgroundColor: naoLida
                ? theme.dark
                  ? 'rgba(99, 102, 241, 0.15)'
                  : 'rgba(99, 102, 241, 0.06)'
                : theme.colors.surface,
              borderWidth: naoLida ? 1 : 0,
              borderColor: naoLida ? theme.colors.primary + '40' : 'transparent',
            },
          ]}
          elevation={naoLida ? 2 : 1}
        >
          {/* Ícone de leitura */}
          <View
            style={[
              styles.mailIcon,
              {
                backgroundColor: naoLida
                  ? theme.colors.primaryContainer
                  : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Icon
              name={naoLida ? 'email' : 'email-open'}
              size={22}
              color={naoLida ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
          </View>

          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text
                variant={naoLida ? 'titleSmall' : 'bodyLarge'}
                style={[
                  { color: theme.colors.onSurface },
                  naoLida && { fontWeight: '700' },
                ]}
                numberOfLines={1}
              >
                {item.titulo}
              </Text>
              <View style={[styles.catBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name={catInfo.icon} size={12} color={theme.colors.onSurfaceVariant} />
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {catInfo.label}
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

            <View style={styles.cardFooter}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                De: {item.remetente?.name || 'Escola'}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {formatDate(item.createdAt)}
              </Text>
            </View>

            {item.tipo === 'INDIVIDUAL' && item.aluno && (
              <View style={[styles.filhoBadge, { backgroundColor: theme.colors.secondaryContainer }]}>
                <Icon name="account-school" size={12} color={theme.colors.secondary} />
                <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>
                  Sobre: {item.aluno.name}
                </Text>
              </View>
            )}
          </View>

          <Icon name="chevron-right" size={18} color={theme.colors.onSurfaceVariant} />
        </Surface>
      </TouchableOpacity>
    );
  }, [theme, handleOpen]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScreenLayout scrollable={false} withPadding={false}>
      {/* Badge de não lidas */}
      {naoLidas > 0 && (
        <Surface style={[styles.unreadBanner, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
          <Icon name="email" size={16} color={theme.colors.primary} />
          <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
            {naoLidas} {naoLidas === 1 ? 'aviso não lido' : 'avisos não lidos'}
          </Text>
        </Surface>
      )}

      {mensagens.length === 0 ? (
        <EmptyState
          icon="email-off"
          title="Nenhum aviso recebido"
          message="Você ainda não recebeu nenhum aviso da escola"
        />
      ) : (
        <FlatList
          data={mensagens}
          keyExtractor={item => item.id.toString()}
          renderItem={renderMensagem}
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

      {/* Modal de detalhe */}
      <Portal>
        <Modal
          visible={detailVisible}
          onDismiss={() => setDetailVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          {selectedMensagem && (
            <>
              <View style={styles.detailHeader}>
                <View style={[styles.mailIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Icon
                    name={getCategoriaInfo(selectedMensagem.categoria).icon}
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                    {selectedMensagem.titulo}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    De: {selectedMensagem.remetente?.name || 'Escola'}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {formatDate(selectedMensagem.createdAt)}
                  </Text>
                </View>
              </View>

              {selectedMensagem.tipo === 'INDIVIDUAL' && selectedMensagem.aluno && (
                <View style={[styles.filhoBadge, { backgroundColor: theme.colors.secondaryContainer, marginBottom: spacing.md }]}>
                  <Icon name="account-school" size={14} color={theme.colors.secondary} />
                  <Text variant="labelMedium" style={{ color: theme.colors.secondary }}>
                    Sobre: {selectedMensagem.aluno.name}
                  </Text>
                </View>
              )}

              <Divider style={{ marginBottom: spacing.md }} />

              <Text
                variant="bodyMedium"
                style={[styles.detailContent, { color: theme.colors.onSurface }]}
              >
                {selectedMensagem.conteudo}
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
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  mailIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filhoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  modal: {
    margin: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  detailHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  detailContent: {
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  closeBtn: {
    borderRadius: borderRadius.lg,
  },
});
