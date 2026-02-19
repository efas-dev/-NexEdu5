export interface AttendanceRecord {
  alunoId: number;
  presente: boolean;
  justificativa?: string | null;
}

export interface BulkAttendancePayload {
  turmaId: number;
  data: string; // ISO date string YYYY-MM-DD
  presencas: AttendanceRecord[];
}

export interface PresencaRegistro {
  id: number;
  data: string;
  presente: boolean;
  justificativa?: string;
  turma: {
    nome: string;
    serie: string;
  };
}

export interface FrequenciaStats {
  totalAulas: number;
  presencas: number;
  faltas: number;
  percentualPresenca: number;
}
