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
 * Lista todas as turmas
 */
export const listarTurmas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const turmas = await prisma.turma.findMany({
      include: {
        _count: {
          select: {
            alunos: true,
            professores: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });
    res.json(turmas);
  } catch (error) {
    console.error('Erro ao listar turmas:', error);
    res.status(500).json({ error: 'Erro ao listar turmas' });
  }
};

/**
 * Busca uma turma por ID
 */
export const buscarTurma = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const turma = await prisma.turma.findUnique({
      where: { id: parseInt(id) },
      include: {
        alunos: {
          include: {
            aluno: {
              select: {
                id: true,
                name: true,
                login: true,
                email: true,
              },
            },
          },
        },
        professores: {
          include: {
            professor: {
              select: {
                id: true,
                name: true,
                login: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!turma) {
      res.status(404).json({ error: 'Turma não encontrada' });
      return;
    }

    res.json(turma);
  } catch (error) {
    console.error('Erro ao buscar turma:', error);
    res.status(500).json({ error: 'Erro ao buscar turma' });
  }
};

/**
 * Cria uma nova turma
 */
export const criarTurma = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, serie, turno, anoLetivo } = req.body;

    if (!nome || !serie || !turno || !anoLetivo) {
      res.status(400).json({ error: 'Nome, série, turno e ano letivo são obrigatórios' });
      return;
    }

    const turnosValidos = ['MANHA', 'TARDE', 'NOITE'];
    if (!turnosValidos.includes(turno)) {
      res.status(400).json({ error: 'Turno deve ser MANHA, TARDE ou NOITE' });
      return;
    }

    const turma = await prisma.turma.create({
      data: {
        nome,
        serie,
        turno,
        anoLetivo: parseInt(anoLetivo),
      },
    });

    res.status(201).json(turma);
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    res.status(500).json({ error: 'Erro ao criar turma' });
  }
};

/**
 * Atualiza uma turma
 */
export const atualizarTurma = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, serie, turno, anoLetivo } = req.body;

    const turmaExistente = await prisma.turma.findUnique({
      where: { id: parseInt(id) },
    });

    if (!turmaExistente) {
      res.status(404).json({ error: 'Turma não encontrada' });
      return;
    }

    if (turno) {
      const turnosValidos = ['MANHA', 'TARDE', 'NOITE'];
      if (!turnosValidos.includes(turno)) {
        res.status(400).json({ error: 'Turno deve ser MANHA, TARDE ou NOITE' });
        return;
      }
    }

    const turma = await prisma.turma.update({
      where: { id: parseInt(id) },
      data: {
        ...(nome && { nome }),
        ...(serie && { serie }),
        ...(turno && { turno }),
        ...(anoLetivo && { anoLetivo: parseInt(anoLetivo) }),
      },
    });

    res.json(turma);
  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    res.status(500).json({ error: 'Erro ao atualizar turma' });
  }
};

/**
 * Exclui uma turma
 */
export const excluirTurma = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const turmaExistente = await prisma.turma.findUnique({
      where: { id: parseInt(id) },
    });

    if (!turmaExistente) {
      res.status(404).json({ error: 'Turma não encontrada' });
      return;
    }

    await prisma.turma.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Turma excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir turma:', error);
    res.status(500).json({ error: 'Erro ao excluir turma' });
  }
};

/**
 * Lista alunos de uma turma
 */
export const listarAlunosTurma = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const turma = await prisma.turma.findUnique({
      where: { id: parseInt(id) },
    });

    if (!turma) {
      res.status(404).json({ error: 'Turma não encontrada' });
      return;
    }

    const alunos = await prisma.alunoTurma.findMany({
      where: {
        turmaId: parseInt(id),
        ativo: true,
      },
      include: {
        aluno: {
          select: {
            id: true,
            name: true,
            login: true,
            email: true,
            telefone: true,
          },
        },
      },
    });

    res.json(alunos.map((at) => ({ ...at.aluno, matricula: at })));
  } catch (error) {
    console.error('Erro ao listar alunos da turma:', error);
    res.status(500).json({ error: 'Erro ao listar alunos da turma' });
  }
};

