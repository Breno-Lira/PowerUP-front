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

// Duelo
export interface DueloResumo {
  id: number | null;
  avatar1Id: number;
  avatar2Id: number;
  resultado: string;
  dataDuelo: string;
}

export interface RealizarDueloRequest {
  desafiantePerfilId: number;
  desafiadoPerfilId: number;
}

export interface AtributosCalculados {
  forca: number;
  resistencia: number;
  agilidade: number;
}

export const dueloService = {
  realizarDuelo: async (desafiantePerfilId: number, desafiadoPerfilId: number): Promise<DueloResumo> => {
    const response = await api.post<DueloResumo>('/duelos', {
      desafiantePerfilId,
      desafiadoPerfilId,
    });
    return response.data;
  },

  obterPorId: async (id: number): Promise<DueloResumo> => {
    const response = await api.get<DueloResumo>(`/duelos/${id}`);
    return response.data;
  },

  obterAtributosAvatar: async (avatarId: number): Promise<AtributosCalculados> => {
    const response = await api.get<AtributosCalculados>(`/avatars/${avatarId}/atributos`);
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

  removerAmizade: async (email1: string, email2: string): Promise<string> => {
    const email1Encoded = encodeURIComponent(email1);
    const email2Encoded = encodeURIComponent(email2);
    const response = await api.delete<string>(`/usuarios/${email1Encoded}/amizade/${email2Encoded}`);
    return response.data;
  },
};

// Perfil
export interface PerfilResumo {
  id: number;
  usuarioEmail: string;
  username: string;
  foto: string | null;
  estado: boolean;
  criacao: string;
}

export const perfilService = {
  obterPorEmail: async (email: string): Promise<PerfilResumo> => {
    try {
      const emailEncoded = encodeURIComponent(email);
      const response = await api.get<PerfilResumo>(`/perfis/usuario/${emailEncoded}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Perfil não encontrado para este email');
      }
      throw error;
    }
  },

  obterPorId: async (id: number): Promise<PerfilResumo> => {
    try {
      const response = await api.get<PerfilResumo>(`/perfis/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Perfil não encontrado');
      }
      throw error;
    }
  },
};

// Exercício
export interface ExercicioResumo {
  id: number;
  nome: string;
}

export const exercicioService = {
  listarTodos: async (): Promise<ExercicioResumo[]> => {
    const response = await api.get<ExercicioResumo[]>('/exercicios');
    return response.data;
  },

  obterPorId: async (id: number): Promise<ExercicioResumo> => {
    const response = await api.get<ExercicioResumo>(`/exercicios/${id}`);
    return response.data;
  },
};

// Plano de Treino
export type EstadoPlano = 'Ativo' | 'Historico';
export type Dias = 'Segunda' | 'Terca' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sabado' | 'Domingo';
export type TipoTreino = 'Cardio' | 'Peso';

export interface TreinoResumo {
  id: number | null;
  exercicioId: number;
  tipo: TipoTreino;
  repeticoes: number;
  peso: number;
  series: number;
  recordeCarga: number;
  distancia: number | null;
  tempo: string | null; // ISO string
}

export interface PlanoTreinoResumo {
  id: number | null;
  usuarioEmail: string;
  nome: string;
  estado: EstadoPlano;
  dias: Dias[];
  treinos: TreinoResumo[];
}

export interface CriarPlanoTreinoRequest {
  id: number | null;
  usuarioEmail: string;
  nome: string;
}

export interface AdicionarTreinoRequest {
  treinoId: number | null;
  exercicioId: number;
  tipo: TipoTreino;
  repeticoes: number;
  peso: number;
  series: number;
  distancia: number | null;
  tempo: string | null; // ISO string
}

export interface AtualizarTreinoRequest {
  exercicioId: number;
  tipo: TipoTreino;
  repeticoes: number;
  peso: number;
  series: number;
  distancia: number | null;
  tempo: string | null; // ISO string
}

export const planoTreinoService = {
  criarPlanoTreino: async (data: CriarPlanoTreinoRequest): Promise<PlanoTreinoResumo> => {
    const response = await api.post<PlanoTreinoResumo>('/planos-treino', data);
    return response.data;
  },

  obterPorId: async (id: number): Promise<PlanoTreinoResumo> => {
    const response = await api.get<PlanoTreinoResumo>(`/planos-treino/${id}`);
    return response.data;
  },

  listarPorUsuario: async (email: string): Promise<PlanoTreinoResumo[]> => {
    const emailEncoded = encodeURIComponent(email);
    const response = await api.get<PlanoTreinoResumo[]>(`/planos-treino/usuario/${emailEncoded}`);
    return response.data;
  },

  adicionarTreino: async (planoTId: number, data: AdicionarTreinoRequest): Promise<PlanoTreinoResumo> => {
    const response = await api.post<PlanoTreinoResumo>(`/planos-treino/${planoTId}/treinos`, data);
    return response.data;
  },

  removerTreino: async (planoTId: number, treinoId: number): Promise<PlanoTreinoResumo> => {
    const response = await api.delete<PlanoTreinoResumo>(`/planos-treino/${planoTId}/treinos/${treinoId}`);
    return response.data;
  },

  atualizarTreino: async (planoTId: number, treinoId: number, data: AtualizarTreinoRequest): Promise<PlanoTreinoResumo> => {
    const response = await api.put<PlanoTreinoResumo>(`/planos-treino/${planoTId}/treinos/${treinoId}`, data);
    return response.data;
  },

  adicionarDia: async (planoTId: number, dia: Dias): Promise<PlanoTreinoResumo> => {
    const response = await api.post<PlanoTreinoResumo>(`/planos-treino/${planoTId}/dias`, { dia });
    return response.data;
  },

  atualizarDias: async (planoTId: number, dias: Dias[]): Promise<PlanoTreinoResumo> => {
    const response = await api.put<PlanoTreinoResumo>(`/planos-treino/${planoTId}/dias`, { dias });
    return response.data;
  },

  alterarEstado: async (planoTId: number, estado: EstadoPlano): Promise<PlanoTreinoResumo> => {
    const response = await api.put<PlanoTreinoResumo>(`/planos-treino/${planoTId}/estado`, { estado });
    return response.data;
  },

  excluirPlanoTreino: async (planoTId: number): Promise<void> => {
    await api.delete(`/planos-treino/${planoTId}`);
  },
};

// Frequência
export interface FrequenciaResumo {
  id: number;
  perfilId: number;
  treinoId: number;
  dataDePresenca: string;
  planoTreinoId: number | null;
  foto: string | null;
}

export interface RegistrarPresencaRequest {
  perfilId: number;
  treinoId: number;
  planoTreinoId: number;
}

export interface RegistrarPresencaComFotoRequest {
  perfilId: number;
  treinoId: number;
  planoTreinoId: number;
  fotoBase64: string;
}

export interface RegistrarPresencaAutomaticaRequest {
  perfilId: number;
  usuarioEmail: string;
}

export interface RegistrarPresencaComFotoAutomaticaRequest {
  perfilId: number;
  usuarioEmail: string;
  fotoBase64: string;
}

export const frequenciaService = {
  obterPorId: async (id: number): Promise<FrequenciaResumo> => {
    const response = await api.get<FrequenciaResumo>(`/frequencias/${id}`);
    return response.data;
  },

  listarPorPerfil: async (perfilId: number): Promise<FrequenciaResumo[]> => {
    const response = await api.get<FrequenciaResumo[]>(`/frequencias/perfil/${perfilId}`);
    return response.data;
  },

  registrarPresenca: async (data: RegistrarPresencaRequest): Promise<void> => {
    await api.post('/frequencias/registrar', data);
  },

  registrarPresencaAutomatica: async (data: RegistrarPresencaAutomaticaRequest): Promise<void> => {
    await api.post('/frequencias/registrar-automatico', data);
  },

  registrarPresencaComFoto: async (data: RegistrarPresencaComFotoRequest): Promise<void> => {
    await api.post('/frequencias/registrar-com-foto', data);
  },

  registrarPresencaComFotoAutomatica: async (data: RegistrarPresencaComFotoAutomaticaRequest): Promise<void> => {
    await api.post('/frequencias/registrar-com-foto-automatico', data);
  },

  calcularSequenciaDias: async (perfilId: number, planoTreinoId: number): Promise<number> => {
    const response = await api.get<{ sequencia: number }>(`/frequencias/sequencia/${perfilId}/${planoTreinoId}`);
    return response.data.sequencia;
  },

  calcularFrequenciaSemanal: async (perfilId: number, planoTreinoId: number): Promise<number> => {
    const response = await api.get<{ frequencia: number }>(`/frequencias/semanal/${perfilId}/${planoTreinoId}`);
    return response.data.frequencia;
  },

  calcularSequenciaDiasTotal: async (perfilId: number): Promise<number> => {
    const response = await api.get<{ sequencia: number }>(`/frequencias/sequencia-total/${perfilId}`);
    return response.data.sequencia;
  },
};

// Equipe
export interface EquipeResumo {
  id: number;
  nome: string;
  descricao: string | null;
  foto: string | null;
  inicio: string | null;
  fim: string | null;
  usuarioAdm: string;
  usuariosEmails: string[];
  quantidadeMembros: number;
}

export interface CriarEquipeRequest {
  id?: number;
  nome: string;
  usuarioAdmEmail: string;
  descricao?: string;
}

export interface AdicionarMembroRequest {
  novoMembroEmail: string;
}

export interface AtualizarInformacoesRequest {
  nome: string;
  descricao: string | null;
  foto: string | null;
}

export interface DefinirPeriodoRequest {
  inicio: string | null;
  fim: string | null;
}

export const equipeService = {
  criarEquipe: async (data: CriarEquipeRequest): Promise<EquipeResumo> => {
    const response = await api.post<EquipeResumo>('/equipes', data);
    return response.data;
  },

  obterPorId: async (id: number): Promise<EquipeResumo> => {
    const response = await api.get<EquipeResumo>(`/equipes/${id}`);
    return response.data;
  },

  listarPorUsuario: async (email: string): Promise<EquipeResumo[]> => {
    const emailEncoded = encodeURIComponent(email);
    const response = await api.get<EquipeResumo[]>(`/equipes/usuario/${emailEncoded}`);
    return response.data;
  },

  adicionarMembro: async (equipeId: number, novoMembroEmail: string): Promise<EquipeResumo> => {
    const response = await api.post<EquipeResumo>(`/equipes/${equipeId}/membros`, {
      novoMembroEmail,
    });
    return response.data;
  },

  removerMembro: async (equipeId: number, membroEmail: string, usuarioEmail: string): Promise<EquipeResumo> => {
    const emailEncoded = encodeURIComponent(membroEmail);
    const usuarioEmailEncoded = encodeURIComponent(usuarioEmail);
    const response = await api.delete<EquipeResumo>(`/equipes/${equipeId}/membros/${emailEncoded}?usuarioEmail=${usuarioEmailEncoded}`);
    return response.data;
  },

  excluirEquipe: async (equipeId: number, usuarioEmail: string): Promise<void> => {
    const usuarioEmailEncoded = encodeURIComponent(usuarioEmail);
    await api.delete(`/equipes/${equipeId}?usuarioEmail=${usuarioEmailEncoded}`);
  },

  atualizarInformacoes: async (
    equipeId: number,
    data: AtualizarInformacoesRequest
  ): Promise<EquipeResumo> => {
    const response = await api.put<EquipeResumo>(`/equipes/${equipeId}`, data);
    return response.data;
  },

  definirPeriodo: async (
    equipeId: number,
    data: DefinirPeriodoRequest
  ): Promise<EquipeResumo> => {
    const response = await api.put<EquipeResumo>(`/equipes/${equipeId}/periodo`, data);
    return response.data;
  },

  isLider: async (equipeId: number, usuarioEmail: string): Promise<boolean> => {
    const emailEncoded = encodeURIComponent(usuarioEmail);
    const response = await api.get<boolean>(`/equipes/${equipeId}/is-lider/${emailEncoded}`);
    return response.data;
  },

  isMembro: async (equipeId: number, usuarioEmail: string): Promise<boolean> => {
    const emailEncoded = encodeURIComponent(usuarioEmail);
    const response = await api.get<boolean>(`/equipes/${equipeId}/is-membro/${emailEncoded}`);
    return response.data;
  },

  isMembro: async (equipeId: number, usuarioEmail: string): Promise<boolean> => {
    const emailEncoded = encodeURIComponent(usuarioEmail);
    const response = await api.get<boolean>(`/equipes/${equipeId}/is-membro/${emailEncoded}`);
    return response.data;
  },

  listarMembros: async (equipeId: number): Promise<string[]> => {
    const response = await api.get<string[]>(`/equipes/${equipeId}/membros`);
    return response.data;
  },

  obterRanking: async (equipeId: number): Promise<MembroRanking[]> => {
    const response = await api.get<MembroRanking[]>(`/equipes/${equipeId}/ranking`);
    return response.data;
  },
};

export interface MembroRanking {
  email: string;
  diasConsecutivos: number;
}

export default api;

