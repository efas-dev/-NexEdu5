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
 * Lista os filhos do pai logado
 */
export const listarFilhos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const filhos = await prisma.parentStudent.findMany({
      where: { parentId: req.user!.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            login: true,
            email: true,
            turmasAluno: {
              where: { ativo: true },
              include: {
                turma: {
                  select: {
                    id: true,
                    nome: true,
                    serie: true,
                    turno: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.json(
      filhos.map((f) => ({
        ...f.student,
        parentesco: f.parentesco,
        principal: f.principal,
      }))
    );
  } catch (error) {
    console.error('Erro ao listar filhos:', error);
    res.status(500).json({ error: 'Erro ao listar filhos' });
  }
};

/**
 * Busca frequência de um filho específico
 */
export const buscarFrequenciaFilho = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { turmaId, dataInicio, dataFim } = req.query;

    // Verifica se é filho do pai logado
    const vinculo = await prisma.parentStudent.findUnique({
      where: {
        parentId_studentId: {
          parentId: req.user!.id,
          studentId: parseInt(id),
        },
      },
    });

    if (!vinculo) {
      res.status(403).json({ error: 'Sem permissão para acessar dados deste aluno' });
      return;
    }

    const whereClause: any = {
      alunoId: parseInt(id),
    };

    if (turmaId) {
      whereClause.turmaId = parseInt(turmaId as string);
    }

    if (dataInicio || dataFim) {
      whereClause.data = {};
      if (dataInicio) {
        whereClause.data.gte = new Date(dataInicio as string);
      }
      if (dataFim) {
        whereClause.data.lte = new Date(dataFim as string);
      }
    }

    const presencas = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
            serie: true,
          },
        },
      },
      orderBy: { data: 'desc' },
    });

    // Calcula resumo
    const total = presencas.length;
    const presentes = presencas.filter((p) => p.presente).length;
    const ausentes = total - presentes;
    const percentualPresenca = total > 0 ? (presentes / total) * 100 : 0;

    res.json({
      resumo: {
        total,
        presentes,
        ausentes,
        percentualPresenca: Math.round(percentualPresenca * 100) / 100,
      },
      registros: presencas,
    });
  } catch (error) {
    console.error('Erro ao buscar frequência do filho:', error);
    res.status(500).json({ error: 'Erro ao buscar frequência' });
  }
};

/**
 * Dashboard resumido para o pai
 */
export const dashboardPai = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Busca filhos
    const filhos = await prisma.parentStudent.findMany({
      where: { parentId: req.user!.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            turmasAluno: {
              where: { ativo: true },
              include: {
                turma: {
                  select: {
                    id: true,
                    nome: true,
                    serie: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Busca mensagens não lidas
    const mensagensNaoLidas = await prisma.messageRecipient.count({
      where: {
        recipientId: req.user!.id,
        lida: false,
      },
    });

    // Busca últimas mensagens
    const ultimasMensagens = await prisma.messageRecipient.findMany({
      where: { recipientId: req.user!.id },
      include: {
        message: {
          include: {
            remetente: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { message: { createdAt: 'desc' } },
      take: 5,
    });

    // Calcula resumo de frequência por filho
    const resumoFilhos = await Promise.all(
      filhos.map(async (f) => {
        const presencas = await prisma.attendance.findMany({
          where: { alunoId: f.studentId },
        });

        const total = presencas.length;
        const presentes = presencas.filter((p) => p.presente).length;
        const percentual = total > 0 ? (presentes / total) * 100 : 0;

        // Busca última falta
        const ultimaFalta = await prisma.attendance.findFirst({
          where: {
            alunoId: f.studentId,
            presente: false,
          },
          orderBy: { data: 'desc' },
        });

        return {
          ...f.student,
          parentesco: f.parentesco,
          frequencia: {
            total,
            presentes,
            ausentes: total - presentes,
            percentual: Math.round(percentual * 100) / 100,
          },
          ultimaFalta: ultimaFalta?.data || null,
        };
      })
    );

    res.json({
      filhos: resumoFilhos,
      mensagens: {
        naoLidas: mensagensNaoLidas,
        ultimas: ultimasMensagens.map((um) => ({
          ...um.message,
          recipientId: um.id,
          lida: um.lida,
        })),
      },
    });
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
};

/**
 * Vincula pai a um aluno (usado pelo admin)
 */
export const vincularPaiAluno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { parentId, studentId, parentesco, principal } = req.body;

    if (!parentId || !studentId || !parentesco) {
      res.status(400).json({ error: 'parentId, studentId e parentesco são obrigatórios' });
      return;
    }

    // Verifica se o pai existe e é do tipo PAI
    const pai = await prisma.user.findFirst({
      where: { id: parseInt(parentId), role: 'PAI' },
    });

    if (!pai) {
      res.status(404).json({ error: 'Pai não encontrado' });
      return;
    }

    // Verifica se o aluno existe e é do tipo ALUNO
    const aluno = await prisma.user.findFirst({
      where: { id: parseInt(studentId), role: 'ALUNO' },
    });

    if (!aluno) {
      res.status(404).json({ error: 'Aluno não encontrado' });
      return;
    }

    const vinculo = await prisma.parentStudent.upsert({
      where: {
        parentId_studentId: {
          parentId: parseInt(parentId),
          studentId: parseInt(studentId),
        },
      },
      update: {
        parentesco,
        principal: principal || false,
      },
      create: {
        parentId: parseInt(parentId),
        studentId: parseInt(studentId),
        parentesco,
        principal: principal || false,
      },
    });

    res.status(201).json(vinculo);
  } catch (error) {
    console.error('Erro ao vincular pai ao aluno:', error);
    res.status(500).json({ error: 'Erro ao vincular pai ao aluno' });
  }
};
