/**
 * NexEdu API - Sistema de Gerenciamento de Posts Educacionais
 *
 * API RESTful para criação, leitura, atualização e exclusão de posts educacionais.
 * Desenvolvido com Express.js, TypeScript e Prisma ORM.
 *
 * Endpoints disponíveis:
 * - GET /                    - Teste da API
 * - GET /posts               - Listar todos os posts
 * - GET /posts/:id           - Buscar post por ID
 * - GET /posts/search?q=     - Buscar posts por termo
 * - POST /posts              - Criar novo post
 * - PUT /posts/:id           - Atualizar post existente
 * - DELETE /posts/:id        - Deletar post
 *
 * @author Equipe NexEdu
 * @version 1.0.0
 */

import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticate, requireProfessor, AuthRequest } from "./middleware/auth";

// Inicialização do Express e Prisma
const app = express();
const prisma = new PrismaClient();

// Configuração de CORS
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:2025", "http://localhost:8081"],
  credentials: true,
}));

// Middleware para parsing de JSON nas requisições
app.use(express.json());

// Constantes
const JWT_SECRET = process.env.JWT_SECRET || "nexedu-secret-key-change-in-production";
const SALT_ROUNDS = 10;

/**
 * Endpoint de teste da API
 * Verifica se o servidor está funcionando corretamente
 * @route GET /
 * @returns {string} Mensagem de confirmação
 */
app.get("/", (_req: Request, res: Response) => {
  res.send("Hello, Prisma with Express!");
});

// ============================================================================
// ENDPOINTS DE AUTENTICAÇÃO
// ============================================================================

/**
 * Endpoint de registro de novo usuário
 * Cria um novo usuário com senha criptografada
 * @route POST /auth/register
 * @param {string} name - Nome do usuário
 * @param {string} login - Login único do usuário
 * @param {string} password - Senha do usuário (será criptografada)
 * @param {string} role - Papel do usuário (PROFESSOR ou ALUNO)
 * @returns {User} Usuário criado (sem a senha)
 */
app.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { name, login, password, role } = req.body;

    // Validação dos campos obrigatórios
    if (!name || !login || !password || !role) {
      res.status(400).json({ error: "Todos os campos são obrigatórios" });
      return;
    }

    // Validação do role
    if (role !== "PROFESSOR" && role !== "ALUNO") {
      res.status(400).json({ error: "Role deve ser PROFESSOR ou ALUNO" });
      return;
    }

    // Verifica se o login já existe
    const existingUser = await prisma.user.findUnique({
      where: { login },
    });

    if (existingUser) {
      res.status(409).json({ error: "Login já está em uso" });
      return;
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name,
        login,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        login: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

/**
 * Endpoint de login
 * Autentica o usuário e retorna um token JWT
 * @route POST /auth/login
 * @param {string} login - Login do usuário
 * @param {string} password - Senha do usuário
 * @returns {Object} Token JWT e dados do usuário
 */
app.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;

    // Validação dos campos
    if (!login || !password) {
      res.status(400).json({ error: "Login e senha são obrigatórios" });
      return;
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      res.status(401).json({ error: "Login ou senha inválidos" });
      return;
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Login ou senha inválidos" });
      return;
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: user.id, login: user.login, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        login: user.login,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

// ============================================================================
// ENDPOINTS DE USUÁRIOS (CRUD)
// ============================================================================

/**
 * Lista todos os usuários (apenas professores)
 * @route GET /users
 * @requires Authentication + PROFESSOR role
 * @returns {User[]} Array com todos os usuários
 */
app.get(
  "/users",
  authenticate,
  requireProfessor,
  async (_req: AuthRequest, res: Response) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          login: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar usuários" });
    }
  }
);

/**
 * Busca um usuário específico por ID (apenas professores)
 * @route GET /users/:id
 * @requires Authentication + PROFESSOR role
 * @param {number} id - ID do usuário
 * @returns {User} Usuário encontrado
 */
app.get(
  "/users/:id",
  authenticate,
  requireProfessor,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: parseInt(id, 10) },
        select: {
          id: true,
          name: true,
          login: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: "Usuário não encontrado" });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  }
);

/**
 * Atualiza um usuário (apenas professores)
 * @route PUT /users/:id
 * @requires Authentication + PROFESSOR role
 * @param {number} id - ID do usuário
 * @param {string} name - Novo nome (opcional)
 * @param {string} login - Novo login (opcional)
 * @param {string} password - Nova senha (opcional)
 * @param {string} role - Novo role (opcional)
 * @returns {User} Usuário atualizado
 */
app.put(
  "/users/:id",
  authenticate,
  requireProfessor,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, login, password, role } = req.body;

      // Validação do role se fornecido
      if (role && role !== "PROFESSOR" && role !== "ALUNO") {
        res.status(400).json({ error: "Role deve ser PROFESSOR ou ALUNO" });
        return;
      }

      // Verifica se o usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!existingUser) {
        res.status(404).json({ error: "Usuário não encontrado" });
        return;
      }

      // Se está alterando o login, verifica se já existe
      if (login && login !== existingUser.login) {
        const loginExists = await prisma.user.findUnique({
          where: { login },
        });

        if (loginExists) {
          res.status(409).json({ error: "Login já está em uso" });
          return;
        }
      }

      // Prepara os dados para atualização
      const updateData: any = {};
      if (name) updateData.name = name;
      if (login) updateData.login = login;
      if (role) updateData.role = role;
      if (password) {
        updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
      }

      // Atualiza o usuário
      const user = await prisma.user.update({
        where: { id: parseInt(id, 10) },
        data: updateData,
        select: {
          id: true,
          name: true,
          login: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
  }
);

/**
 * Exclui um usuário (apenas professores)
 * @route DELETE /users/:id
 * @requires Authentication + PROFESSOR role
 * @param {number} id - ID do usuário a ser excluído
 * @returns {Object} Mensagem de confirmação
 */
app.delete(
  "/users/:id",
  authenticate,
  requireProfessor,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Verifica se o usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!existingUser) {
        res.status(404).json({ error: "Usuário não encontrado" });
        return;
      }

      await prisma.user.delete({
        where: { id: parseInt(id, 10) },
      });

      res.json({ message: "Usuário deletado com sucesso" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar usuário" });
    }
  }
);

