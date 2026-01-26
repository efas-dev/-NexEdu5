import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// IP especial do emulador Android que aponta para o localhost da máquina host
const androidApiUrl = 'http://10.0.2.2:3000';

// No simulador de iOS, 'localhost' funciona. Em um dispositivo físico,
// você deve usar o IP da sua máquina na rede local (ex: http://192.168.1.100:3000).
const iosApiUrl = 'http://localhost:3000';

// Define a baseURL com base na plataforma
const baseURL = Platform.OS === 'android' ? androidApiUrl : iosApiUrl;

// Cria conexão com a API
export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona ou remove token
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Interceptor de resposta para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => {
    // Retorna a resposta normalmente se não houver erro
    return response;
  },
  async (error) => {
    // Se receber erro 401 (Unauthorized), limpa autenticação
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('authUser');
      setAuthToken(null);
    }

    return Promise.reject(error);
  }
);
