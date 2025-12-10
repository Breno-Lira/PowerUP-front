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
  amizadeId: number | null;
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
  amizadeId: number | null;
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

// Tipos para Nutrição
export type Objetivo = 'Cutting' | 'Bulking';
export type TipoRefeicao = 'CafeDaManha' | 'Lanche' | 'Almoco' | 'Jantar';
export type Categoria = 'Gordura' | 'Proteina' | 'Carboidrato';

export interface Alimento {
  id: number;
  nome: string;
  categoria: Categoria;
  calorias: number;
  gramas: number;
}

export interface Refeicao {
  id: {
    id: number;
  };
  tipo: TipoRefeicao;
  alimentos: Array<{
    id: number;
  }>;
  caloriasTotais: number;
  inicio: string | null;
  fim: string | null;
}

export interface PlanoNutricional {
  id: {
    id: number;
  };
  objetivo: Objetivo;
  refeicoes: Array<{
    id: number;
  }>;
  caloriasTotais: number;
  caloriasObjetivo: number;
  usuarioEmail?: string; // Adicionado para compatibilidade
}

// DTO de resposta do backend
export interface PlanoNutricionalResponse {
  id: number;
  objetivo: string;
  refeicoes: number[];
  caloriasTotais: number;
  caloriasObjetivo: number;
  usuarioEmail: string;
}

export interface CriarRefeicaoRequest {
  tipo: TipoRefeicao;
  alimentosIds: number[];
  caloriasTotais: number | null;
  inicio: string | null;
  fim: string | null;
}

export interface CriarPlanoNutricionalRequest {
  objetivo: Objetivo;
  refeicoesIds: number[];
  usuarioEmail: string;
  caloriasObjetivo?: number; // Meta de calorias opcional
}

export interface ModificarPlanoNutricionalRequest {
  planoId: number;
  objetivo: Objetivo;
  refeicoesIds: number[];
}

export const nutricaoService = {
  // Plano Nutricional
  criarPlano: async (data: CriarPlanoNutricionalRequest): Promise<PlanoNutricional> => {
    const response = await api.post<PlanoNutricionalResponse>('/planos-nutricionais', data);
    // Converter o DTO de resposta para o formato esperado pelo frontend
    const responseData = response.data;
    return {
      id: { id: responseData.id },
      objetivo: responseData.objetivo as Objetivo,
      refeicoes: responseData.refeicoes.map(id => ({ id })),
      caloriasTotais: responseData.caloriasTotais,
      caloriasObjetivo: responseData.caloriasObjetivo,
      usuarioEmail: responseData.usuarioEmail,
    };
  },

  modificarPlano: async (data: ModificarPlanoNutricionalRequest): Promise<PlanoNutricional> => {
    const response = await api.put<PlanoNutricional>('/planos-nutricionais', data);
    return response.data;
  },

  listarPlanosPorUsuario: async (email: string): Promise<PlanoNutricional[]> => {
    const emailEncoded = encodeURIComponent(email);
    try {
      const response = await api.get<PlanoNutricionalResponse[]>(`/planos-nutricionais/usuario/${emailEncoded}`);
      // Converter DTOs para o formato esperado pelo frontend
      return response.data.map(dto => ({
        id: { id: dto.id },
        objetivo: dto.objetivo as Objetivo,
        refeicoes: dto.refeicoes.map(id => ({ id })),
        caloriasTotais: dto.caloriasTotais,
        caloriasObjetivo: dto.caloriasObjetivo,
        usuarioEmail: dto.usuarioEmail,
      }));
    } catch (error: any) {
      // Se for 404, retornar array vazio (usuário sem planos)
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  excluirPlano: async (id: number): Promise<void> => {
    await api.delete(`/planos-nutricionais/${id}`);
  },

  // Refeições
  criarRefeicao: async (data: CriarRefeicaoRequest): Promise<Refeicao> => {
    const response = await api.post<Refeicao>('/refeicoes', data);
    return response.data;
  },

  obterRefeicao: async (id: number): Promise<Refeicao> => {
    const response = await api.get<Refeicao>(`/refeicoes/${id}`);
    return response.data;
  },

  listarRefeicoes: async (): Promise<Refeicao[]> => {
    const response = await api.get<Refeicao[]>('/refeicoes');
    return response.data;
  },

  excluirRefeicao: async (id: number): Promise<void> => {
    await api.delete(`/refeicoes/${id}`);
  },

  // Alimentos
  listarAlimentos: async (): Promise<Alimento[]> => {
    const response = await api.get<Alimento[]>('/alimentos');
    return response.data;
  },
};

// Feedback
export type ClassificacaoFeedback = 'Cansado' | 'Bom' | 'Excelente' | 'ComDor';

export interface Feedback {
  id: number;
  frequencia: number;
  classificacao: ClassificacaoFeedback;
  feedback: string;
  email: string;
  data: string;
}

export interface CriarFeedbackRequest {
  frequenciaId: number;
  email: string;
  classificacao: ClassificacaoFeedback;
  descricao: string;
}

export interface ModificarFeedbackRequest {
  classificacao: ClassificacaoFeedback;
  descricao: string;
}

export const feedbackService = {
  criar: async (data: CriarFeedbackRequest): Promise<Feedback> => {
    const response = await api.post<Feedback>('/feedbacks', data);
    return response.data;
  },

  modificar: async (id: number, data: ModificarFeedbackRequest): Promise<Feedback> => {
    const response = await api.put<Feedback>(`/feedbacks/${id}`, data);
    return response.data;
  },

  excluir: async (id: number): Promise<void> => {
    await api.delete(`/feedbacks/${id}`);
  },

  listarPorUsuario: async (email: string): Promise<Feedback[]> => {
    const emailEncoded = encodeURIComponent(email);
    try {
      const response = await api.get<Feedback[]>(`/feedbacks/usuario/${emailEncoded}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  obter: async (id: number): Promise<Feedback> => {
    const response = await api.get<Feedback>(`/feedbacks/${id}`);
    return response.data;
  },
};

// Usuário
export interface UsuarioResumo {
  usuarioEmail: string;
  amizadeId: number | null;
  nome: string;
  senha: string;
  dataNascimento: string; // formato: YYYY-MM-DD
}

export const usuarioService = {
  obterPorEmail: async (email: string): Promise<UsuarioResumo> => {
    const emailEncoded = encodeURIComponent(email);
    const response = await api.get<UsuarioResumo>(`/usuarios/${emailEncoded}`);
    return response.data;
  },

  listarAmigos: async (email: string): Promise<UsuarioResumo[]> => {
    const emailEncoded = encodeURIComponent(email);
    try {
      const response = await api.get<UsuarioResumo[]>(`/usuarios/${emailEncoded}/amigos`);
      return response.data;
    } catch (error: any) {
      // Se for 404 ou não houver amigos, retornar array vazio
      if (error.response?.status === 404 || error.response?.status === 204) {
        return [];
      }
      throw error;
    }
  },

  adicionarAmigoPorCodigo: async (emailRemetente: string, codigoAmizade: number): Promise<string> => {
    const emailEncoded = encodeURIComponent(emailRemetente);
    const response = await api.post<string>(`/usuarios/${emailEncoded}/adicionar-amigo/${codigoAmizade}`);
    return response.data;
  },
};

export default api;

