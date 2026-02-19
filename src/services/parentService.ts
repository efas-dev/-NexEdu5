import { api } from './api';
import { ParentDashboardData } from '../types/Message';
import { PresencaRegistro, FrequenciaStats } from '../types/Attendance';

export interface FilhoDetalhado {
  id: number;
  name: string;
  login: string;
  email?: string;
  parentesco: string;
  principal: boolean;
}

export interface ChildAttendanceData {
  frequencia: PresencaRegistro[];
  estatisticas: FrequenciaStats;
}

/**
 * Retorna dados do dashboard do pai/responsável
 */
export async function getParentDashboard(): Promise<ParentDashboardData> {
  const response = await api.get('/parent/dashboard');
  return response.data;
}

/**
 * Retorna filhos vinculados ao pai/responsável
 */
export async function getParentChildren(): Promise<FilhoDetalhado[]> {
  const response = await api.get('/parent/children');
  return response.data;
}

/**
 * Retorna frequência de um filho específico
 */
export async function getChildAttendance(childId: number): Promise<ChildAttendanceData> {
  const response = await api.get(`/parent/children/${childId}/attendance`);
  return response.data;
}
