import { api } from './api';
import { Turma, AlunoTurma } from '../types/Turma';

/**
 * Retorna todas as turmas disponíveis
 */
export async function getTurmas(): Promise<Turma[]> {
  const response = await api.get('/turmas');
  return response.data;
}

/**
 * Retorna os alunos de uma turma específica
 */
export async function getTurmaAlunos(turmaId: number): Promise<AlunoTurma[]> {
  const response = await api.get(`/turmas/${turmaId}/alunos`);
  return response.data;
}
