import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireProfessor, requireProfessorOrPai } from '../middleware/roleGuards';
import { validateParentChildAccess } from '../middleware/parentAccess';
import {
  registrarPresencasBulk,
  buscarPresencasTurmaData,
  atualizarPresenca,
  buscarHistoricoAluno,
  buscarResumoPresencaAluno,
} from '../controllers/attendance.controller';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas exclusivas para professores
router.post('/bulk', requireProfessor, registrarPresencasBulk);
router.get('/turma/:turmaId/date/:date', requireProfessor, buscarPresencasTurmaData);
router.put('/:id', requireProfessor, atualizarPresenca);

// Rotas para professores e pais (pais precisam de validação de parentesco)
router.get('/student/:studentId', requireProfessorOrPai, validateParentChildAccess, buscarHistoricoAluno);
router.get('/student/:studentId/summary', requireProfessorOrPai, validateParentChildAccess, buscarResumoPresencaAluno);

export default router;
