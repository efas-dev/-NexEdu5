import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginService } from '../services/authService';
import { setAuthToken } from '../services/api';
import { User } from '../types/User';

/**
 * Interface para dados do contexto de autenticação
 */
interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Contexto de autenticação
 */
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

/**
 * Provedor do contexto de autenticação
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Verifica se existe token salvo ao iniciar o app
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Verifica autenticação existente
   */
  async function checkAuth() {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('authUser');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setAuthToken(storedToken);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Realiza login do usuário
   */
  async function login(username: string, password: string) {
    try {
      const response = await loginService(username, password);

      const { token: newToken, user: newUser } = response;

      // Salva token e usuário
      await AsyncStorage.setItem('authToken', newToken);
      await AsyncStorage.setItem('authUser', JSON.stringify(newUser));

      // Atualiza estado
      setToken(newToken);
      setUser(newUser);

      // Configura token no Axios
      setAuthToken(newToken);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Realiza logout do usuário
   */
  async function logout() {
    try {
      // Remove token e usuário do AsyncStorage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('authUser');

      // Limpa estado
      setToken(null);
      setUser(null);

      // Remove token do Axios
      setAuthToken(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
