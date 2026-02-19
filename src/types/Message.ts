export type MessageTipo = 'INDIVIDUAL' | 'TURMA' | 'GERAL';
export type MessageCategoria = 'FERIADO' | 'EVENTO' | 'AVISO';

export interface Message {
  id: number;
  titulo: string;
  conteudo: string;
  tipo: MessageTipo;
  categoria?: MessageCategoria;
  createdAt: string;
  remetente?: {
    id: number;
    name: string;
    role: string;
  };
  turma?: {
    id: number;
    nome: string;
  };
  aluno?: {
    id: number;
    name: string;
  };
}

export interface InboxMessage extends Message {
  recipientId: number;
  lida: boolean;
  lidaEm?: string;
}

export interface FilhoResumo {
  id: number;
  name: string;
  parentesco: string;
  turmasAluno: {
    turma: {
      id: number;
      nome: string;
      serie: string;
    };
  }[];
  frequencia: {
    total: number;
    presentes: number;
    ausentes: number;
    percentual: number;
  };
  ultimaFalta: string | null;
}

export interface ParentDashboardData {
  filhos: FilhoResumo[];
  mensagens: {
    naoLidas: number;
    ultimas: InboxMessage[];
  };
}
