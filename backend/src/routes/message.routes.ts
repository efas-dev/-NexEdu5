import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireProfessor, requireAdmin, requireProfessorOrAdmin, requirePai } from '../middleware/roleGuards';
import {
  enviarMensagemIndividual,
  enviarMensagemTurma,
  enviarMensagemGlobal,
  listarMensagensEnviadas,
  listarInbox,
  marcarComoLida,
  contarNaoLidas,
} from '../controllers/message.controller';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas para envio de mensagens (professor)
router.post('/', requireProfessor, enviarMensagemIndividual);
router.post('/broadcast', requireProfessor, enviarMensagemTurma);

// Rota para envio global (apenas admin/direção)
router.post('/global', requireAdmin, enviarMensagemGlobal);

// Rotas para professor e admin verem mensagens enviadas
router.get('/sent', requireProfessorOrAdmin, listarMensagensEnviadas);

// Rotas para pais
router.get('/inbox', requirePai, listarInbox);
router.put('/:id/read', requirePai, marcarComoLida);
router.get('/unread-count', requirePai, contarNaoLidas);

export default router;
