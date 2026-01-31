import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireProfessorOrAdmin } from '../middleware/roleGuards';
import {
  listarTurmas,
  buscarTurma,
  criarTurma,
  atualizarTurma,
  excluirTurma,
  listarAlunosTurma,
  vincularAlunos,
  removerAlunoTurma,
  vincularProfessor,
} from '../controllers/turma.controller';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// CRUD de Turmas (apenas professor/admin)
router.get('/', requireProfessorOrAdmin, listarTurmas);
router.get('/:id', requireProfessorOrAdmin, buscarTurma);
router.post('/', requireProfessorOrAdmin, criarTurma);
router.put('/:id', requireProfessorOrAdmin, atualizarTurma);
router.delete('/:id', requireProfessorOrAdmin, excluirTurma);

// Gerenciamento de alunos na turma
router.get('/:id/alunos', requireProfessorOrAdmin, listarAlunosTurma);
router.post('/:id/alunos', requireProfessorOrAdmin, vincularAlunos);
router.delete('/:id/alunos/:alunoId', requireProfessorOrAdmin, removerAlunoTurma);

// Gerenciamento de professores na turma
router.post('/:id/professores', requireProfessorOrAdmin, vincularProfessor);

export default router;
