/**
 * Modelo de Post
 */
export interface Post {
  id: number;
  Title: string;  // Backend usa maiúscula
  Content: string;  // Backend usa maiúscula
  Author?: string;  // Autor do post
  authorId?: number;  // ID do autor
  createdAt?: string;
  updatedAt?: string;
}
