import { Request, Response, NextFunction } from 'express';

// Extende o Request para incluir o user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    login: string;
    role: string;
  };
}

/**
 * Middleware factory que verifica se o usuário possui um dos roles permitidos
 * @param roles - Roles permitidos para acessar a rota
 */
export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    next();
  };
};

// Middlewares pré-configurados para roles específicos
export const requireProfessor = requireRole('PROFESSOR');
export const requirePai = requireRole('PAI');
export const requireAdmin = requireRole('ADMIN');
export const requireAluno = requireRole('ALUNO');

// Middlewares para múltiplos roles
export const requireProfessorOrAdmin = requireRole('PROFESSOR', 'ADMIN');
export const requireProfessorOrPai = requireRole('PROFESSOR', 'PAI');
export const requireAnyRole = requireRole('PROFESSOR', 'ALUNO', 'PAI', 'ADMIN');
