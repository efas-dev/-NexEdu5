export interface User {
  id: number;
  name: string;
  login: string;
  role: 'PROFESSOR' | 'ALUNO' | 'PAI' | 'ADMIN';
  email?: string;
  telefone?: string;
  createdAt?: string;
  updatedAt?: string;
}
