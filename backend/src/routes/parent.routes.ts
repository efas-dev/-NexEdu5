import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePai, requireProfessorOrAdmin } from '../middleware/roleGuards';
import {
  listarFilhos,
  buscarFrequenciaFilho,
  dashboardPai,
  vincularPaiAluno,
} from '../controllers/parent.controller';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas exclusivas para pais
router.get('/children', requirePai, listarFilhos);
router.get('/children/:id/attendance', requirePai, buscarFrequenciaFilho);
router.get('/dashboard', requirePai, dashboardPai);

// Rota para admin vincular pai a aluno
router.post('/link', requireProfessorOrAdmin, vincularPaiAluno);

export default router;
