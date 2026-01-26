// Configuração centralizada da API
// Usa variável de ambiente NEXT_PUBLIC_API_URL para produção ou localhost para desenvolvimento

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export { API_URL };
