import { api } from './api';
import { BulkAttendancePayload } from '../types/Attendance';

/**
 * Busca presenças registradas de uma turma em uma data específica
 */
export async function getAttendanceByTurmaAndDate(turmaId: number, date: string) {
  const response = await api.get(`/attendance/turma/${turmaId}/date/${date}`);
  return response.data;
}

/**
 * Salva chamada em lote para uma turma e data
 */
export async function saveBulkAttendance(payload: BulkAttendancePayload) {
  const response = await api.post('/attendance/bulk', payload);
  return response.data;
}
