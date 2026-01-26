/**
 * ConfirmDialog Component
 *
 * Diálogo de confirmação reutilizável usando React Native Paper Dialog
 */

import React from 'react';
import { Portal, Dialog, Text } from 'react-native-paper';
import { Button } from './Button';

export interface ConfirmDialogProps {
  /**
   * Se true, exibe o diálogo
   */
  visible: boolean;

  /**
   * Título do diálogo
   */
  title: string;

  /**
   * Mensagem do diálogo
   */
  message: string;

  /**
   * Texto do botão de confirmação
   */
  confirmLabel?: string;

  /**
   * Texto do botão de cancelar
   */
  cancelLabel?: string;

  /**
   * Função chamada ao confirmar
   */
  onConfirm: () => void;

  /**
   * Função chamada ao cancelar ou fechar
   */
  onDismiss: () => void;

  /**
   * Se true, botão de confirmação aparece em vermelho (destrutivo)
   */
  destructive?: boolean;

  /**
   * Se true, exibe loading no botão de confirmação
   */
  loading?: boolean;
}

/**
 * Componente ConfirmDialog
 *
 * @example
 * <ConfirmDialog
 *   visible={showDialog}
 *   title="Confirmar exclusão"
 *   message="Deseja realmente excluir este item?"
 *   confirmLabel="Excluir"
 *   cancelLabel="Cancelar"
 *   destructive={true}
 *   onConfirm={handleConfirm}
 *   onDismiss={() => setShowDialog(false)}
 * />
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onDismiss,
  destructive = false,
  loading = false,
}) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} dismissable={!loading}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button mode="text" onPress={onDismiss} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            mode="text"
            onPress={onConfirm}
            loading={loading}
            disabled={loading}
            textColor={destructive ? '#EF4444' : undefined}
          >
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ConfirmDialog;
