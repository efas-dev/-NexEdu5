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
 * Registra presenças em lote para uma turma
 */
export const registrarPresencasBulk = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { turmaId, data, presencas } = req.body;

    if (!turmaId || !data || !presencas || !Array.isArray(presencas)) {
      res.status(400).json({ error: 'turmaId, data e presencas são obrigatórios' });
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

    const dataPresenca = new Date(data);

    // Cria/atualiza os registros de presença
    const registros = await prisma.$transaction(
      presencas.map((p: { alunoId: number; presente: boolean; justificativa?: string }) =>
        prisma.attendance.upsert({
          where: {
            alunoId_turmaId_data: {
              alunoId: p.alunoId,
              turmaId: parseInt(turmaId),
              data: dataPresenca,
            },
          },
          update: {
            presente: p.presente,
            justificativa: p.justificativa,
            registradoPor: req.user!.id,
          },
          create: {
            alunoId: p.alunoId,
            turmaId: parseInt(turmaId),
            data: dataPresenca,
            presente: p.presente,
            justificativa: p.justificativa,
            registradoPor: req.user!.id,
          },
        })
      )
    );

    res.status(201).json({ message: 'Presenças registradas com sucesso', total: registros.length });
  } catch (error) {
    console.error('Erro ao registrar presenças:', error);
    res.status(500).json({ error: 'Erro ao registrar presenças' });
  }
};

/**
 * Busca presenças de uma turma em uma data específica
 */
export const buscarPresencasTurmaData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { turmaId, date } = req.params;

    const turma = await prisma.turma.findUnique({
      where: { id: parseInt(turmaId) },
    });

    if (!turma) {
      res.status(404).json({ error: 'Turma não encontrada' });
      return;
    }

    const dataPresenca = new Date(date);

    // Busca todos os alunos ativos da turma
    const alunosTurma = await prisma.alunoTurma.findMany({
      where: {
        turmaId: parseInt(turmaId),
        ativo: true,
      },
      include: {
        aluno: {
          select: {
            id: true,
            name: true,
            login: true,
          },
        },
      },
    });

    // Busca registros de presença existentes
    const presencas = await prisma.attendance.findMany({
      where: {
        turmaId: parseInt(turmaId),
        data: dataPresenca,
      },
    });

    // Monta resposta combinando alunos com presenças
    const presencasMap = new Map(presencas.map((p) => [p.alunoId, p]));

    const resultado = alunosTurma.map((at) => ({
      aluno: at.aluno,
      presenca: presencasMap.get(at.aluno.id) || null,
    }));

    res.json({
      turma,
      data: date,
      alunos: resultado,
    });
  } catch (error) {
    console.error('Erro ao buscar presenças:', error);
    res.status(500).json({ error: 'Erro ao buscar presenças' });
  }
};

/**
 * Atualiza um registro de presença específico
 */
export const atualizarPresenca = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { presente, justificativa } = req.body;

    const presenca = await prisma.attendance.findUnique({
      where: { id: parseInt(id) },
    });

    if (!presenca) {
      res.status(404).json({ error: 'Registro de presença não encontrado' });
      return;
    }

    const atualizado = await prisma.attendance.update({
      where: { id: parseInt(id) },
      data: {
        ...(typeof presente === 'boolean' && { presente }),
        ...(justificativa !== undefined && { justificativa }),
        registradoPor: req.user!.id,
      },
    });

    res.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar presença:', error);
    res.status(500).json({ error: 'Erro ao atualizar presença' });
  }
};

/**
 * Busca histórico de presença de um aluno
 */
export const buscarHistoricoAluno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { turmaId, dataInicio, dataFim } = req.query;

    const whereClause: any = {
      alunoId: parseInt(studentId),
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

    res.json(presencas);
  } catch (error) {
    console.error('Erro ao buscar histórico de presença:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico de presença' });
  }
};

/**
 * Busca resumo de presença de um aluno (porcentagem)
 */
export const buscarResumoPresencaAluno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { turmaId } = req.query;

    const whereClause: any = {
      alunoId: parseInt(studentId),
    };

    if (turmaId) {
      whereClause.turmaId = parseInt(turmaId as string);
    }

    const presencas = await prisma.attendance.findMany({
      where: whereClause,
    });

    const total = presencas.length;
    const presentes = presencas.filter((p) => p.presente).length;
    const ausentes = total - presentes;
    const percentualPresenca = total > 0 ? (presentes / total) * 100 : 0;

    // Busca por turma se não filtrado
    let resumoPorTurma: any[] = [];
    if (!turmaId) {
      const turmasDoAluno = await prisma.alunoTurma.findMany({
        where: {
          alunoId: parseInt(studentId),
          ativo: true,
        },
        include: { turma: true },
      });

      resumoPorTurma = await Promise.all(
        turmasDoAluno.map(async (at) => {
          const presencasTurma = await prisma.attendance.findMany({
            where: {
              alunoId: parseInt(studentId),
              turmaId: at.turmaId,
            },
          });

          const totalTurma = presencasTurma.length;
          const presentesTurma = presencasTurma.filter((p) => p.presente).length;

          return {
            turma: at.turma,
            total: totalTurma,
            presentes: presentesTurma,
            ausentes: totalTurma - presentesTurma,
            percentual: totalTurma > 0 ? (presentesTurma / totalTurma) * 100 : 0,
          };
        })
      );
    }

    res.json({
      alunoId: parseInt(studentId),
      geral: {
        total,
        presentes,
        ausentes,
        percentualPresenca: Math.round(percentualPresenca * 100) / 100,
      },
      porTurma: resumoPorTurma,
    });
  } catch (error) {
    console.error('Erro ao buscar resumo de presença:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo de presença' });
  }
};
