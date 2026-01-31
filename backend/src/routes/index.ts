import { Router } from 'express';
import turmaRoutes from './turma.routes';
import attendanceRoutes from './attendance.routes';
import messageRoutes from './message.routes';
import parentRoutes from './parent.routes';

const router = Router();

// Rotas de turmas
router.use('/turmas', turmaRoutes);

// Rotas de presença
router.use('/attendance', attendanceRoutes);

// Rotas de mensagens
router.use('/messages', messageRoutes);

// Rotas de pais
router.use('/parent', parentRoutes);

export default router;
