import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      // Timeout
      return Promise.reject(new Error('Tempo de conexão esgotado. Verifique se o servidor está rodando.'));
    }
    if (error.code === 'ERR_NETWORK' || !error.response) {
      // Erro de rede ou servidor não respondeu
      return Promise.reject(new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:8080'));
    }
    // Outros erros HTTP
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  sucesso: boolean;
  mensagem: string;
  email: string | null;
  perfilId: number | null;
  username: string | null;
}

export interface RegistroRequest {
  email: string;
  nome: string;
  senha: string;
  username: string;
  dataNascimento: string; // formato: YYYY-MM-DD
}

export interface RegistroResponse {
  sucesso: boolean;
  mensagem: string;
  email: string | null;
  perfilId: number | null;
  username: string | null;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  registro: async (data: RegistroRequest): Promise<RegistroResponse> => {
    const response = await api.post<RegistroResponse>('/auth/registro', data);
    return response.data;
  },
};

export default api;

