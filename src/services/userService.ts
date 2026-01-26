import { User } from "../types/User";
import { api } from "./api";

/**
 * Retorna todos os usuários do backend
 */
export async function getUsers(): Promise<User[]> {
  const response = await api.get('/users');
  return response.data;
}

/**
 * Retorna um usuário específico por ID
 */
export async function getUserById(id: number): Promise<User> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

/**
 * Cria um novo usuário
 */
export async function createUser(data: {
  name: string;
  login: string;
  password: string;
  role: 'PROFESSOR' | 'ALUNO';
}): Promise<User> {
  const response = await api.post('/auth/register', data);
  return response.data;
}

/**
 * Atualiza um usuário existente
 */
export async function updateUser(
  id: number,
  data: Partial<{
    name: string;
    login: string;
    password?: string;
    role: 'PROFESSOR' | 'ALUNO';
  }>
): Promise<User> {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
}

/**
 * Exclui um usuário
 */
export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}
