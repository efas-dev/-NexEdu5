import { Request, Response } from 'express';
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
 * Envia mensagem individual (professor para pai sobre aluno específico)
 */
export const enviarMensagemIndividual = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { titulo, conteudo, categoria, alunoId, parentIds } = req.body;

    if (!titulo || !conteudo || !categoria || !alunoId) {
      res.status(400).json({ error: 'Título, conteúdo, categoria e alunoId são obrigatórios' });
      return;
    }

    // Verifica se o aluno existe
    const aluno = await prisma.user.findFirst({
      where: { id: parseInt(alunoId), role: 'ALUNO' },
    });

    if (!aluno) {
      res.status(404).json({ error: 'Aluno não encontrado' });
      return;
    }

    // Se não especificou pais, busca todos os responsáveis do aluno
    let destinatarios = parentIds;
    if (!destinatarios || destinatarios.length === 0) {
      const responsaveis = await prisma.parentStudent.findMany({
        where: { studentId: parseInt(alunoId) },
        select: { parentId: true },
      });
      destinatarios = responsaveis.map((r) => r.parentId);
    }

    if (destinatarios.length === 0) {
      res.status(400).json({ error: 'Nenhum responsável encontrado para este aluno' });
      return;
    }

    // Cria a mensagem
    const mensagem = await prisma.message.create({
      data: {
        titulo,
        conteudo,
        tipo: 'INDIVIDUAL',
        categoria,
        remetenteId: req.user!.id,
        alunoId: parseInt(alunoId),
        recipients: {
          create: destinatarios.map((parentId: number) => ({
            recipientId: parentId,
          })),
        },
      },
      include: {
        recipients: true,
        aluno: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json(mensagem);
  } catch (error) {
    console.error('Erro ao enviar mensagem individual:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
};

/**
 * Envia mensagem para todos os pais de uma turma (broadcast)
 */
export const enviarMensagemTurma = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { titulo, conteudo, categoria, turmaId } = req.body;

    if (!titulo || !conteudo || !categoria || !turmaId) {
      res.status(400).json({ error: 'Título, conteúdo, categoria e turmaId são obrigatórios' });
      return;
    }

    // Verifica se a turma existe
    const turma = await prisma.turma.findUnique({
      where: { id: parseInt(turmaId) },
    });

    if (!turma) {
      res.status(404).json({ error: 'Turma não encontrada' });
      return;
    }

    // Busca todos os alunos da turma
    const alunosTurma = await prisma.alunoTurma.findMany({
      where: {
        turmaId: parseInt(turmaId),
        ativo: true,
      },
      select: { alunoId: true },
    });

    // Busca todos os pais dos alunos da turma
    const paisDosAlunos = await prisma.parentStudent.findMany({
      where: {
        studentId: { in: alunosTurma.map((a) => a.alunoId) },
      },
      select: { parentId: true },
    });

    // Remove duplicados
    const parentIds = [...new Set(paisDosAlunos.map((p) => p.parentId))];

    if (parentIds.length === 0) {
      res.status(400).json({ error: 'Nenhum pai encontrado para os alunos desta turma' });
      return;
    }

    // Cria a mensagem
    const mensagem = await prisma.message.create({
      data: {
        titulo,
        conteudo,
        tipo: 'TURMA',
        categoria,
        remetenteId: req.user!.id,
        turmaId: parseInt(turmaId),
        recipients: {
          create: parentIds.map((parentId) => ({
            recipientId: parentId,
          })),
        },
      },
      include: {
        recipients: true,
        turma: {
          select: { id: true, nome: true, serie: true },
        },
      },
    });

    res.status(201).json({ ...mensagem, totalDestinatarios: parentIds.length });
  } catch (error) {
    console.error('Erro ao enviar mensagem para turma:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
};

/**
 * Envia mensagem global para todos os pais (direção/admin)
 */
export const enviarMensagemGlobal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { titulo, conteudo, categoria } = req.body;

    if (!titulo || !conteudo || !categoria) {
      res.status(400).json({ error: 'Título, conteúdo e categoria são obrigatórios' });
      return;
    }

    // Busca todos os pais
    const pais = await prisma.user.findMany({
      where: { role: 'PAI' },
      select: { id: true },
    });

    if (pais.length === 0) {
      res.status(400).json({ error: 'Nenhum pai cadastrado no sistema' });
      return;
    }

    // Cria a mensagem
    const mensagem = await prisma.message.create({
      data: {
        titulo,
        conteudo,
        tipo: 'GERAL',
        categoria,
        remetenteId: req.user!.id,
        recipients: {
          create: pais.map((pai) => ({
            recipientId: pai.id,
          })),
        },
      },
      include: {
        recipients: true,
      },
    });

    res.status(201).json({ ...mensagem, totalDestinatarios: pais.length });
  } catch (error) {
    console.error('Erro ao enviar mensagem global:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
};

/**
 * Lista mensagens enviadas pelo usuário
 */
export const listarMensagensEnviadas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [mensagens, total] = await Promise.all([
      prisma.message.findMany({
        where: { remetenteId: req.user!.id },
        include: {
          turma: {
            select: { id: true, nome: true },
          },
          aluno: {
            select: { id: true, name: true },
          },
          _count: {
            select: { recipients: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.message.count({
        where: { remetenteId: req.user!.id },
      }),
    ]);

    res.json({
      mensagens,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Erro ao listar mensagens enviadas:', error);
    res.status(500).json({ error: 'Erro ao listar mensagens' });
  }
};

/**
 * Lista caixa de entrada do pai
 */
export const listarInbox = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, lida } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const whereClause: any = {
      recipientId: req.user!.id,
    };

    if (lida !== undefined) {
      whereClause.lida = lida === 'true';
    }

    const [mensagens, total] = await Promise.all([
      prisma.messageRecipient.findMany({
        where: whereClause,
        include: {
          message: {
            include: {
              remetente: {
                select: { id: true, name: true, role: true },
              },
              turma: {
                select: { id: true, nome: true },
              },
              aluno: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { message: { createdAt: 'desc' } },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.messageRecipient.count({
        where: whereClause,
      }),
    ]);

    res.json({
      mensagens: mensagens.map((mr) => ({
        ...mr.message,
        recipientId: mr.id,
        lida: mr.lida,
        lidaEm: mr.lidaEm,
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Erro ao listar inbox:', error);
    res.status(500).json({ error: 'Erro ao listar mensagens' });
  }
};

/**
 * Marca mensagem como lida
 */
export const marcarComoLida = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const mensagemRecipient = await prisma.messageRecipient.findFirst({
      where: {
        messageId: parseInt(id),
        recipientId: req.user!.id,
      },
    });

    if (!mensagemRecipient) {
      res.status(404).json({ error: 'Mensagem não encontrada' });
      return;
    }

    const atualizada = await prisma.messageRecipient.update({
      where: { id: mensagemRecipient.id },
      data: {
        lida: true,
        lidaEm: new Date(),
      },
    });

    res.json(atualizada);
  } catch (error) {
    console.error('Erro ao marcar mensagem como lida:', error);
    res.status(500).json({ error: 'Erro ao marcar mensagem como lida' });
  }
};

/**
 * Conta mensagens não lidas
 */
export const contarNaoLidas = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const count = await prisma.messageRecipient.count({
      where: {
        recipientId: req.user!.id,
        lida: false,
      },
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Erro ao contar mensagens não lidas:', error);
    res.status(500).json({ error: 'Erro ao contar mensagens' });
  }
};
