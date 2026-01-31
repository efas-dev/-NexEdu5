# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NexEduMobile is a React Native/Expo educational blog management app with a Node.js backend. It's a FIAP Tech Challenge (Fase 4) project featuring role-based access control (PROFESSOR/ALUNO).

## Development Commands

### Frontend (root directory)
```bash
npm install          # Install dependencies
npm start            # Start Expo dev server
npm run android      # Run on Android emulator
npm run ios          # Run on iOS simulator
npm run web          # Run in web browser
npm test             # Run Jest tests
```

### Backend (backend/ directory)
```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server with hot reload (port 3000)
npm run build                  # Build TypeScript
npm start                      # Run production build

# Docker
docker-compose up -d           # Start PostgreSQL
docker-compose down            # Stop all services
npm run docker:dev             # Start with dev profile

# Prisma
npx prisma generate            # Generate Prisma Client (required after schema changes)
npx prisma migrate dev         # Create/run migrations in dev
npx prisma migrate deploy      # Apply migrations in production
npx prisma studio              # Database GUI (port 5555)
```

## Architecture

### Frontend Stack
- **React Native 0.81.5 + Expo 54** with TypeScript
- **React Native Paper** for Material Design 3 components
- **React Navigation 7.x** with Bottom Tabs + Native Stack

### Provider Hierarchy (App.tsx)
```
GestureHandlerRootView
  └─ SafeAreaProvider
       └─ ThemeProvider          # Dark/light mode
            └─ PaperProvider     # Material Design theming
                 └─ NavigationContainer
                      └─ AuthProvider      # JWT auth state
                           └─ SnackbarProvider  # Toast notifications
                                └─ AppNavigator
```

### Navigation Structure
- **RootStack**: Login | MainTabs
- **MainTabs** (Bottom Tabs):
  - PostsTab → PostsStack (Home, PostDetail, CreatePost, EditPost)
  - UsersTab → UsersStack (UserList, UserForm) - *Professor only*
  - ProfileTab → ProfileStack (Profile)

### Backend Stack
- **Express 5 + TypeScript** with Prisma ORM
- **PostgreSQL** database (Docker on port 5433)
- **JWT** authentication (24h expiry)
- **bcrypt** password hashing

### Key Patterns

**Role-Based Access Control:**
- `PROFESSOR`: Full CRUD on posts and users
- `ALUNO`: Read-only access to posts
- Backend enforces via `requireProfessor` middleware
- Frontend conditionally renders UI based on `user.role`

**API Configuration (src/services/api.ts):**
- Android emulator: `http://10.0.2.2:3000`
- iOS/Web: `http://localhost:3000`
- Auto-logout on 401 responses via axios interceptor

**State Management:**
- Context API for global state (Auth, Theme, Snackbar)
- No Redux/MobX - uses React Context + hooks

## Database Schema (Prisma)

Two main models:
- **User**: id, name, login (unique), password (hashed), role (PROFESSOR|ALUNO)
- **Post**: id, Title, Content, Author, authorId (FK to User)

## API Endpoints

Public: `POST /auth/login`, `POST /auth/register`

Authenticated: `GET /posts`, `GET /posts/:id`, `GET /posts/search?q=`

Professor only: `POST/PUT/DELETE /posts/:id`, `GET/PUT/DELETE /users/:id`

## Test Credentials

| Role | Login | Password |
|------|-------|----------|
| Professor | prof | 123456 |
| Aluno | joao | 123456 |

## Testing

Backend tests are located in `backend/tests/`:
- `tests/test-requests.http` - Manual HTTP requests (REST Client extension)
- `tests/teste.sh` - Automated bash test script

```bash
# Run automated tests
cd backend && ./tests/teste.sh
```

## Important Notes

- **Node.js 20+ required** - React Native 0.81.5 and Expo 54 don't work with Node 18
- Run `npx prisma generate` after cloning or after schema changes
- For physical device testing, update `src/services/api.ts` baseURL and backend CORS settings