/**
 * Vincula alunos a uma turma
 */
export const vincularAlunos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { alunoIds } = req.body;

    if (!Array.isArray(alunoIds) || alunoIds.length === 0) {
      res.status(400).json({ error: 'Lista de IDs de alunos é obrigatória' });
      return;
    }

    const turma = await prisma.turma.findUnique({
      where: { id: parseInt(id) },
    });

    if (!turma) {
      res.status(404).json({ error: 'Turma não encontrada' });
      return;
    }

    // Verifica se os alunos existem e são do tipo ALUNO
    const alunos = await prisma.user.findMany({
      where: {
        id: { in: alunoIds },
        role: 'ALUNO',
      },
    });

    if (alunos.length !== alunoIds.length) {
      res.status(400).json({ error: 'Um ou mais IDs não correspondem a alunos válidos' });
      return;
    }

    // Cria os vínculos (ignora duplicados)
    const vinculos = await prisma.$transaction(
      alunoIds.map((alunoId: number) =>
        prisma.alunoTurma.upsert({
          where: {
            alunoId_turmaId: {
              alunoId,
              turmaId: parseInt(id),
            },
          },
          update: { ativo: true },
          create: {
            alunoId,
            turmaId: parseInt(id),
          },
        })
      )
    );

    res.status(201).json({ message: 'Alunos vinculados com sucesso', vinculos });
  } catch (error) {
    console.error('Erro ao vincular alunos:', error);
    res.status(500).json({ error: 'Erro ao vincular alunos à turma' });
  }
};

/**
 * Remove aluno de uma turma
 */
export const removerAlunoTurma = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, alunoId } = req.params;

    const vinculo = await prisma.alunoTurma.findUnique({
      where: {
        alunoId_turmaId: {
          alunoId: parseInt(alunoId),
          turmaId: parseInt(id),
        },
      },
    });

    if (!vinculo) {
      res.status(404).json({ error: 'Aluno não está matriculado nesta turma' });
      return;
    }

    await prisma.alunoTurma.update({
      where: {
        alunoId_turmaId: {
          alunoId: parseInt(alunoId),
          turmaId: parseInt(id),
        },
      },
      data: {
        ativo: false,
        dataFim: new Date(),
      },
    });

    res.json({ message: 'Aluno removido da turma com sucesso' });
  } catch (error) {
    console.error('Erro ao remover aluno da turma:', error);
    res.status(500).json({ error: 'Erro ao remover aluno da turma' });
  }
};

/**
 * Vincula professor a uma turma
 */
export const vincularProfessor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { professorId, disciplina } = req.body;

    if (!professorId) {
      res.status(400).json({ error: 'ID do professor é obrigatório' });
      return;
    }

    const turma = await prisma.turma.findUnique({
      where: { id: parseInt(id) },
    });

    if (!turma) {
      res.status(404).json({ error: 'Turma não encontrada' });
      return;
    }

    const professor = await prisma.user.findFirst({
      where: {
        id: parseInt(professorId),
        role: 'PROFESSOR',
      },
    });

    if (!professor) {
      res.status(400).json({ error: 'Professor não encontrado' });
      return;
    }

    const vinculo = await prisma.professorTurma.upsert({
      where: {
        professorId_turmaId: {
          professorId: parseInt(professorId),
          turmaId: parseInt(id),
        },
      },
      update: { disciplina },
      create: {
        professorId: parseInt(professorId),
        turmaId: parseInt(id),
        disciplina,
      },
    });

    res.status(201).json(vinculo);
  } catch (error) {
    console.error('Erro ao vincular professor:', error);
    res.status(500).json({ error: 'Erro ao vincular professor à turma' });
  }
};
