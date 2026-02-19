// Importa a instância do Axios configurada para o backend
import { api } from "./api";

// Importa o tipo User, que define a estrutura de um usuário
import { User } from "../types/User";

/**
 * Interface para resposta do login
 */
export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Função para realizar login no backend
 * Recebe login e senha, faz a requisição POST e retorna token e dados do usuário
 */
export async function login(
  login: string, // login informado pelo usuário
  password: string // senha informada pelo usuário
): Promise<LoginResponse> { // retorna uma Promise contendo token e usuário
  // Faz a requisição POST para o endpoint /auth/login com login e senha
  const response = await api.post("/auth/login", {
    login,
    password
  });

  // Retorna token e dados do usuário obtidos na resposta
  return response.data;
}
