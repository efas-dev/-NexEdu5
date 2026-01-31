import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

// Extende o Request para incluir o user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    login: string;
    role: string;
  };
}

/**
 * Middleware que valida se o pai tem acesso aos dados do filho
 * Professores têm acesso automático a todos os alunos
 * Pais só podem acessar dados dos próprios filhos
 */
export const validateParentChildAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Professores e admins têm acesso total
    if (req.user?.role === 'PROFESSOR' || req.user?.role === 'ADMIN') {
      next();
      return;
    }

    // Para pais, verificar se tem vínculo com o aluno
    const studentId = parseInt(req.params.studentId || req.params.id);

    if (isNaN(studentId)) {
      res.status(400).json({ error: 'ID do aluno inválido' });
      return;
    }

    const relationship = await prisma.parentStudent.findUnique({
      where: {
        parentId_studentId: {
          parentId: req.user!.id,
          studentId: studentId,
        },
      },
    });

    if (!relationship) {
      res.status(403).json({ error: 'Sem permissão para acessar dados deste aluno' });
      return;
    }

    next();
  } catch (error) {
    console.error('Erro ao validar acesso do pai:', error);
    res.status(500).json({ error: 'Erro interno ao validar permissões' });
  }
};

/**
 * Middleware que valida se o pai tem acesso à turma
 * Verifica se algum filho do pai está matriculado na turma
 */
export const validateParentTurmaAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Professores e admins têm acesso total
    if (req.user?.role === 'PROFESSOR' || req.user?.role === 'ADMIN') {
      next();
      return;
    }

    const turmaId = parseInt(req.params.turmaId || req.params.id);

    if (isNaN(turmaId)) {
      res.status(400).json({ error: 'ID da turma inválido' });
      return;
    }

    // Busca filhos do pai que estão na turma
    const filhosNaTurma = await prisma.parentStudent.findMany({
      where: {
        parentId: req.user!.id,
        student: {
          turmasAluno: {
            some: {
              turmaId: turmaId,
              ativo: true,
            },
          },
        },
      },
    });

    if (filhosNaTurma.length === 0) {
      res.status(403).json({ error: 'Sem permissão para acessar dados desta turma' });
      return;
    }

    next();
  } catch (error) {
    console.error('Erro ao validar acesso do pai à turma:', error);
    res.status(500).json({ error: 'Erro interno ao validar permissões' });
  }
};
