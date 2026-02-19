import { api } from './api';
import { Message, InboxMessage } from '../types/Message';

/**
 * Retorna mensagens enviadas (Professor/Admin)
 */
export async function getSentMessages(): Promise<{ mensagens: Message[] }> {
  const response = await api.get('/messages/sent?limit=50');
  return response.data;
}

/**
 * Retorna inbox do usuário (Pai/Responsável)
 */
export async function getInboxMessages(): Promise<{ mensagens: InboxMessage[] }> {
  const response = await api.get('/messages/inbox');
  return response.data;
}

/**
 * Envia aviso para uma turma específica (Professor/Admin)
 */
export async function sendTurmaMessage(payload: {
  titulo: string;
  conteudo: string;
  turmaId: number;
  categoria: string;
}) {
  const response = await api.post('/messages/broadcast', payload);
  return response.data;
}

/**
 * Envia aviso global para todos (Admin apenas)
 */
export async function sendGlobalMessage(payload: {
  titulo: string;
  conteudo: string;
  categoria: string;
}) {
  const response = await api.post('/messages/global', payload);
  return response.data;
}

/**
 * Marca mensagem como lida
 */
export async function markMessageAsRead(messageId: number) {
  const response = await api.put(`/messages/${messageId}/read`);
  return response.data;
}

/**
 * Retorna contagem de mensagens não lidas
 */
export async function getUnreadCount(): Promise<{ count: number }> {
  const response = await api.get('/messages/unread-count');
  return response.data;
}
