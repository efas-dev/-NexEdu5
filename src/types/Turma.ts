export interface Turma {
  id: number;
  nome: string;
  serie: string;
  turno: 'MANHA' | 'TARDE' | 'NOITE';
  anoLetivo?: string;
}

export interface AlunoTurma {
  id: number;
  name: string;
  login: string;
}