// ============================================================================
// ENDPOINTS DE POSTS
// ============================================================================

/**
 * Busca posts por termo de pesquisa
 * Pesquisa no título e conteúdo dos posts (case-insensitive)
 * REQUER: Autenticação (professores e alunos)
 * @route GET /posts/search
 * @param {string} q - Termo de busca (query parameter)
 * @returns {Post[]} Lista de posts que contêm o termo
 */
app.get(
  "/posts/search",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { q } = req.query;

      const posts = await prisma.post.findMany({
        where: {
          OR: [
            { Title: { contains: q as string, mode: "insensitive" } },
            { Content: { contains: q as string, mode: "insensitive" } },
          ],
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              login: true,
              role: true,
            },
          },
        },
      });

      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar posts" });
    }
  }
);

/**
 * Lista todos os posts educacionais
 * Retorna todos os posts cadastrados no sistema
 * REQUER: Autenticação (professores e alunos)
 * @route GET /posts
 * @returns {Post[]} Array com todos os posts
 */
app.get(
  "/posts",
  authenticate,
  async (_req: Request, res: Response) => {
    try {
      const posts = await prisma.post.findMany({
        include: {
          author: {
            select: {
              id: true,
              name: true,
              login: true,
              role: true,
            },
          },
        },
      });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar posts" });
    }
  }
);

/**
 * Busca um post específico por ID
 * REQUER: Autenticação (professores e alunos)
 * @route GET /posts/:id
 * @param {number} id - ID do post a ser buscado
 * @returns {Post} Post encontrado ou erro 404
 */
app.get(
  "/posts/:id",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const post = await prisma.post.findUnique({
        where: { id: parseInt(id, 10) },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              login: true,
              role: true,
            },
          },
        },
      });

      if (!post) {
        res.status(404).json({ error: "Post não encontrado" });
        return;
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar post" });
    }
  }
);

/**
 * Cria um novo post educacional
 * REQUER: Autenticação + Role de PROFESSOR
 * @route POST /posts
 * @param {string} Title - Título do post
 * @param {string} Content - Conteúdo do post
 * @param {string} Author - Nome do autor
 * @returns {Post} Post criado com sucesso
 */
// POST /posts - Criação de Postagens (apenas professores)
app.post(
  "/posts",
  authenticate,
  requireProfessor,
  async (req: AuthRequest, res: Response) => {
    try {
      const { Title, Content, Author } = req.body;

      if (!Title || !Content || !Author) {
        res.status(400).json({ error: "Título, conteúdo e autor são obrigatórios" });
        return;
      }

      const post = await prisma.post.create({
        data: {
          Title,
          Content,
          Author,
          authorId: req.user?.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              login: true,
              role: true,
            },
          },
        },
      });

      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar post" });
    }
  }
);

/**
 * Atualiza um post existente
 * REQUER: Autenticação + Role de PROFESSOR
 * @route PUT /posts/:id
 * @param {number} id - ID do post a ser atualizado
 * @param {string} Title - Novo título do post
 * @param {string} Content - Novo conteúdo do post
 * @param {string} Author - Novo autor do post
 * @returns {Post} Post atualizado
 */
// PUT /posts/:id - Edição de Postagens (apenas professores)
app.put(
  "/posts/:id",
  authenticate,
  requireProfessor,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { Title, Content, Author } = req.body;

      // Verifica se o post existe
      const existingPost = await prisma.post.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!existingPost) {
        res.status(404).json({ error: "Post não encontrado" });
        return;
      }

      const post = await prisma.post.update({
        where: { id: parseInt(id, 10) },
        data: { Title, Content, Author },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              login: true,
              role: true,
            },
          },
        },
      });

      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar post" });
    }
  }
);

/**
 * Exclui um post específico
 * REQUER: Autenticação + Role de PROFESSOR
 * @route DELETE /posts/:id
 * @param {number} id - ID do post a ser excluído
 * @returns {Object} Mensagem de confirmação da exclusão
 */
// DELETE /posts/:id - Exclusão de Postagens (apenas professores)
app.delete(
  "/posts/:id",
  authenticate,
  requireProfessor,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Verifica se o post existe
      const existingPost = await prisma.post.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!existingPost) {
        res.status(404).json({ error: "Post não encontrado" });
        return;
      }

      await prisma.post.delete({
        where: { id: parseInt(id, 10) },
      });

      res.json({ message: "Post deletado com sucesso" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar post" });
    }
  }
);

// Configuração e inicialização do servidor
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0"; // Escuta em todas as interfaces para Docker

app.listen(PORT, HOST, () => {
  console.log(`Servidor NexEdu rodando em ${HOST}:${PORT}`);
});
