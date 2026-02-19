import { Post } from "../types/Post";
import { api } from "./api";

/**
 * Retorna todos os posts do backend
 */
export async function getPosts(): Promise<Post[]> {
  const response = await api.get('/posts');
  return response.data;
}

/**
 * Busca posts por palavra-chave
 */
export async function searchPosts(query: string): Promise<Post[]> {
  const response = await api.get(`/posts/search?q=${encodeURIComponent(query)}`);
  return response.data;
}

/**
 * Cria um novo post
 */
export async function createPost(title: string, content: string, author: string): Promise<Post> {
  const response = await api.post('/posts', {
    Title: title,
    Content: content,
    Author: author,
  });
  return response.data;
}

/**
 * Atualiza um post existente
 */
export async function updatePost(id: number, title: string, content: string): Promise<Post> {
  const response = await api.put(`/posts/${id}`, {
    Title: title,
    Content: content,
  });
  return response.data;
}

/**
 * Exclui um post
 */
export async function deletePost(id: number): Promise<void> {
  await api.delete(`/posts/${id}`);
}
