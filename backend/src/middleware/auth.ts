/**
 * Middleware de Autenticação JWT
 *
 * Valida o token JWT enviado no header Authorization
 * e adiciona os dados do usuário à requisição
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extensão do tipo Request para incluir dados do usuário
export interface AuthRequest extends Request {
  user?: {
    id: number;
    login: string;
    role: string;
  };
}

/**
 * Middleware que verifica se o usuário está autenticado
 * Extrai o token JWT do header Authorization e valida
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extrai o token do header Authorization (formato: "Bearer TOKEN")
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "Token não fornecido" });
      return;
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
      res.status(401).json({ error: "Formato de token inválido" });
      return;
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      res.status(401).json({ error: "Token mal formatado" });
      return;
    }

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "nexedu-secret-key-change-in-production");

    // Adiciona os dados do usuário à requisição
    req.user = decoded as { id: number; login: string; role: string };

    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido ou expirado" });
    return;
  }
};

/**
 * Middleware que verifica se o usuário tem permissão de PROFESSOR
 * Deve ser usado após o middleware authenticate
 */
export const requireProfessor = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: "Usuário não autenticado" });
    return;
  }

  if (req.user.role !== "PROFESSOR") {
    res.status(403).json({
      error: "Acesso negado. Apenas professores podem realizar esta ação"
    });
    return;
  }

  next();
};
