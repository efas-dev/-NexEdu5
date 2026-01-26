export interface User {
  id: number;
  name: string;
  login: string;
  role: 'PROFESSOR' | 'ALUNO';
  createdAt?: string;
  updatedAt?: string;
}
