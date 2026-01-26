/**
 * Dialog Component
 *
 * Wrapper fino sobre React Native Paper Dialog
 * com tipagem TypeScript e tema NexEdu
 */

import React from 'react';
import { Dialog as PaperDialog, DialogProps as PaperDialogProps, Portal } from 'react-native-paper';
import { useTheme } from '../../hooks/useTheme';

export interface DialogProps extends Omit<PaperDialogProps, 'theme'> {
  /**
   * Se true, dialog fica visível
   */
  visible: boolean;

  /**
   * Função chamada ao fechar dialog
   * (tocar fora ou pressionar back)
   */
  onDismiss: () => void;

  /**
   * Conteúdo do dialog
   */
  children: React.ReactNode;

  /**
   * Se true, não permite fechar ao tocar fora
   */
  dismissable?: boolean;
}

/**
 * Componente Dialog
 *
 * @example
 * // Dialog de confirmação
 * <Dialog visible={visible} onDismiss={onDismiss}>
 *   <Dialog.Title>Confirmar exclusão</Dialog.Title>
 *   <Dialog.Content>
 *     <Text>Deseja realmente excluir este item?</Text>
 *   </Dialog.Content>
 *   <Dialog.Actions>
 *     <Button mode="text" onPress={onDismiss}>
 *       Cancelar
 *     </Button>
 *     <Button mode="text" textColor={theme.colors.error} onPress={handleDelete}>
 *       Excluir
 *     </Button>
 *   </Dialog.Actions>
 * </Dialog>
 *
 * @example
 * // Dialog de informação
 * <Dialog visible={visible} onDismiss={onDismiss}>
 *   <Dialog.Icon icon="check-circle" />
 *   <Dialog.Title>Sucesso!</Dialog.Title>
 *   <Dialog.Content>
 *     <Text>Operação realizada com sucesso.</Text>
 *   </Dialog.Content>
 *   <Dialog.Actions>
 *     <Button mode="contained" onPress={onDismiss}>
 *       OK
 *     </Button>
 *   </Dialog.Actions>
 * </Dialog>
 */
export const Dialog: React.FC<DialogProps> & {
  Title: typeof PaperDialog.Title;
  Content: typeof PaperDialog.Content;
  Actions: typeof PaperDialog.Actions;
  Icon: typeof PaperDialog.Icon;
  ScrollArea: typeof PaperDialog.ScrollArea;
} = ({ visible, onDismiss, dismissable = true, children, ...props }) => {
  const theme = useTheme();

  return (
    <Portal>
      <PaperDialog
        visible={visible}
        onDismiss={onDismiss}
        dismissable={dismissable}
        theme={theme}
        {...props}
      >
        {children}
      </PaperDialog>
    </Portal>
  );
};

// Expor subcomponentes do Paper.Dialog
Dialog.Title = PaperDialog.Title;
Dialog.Content = PaperDialog.Content;
Dialog.Actions = PaperDialog.Actions;
Dialog.Icon = PaperDialog.Icon;
Dialog.ScrollArea = PaperDialog.ScrollArea;

export default Dialog;
