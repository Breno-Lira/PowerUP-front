import { useState, useEffect, useRef } from 'react';
import { Menu, Plus, Trash2, X, Search, ChevronDown, User, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UserInfoHeader } from '@/components/UserInfoHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  nutricaoService,
  perfilService,
  type Objetivo,
  type TipoRefeicao,
  type PlanoNutricional,
  type Alimento,
  type PerfilResumo,
} from '@/services/api';

interface AlimentoDisplay {
  id: number;
  nome: string;
  gramas: string;
  calorias: number;
}

interface RefeicaoDisplay {
  id: number;
  nome: string;
  horario: string;
  totalCalorias: number;
  alimentos: AlimentoDisplay[];
  tipo: TipoRefeicao;
}

interface NutricaoData {
  objetivo: Objetivo;
  metaCalorias: number;
  caloriasConsumidas: number;
  caloriasRestantes: number;
  percentual: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  refeicoes: RefeicaoDisplay[];
  planoId: number | null;
}

const TIPO_REFEICAO_MAP: Record<TipoRefeicao, { nome: string; horario: string }> = {
  CafeDaManha: { nome: 'Café da manhã', horario: '08:00' },
  Lanche: { nome: 'Lanche', horario: '10:00' },
  Almoco: { nome: 'Almoço', horario: '12:00' },
  Jantar: { nome: 'Jantar', horario: '20:00' },
};

export function Nutricao() {
  const navigate = useNavigate();

  // Obter dados do usuário logado
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = userData?.email;
  const [perfilUsuario, setPerfilUsuario] = useState<PerfilResumo | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nutricao, setNutricao] = useState<NutricaoData>({
    objetivo: 'Bulking',
    metaCalorias: 2500,
    caloriasConsumidas: 0,
    caloriasRestantes: 2500,
    percentual: 0,
    proteinas: 0,
    carboidratos: 0,
    gorduras: 0,
    refeicoes: [],
    planoId: null,
  });

  const [showRefeicaoDialog, setShowRefeicaoDialog] = useState(false);
  const [showCriarPlanoDialog, setShowCriarPlanoDialog] = useState(false);
  const [refeicaoEditando, setRefeicaoEditando] = useState<RefeicaoDisplay | null>(null);
  const [todosPlanos, setTodosPlanos] = useState<PlanoNutricional[]>([]);
  const [planoSelecionadoId, setPlanoSelecionadoId] = useState<number | null>(null);
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [alimentosSelecionados, setAlimentosSelecionados] = useState<number[]>([]);
  const [buscaAlimento, setBuscaAlimento] = useState('');
  const [mostrarDropdownAlimentos, setMostrarDropdownAlimentos] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [novaRefeicao, setNovaRefeicao] = useState({
    tipo: 'CafeDaManha' as TipoRefeicao,
    alimentosIds: [] as number[],
  });
  const [novoPlano, setNovoPlano] = useState({
    objetivo: 'Bulking' as Objetivo,
    metaCalorias: 2500,
  });

  const menuItems = [
    { label: 'Home', path: '/home' },
    { label: 'Treinos', path: '/treinos' },
    { label: 'Nutrição', path: '/nutricao' },
    { label: 'Feedback', path: '/feedback' },
    { label: 'Loja', path: '/loja' },
    { label: 'Ranking', path: '/ranking' },
    { label: 'Perfil', path: '/perfil' },
    { label: 'Social', path: '/social' },
    { label: 'Arena Duelos', path: '/arena-duelos' },
    { label: 'Meta', path: '/meta' },
  ];

  useEffect(() => {
    // Carregar perfil para obter foto
    if (userData?.perfilId) {
      perfilService.obterPorId(userData.perfilId)
        .then(setPerfilUsuario)
        .catch(console.error);
    }

    if (userEmail) {
      carregarDados();
      carregarAlimentos();
    } else {
      setError('Usuário não autenticado');
      setLoading(false);
    }
  }, [userEmail, userData?.perfilId]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMostrarDropdownAlimentos(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const carregarAlimentos = async () => {
    try {
      console.log('[NUTRICAO] Carregando alimentos...');
      const alimentosList = await nutricaoService.listarAlimentos();
      console.log('[NUTRICAO] Alimentos carregados:', alimentosList);
      setAlimentos(alimentosList);
    } catch (err: any) {
      console.error('[NUTRICAO] Erro ao carregar alimentos:', err);
      console.error('[NUTRICAO] Erro detalhado:', err.response?.data || err.message);
      setError('Erro ao carregar alimentos: ' + (err.response?.data?.erro || err.message));
    }
  };

  const carregarDados = async () => {
    if (!userEmail) return;

    try {
      setLoading(true);
      setError('');

      // Carregar planos do usuário
      let planos: PlanoNutricional[] = [];
      try {
        planos = await nutricaoService.listarPlanosPorUsuario(userEmail);
      } catch (err: any) {
        // Se não houver planos (404), usar array vazio (normal para usuário novo)
        if (err.response?.status === 404 || err.message?.includes('404')) {
          planos = [];
        } else {
          console.error('Erro ao carregar planos:', err);
          // Não mostrar erro se for apenas falta de planos
          if (err.response?.status !== 404) {
            throw err;
          }
        }
      }

      // Armazenar todos os planos
      setTodosPlanos(planos);

      if (planos.length > 0) {
        // Se não há plano selecionado, usar o último criado (maior ID)
        let planoAtivo: PlanoNutricional | undefined;
        if (planoSelecionadoId) {
          // Verificar se o plano selecionado ainda existe
          planoAtivo = planos.find(p => p.id.id === planoSelecionadoId);
          if (!planoAtivo) {
            // Se o plano selecionado não existe mais, usar o último criado
            planoAtivo = planos.reduce((prev, current) =>
              (current.id.id > prev.id.id) ? current : prev
            );
            setPlanoSelecionadoId(planoAtivo.id.id);
          }
        } else {
          // Pegar o último plano criado (maior ID)
          planoAtivo = planos.reduce((prev, current) =>
            (current.id.id > prev.id.id) ? current : prev
          );
          setPlanoSelecionadoId(planoAtivo.id.id);
        }

        if (!planoAtivo) {
          // Fallback: usar o primeiro plano se algo der errado
          planoAtivo = planos[0];
          setPlanoSelecionadoId(planoAtivo.id.id);
        }

        // Carregar refeições
        const todasRefeicoes = await nutricaoService.listarRefeicoes();
        console.log('[FRONTEND] Plano ativo selecionado:', {
          id: planoAtivo.id.id,
          objetivo: planoAtivo.objetivo,
          refeicoesIds: planoAtivo.refeicoes
        });
        console.log('[FRONTEND] Todas as refeições carregadas:', todasRefeicoes.map(r => ({
          id: r.id?.id || r.id,
          tipo: r.tipo
        })));

        // Extrair IDs de refeições do plano (pode ser array de objetos {id: number} ou array de números)
        const refeicoesIdsDoPlano: number[] = planoAtivo.refeicoes?.map((ref) => {
          // Se ref é um objeto com propriedade id, retornar ref.id
          // Se ref é um número, retornar ref diretamente
          if (typeof ref === 'object' && ref !== null && 'id' in ref) {
            return (ref as { id: number }).id;
          }
          return ref as number;
        }) || [];

        console.log('[FRONTEND] IDs de refeições do plano ativo:', refeicoesIdsDoPlano);

        // Filtrar refeições que pertencem ao plano ativo
        const refeicoesDoPlano = todasRefeicoes.filter((r) => {
          const refeicaoId: number = (r.id && typeof r.id === 'object' && 'id' in r.id)
            ? (r.id as { id: number }).id
            : (r.id as number);
          const pertence = refeicoesIdsDoPlano.includes(refeicaoId);
          console.log(`[FRONTEND] Refeição ID ${refeicaoId} pertence ao plano ${planoAtivo.id.id}? ${pertence}`);
          return pertence;
        });

        console.log('[FRONTEND] Refeições filtradas para o plano:', refeicoesDoPlano.map(r => ({
          id: r.id?.id || r.id,
          tipo: r.tipo
        })));

        const refeicoesDisplay: RefeicaoDisplay[] = refeicoesDoPlano.map((r) => ({
          id: r.id.id,
          nome: TIPO_REFEICAO_MAP[r.tipo].nome,
          horario: TIPO_REFEICAO_MAP[r.tipo].horario,
          totalCalorias: r.caloriasTotais,
          alimentos: r.alimentos.map((a) => {
            // Buscar o alimento na lista carregada
            const alimentoInfo = alimentos.find(ali => ali.id === a.id);
            return {
              id: a.id,
              nome: alimentoInfo ? alimentoInfo.nome : `Alimento ${a.id}`,
              gramas: alimentoInfo ? `${alimentoInfo.gramas}g` : '0g',
              calorias: alimentoInfo ? alimentoInfo.calorias : 0,
            };
          }),
          tipo: r.tipo,
        }));

        const caloriasConsumidas = refeicoesDisplay.reduce(
          (acc, r) => acc + r.totalCalorias,
          0
        );
        const metaCalorias = planoAtivo.caloriasObjetivo || (planoAtivo.objetivo === 'Cutting' ? 2000 : 2500);
        const caloriasRestantes = Math.max(0, metaCalorias - caloriasConsumidas);
        const percentual = Math.round((caloriasConsumidas / metaCalorias) * 100);

        // Calcular macronutrientes somando os gramas de cada categoria
        let proteinas = 0;
        let carboidratos = 0;
        let gorduras = 0;

        refeicoesDoPlano.forEach((refeicao) => {
          refeicao.alimentos.forEach((alimentoRef) => {
            const alimentoInfo = alimentos.find(ali => ali.id === alimentoRef.id);
            if (alimentoInfo) {
              if (alimentoInfo.categoria === 'Proteina') {
                proteinas += alimentoInfo.gramas;
              } else if (alimentoInfo.categoria === 'Carboidrato') {
                carboidratos += alimentoInfo.gramas;
              } else if (alimentoInfo.categoria === 'Gordura') {
                gorduras += alimentoInfo.gramas;
              }
            }
          });
        });

        setNutricao({
          objetivo: planoAtivo.objetivo,
          metaCalorias,
          caloriasConsumidas,
          caloriasRestantes,
          percentual,
          proteinas,
          carboidratos,
          gorduras,
          refeicoes: refeicoesDisplay,
          planoId: planoAtivo.id.id,
        });
      } else {
        // Sem plano, usar valores padrão
        setPlanoSelecionadoId(null);
        setNutricao({
          objetivo: 'Bulking',
          metaCalorias: 2500,
          caloriasConsumidas: 0,
          caloriasRestantes: 2500,
          percentual: 0,
          proteinas: 0,
          carboidratos: 0,
          gorduras: 0,
          refeicoes: [],
          planoId: null,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados de nutrição');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarPlano = async () => {
    if (!userEmail) return;

    try {
      // Salvar o plano selecionado atual antes de criar o novo
      const planoAnteriorId = planoSelecionadoId;

      const plano = await nutricaoService.criarPlano({
        objetivo: novoPlano.objetivo,
        refeicoesIds: [], // SEMPRE criar plano vazio, sem refeições
        usuarioEmail: userEmail,
        caloriasObjetivo: novoPlano.metaCalorias, // Enviar a meta de calorias definida pelo usuário
      });

      console.log('[FRONTEND] Novo plano criado:', {
        id: plano.id.id,
        objetivo: plano.objetivo,
        refeicoesIds: plano.refeicoes
      });
      console.log('[FRONTEND] Plano anterior selecionado:', planoAnteriorId);

      // Selecionar o novo plano criado
      setPlanoSelecionadoId(plano.id.id);

      // Recarregar dados - isso deve manter as refeições do plano anterior no plano anterior
      await carregarDados();

      setShowCriarPlanoDialog(false);
      setNovoPlano({ objetivo: 'Bulking', metaCalorias: 2500 }); // Resetar formulário
    } catch (err: any) {
      setError(err.message || 'Erro ao criar plano nutricional');
    }
  };

  const handleSelecionarPlano = async (planoId: number) => {
    // Prevenir múltiplas chamadas simultâneas se já estiver selecionado
    if (planoSelecionadoId === planoId) {
      return;
    }

    // Atualizar o plano selecionado imediatamente para feedback visual
    setPlanoSelecionadoId(planoId);
    // Recarregar dados para atualizar a visualização
    await carregarDados();
  };

  const handleAdicionarRefeicao = () => {
    if (!planoSelecionadoId) {
      setError('É necessário criar um plano nutricional primeiro');
      setNovoPlano({ objetivo: 'Bulking', metaCalorias: 2500 });
      setShowCriarPlanoDialog(true);
      return;
    }

    setRefeicaoEditando(null);
    setAlimentosSelecionados([]);
    setBuscaAlimento('');
    setMostrarDropdownAlimentos(false);
    setNovaRefeicao({
      tipo: 'CafeDaManha',
      alimentosIds: [],
    });
    setShowRefeicaoDialog(true);
  };

  const handleSalvarRefeicao = async () => {
    if (!userEmail || !planoSelecionadoId) {
      setError('É necessário criar um plano nutricional primeiro');
      return;
    }

    try {
      // Usar os alimentos selecionados
      const alimentosIds = alimentosSelecionados.length > 0
        ? alimentosSelecionados
        : novaRefeicao.alimentosIds;

      const refeicao = await nutricaoService.criarRefeicao({
        tipo: novaRefeicao.tipo,
        alimentosIds: alimentosIds,
        caloriasTotais: null, // Será calculado automaticamente no backend
        inicio: null,
        fim: null,
      });

      // Buscar o plano ativo atual para obter as refeições corretas
      const planoAtivo = todosPlanos.find(p => p.id.id === planoSelecionadoId);
      if (!planoAtivo) {
        throw new Error('Plano não encontrado');
      }

      // Extrair IDs de refeições do plano ativo
      const refeicoesIdsAtuais: number[] = planoAtivo.refeicoes?.map((ref) => {
        if (typeof ref === 'object' && ref !== null && 'id' in ref) {
          return (ref as { id: number }).id;
        }
        return ref as number;
      }) || [];

      const novoRefeicaoId = typeof refeicao.id === 'object' && refeicao.id !== null && 'id' in refeicao.id
        ? (refeicao.id as { id: number }).id
        : (refeicao.id as number);

      console.log('[FRONTEND] Adicionando refeição ao plano:', {
        planoId: planoSelecionadoId,
        objetivo: planoAtivo.objetivo,
        refeicoesIdsAtuais,
        novoRefeicaoId,
        refeicoesIdsFinais: [...refeicoesIdsAtuais, novoRefeicaoId]
      });

      await nutricaoService.modificarPlano({
        planoId: planoSelecionadoId,
        objetivo: planoAtivo.objetivo,
        refeicoesIds: [...refeicoesIdsAtuais, novoRefeicaoId],
      });

      // Limpar estado do formulário
      setAlimentosSelecionados([]);
      setBuscaAlimento('');
      setMostrarDropdownAlimentos(false);
      setNovaRefeicao({
        tipo: 'CafeDaManha',
        alimentosIds: [],
      });
      setShowRefeicaoDialog(false);

      // Recarregar dados para atualizar a lista de refeições
      await carregarDados();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar refeição');
    }
  };

  const handleExcluirRefeicao = async (refeicaoId: number) => {
    if (!planoSelecionadoId) return;

    try {
      await nutricaoService.excluirRefeicao(refeicaoId);

      // Buscar o plano ativo atual para obter as refeições corretas
      const planoAtivo = todosPlanos.find(p => p.id.id === planoSelecionadoId);
      if (!planoAtivo) {
        throw new Error('Plano não encontrado');
      }

      // Extrair IDs de refeições do plano ativo e remover a refeição excluída
      const refeicoesIdsAtuais: number[] = planoAtivo.refeicoes?.map((ref) => {
        if (typeof ref === 'object' && ref !== null && 'id' in ref) {
          return (ref as { id: number }).id;
        }
        return ref as number;
      }).filter(id => id !== refeicaoId) || [];

      // Remover refeição do plano
      await nutricaoService.modificarPlano({
        planoId: planoSelecionadoId,
        objetivo: planoAtivo.objetivo,
        refeicoesIds: refeicoesIdsAtuais,
      });

      await carregarDados();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir refeição');
    }
  };

  const handleDeletarPlano = async (planoId: number, event?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevenir que o clique no botão selecione o plano
    if (event) {
      event.stopPropagation();
    }

    if (!confirm('Tem certeza que deseja deletar este plano nutricional?')) return;

    try {
      // Excluir o plano no backend (isso também remove as refeições associadas via cascade ou manualmente)
      await nutricaoService.excluirPlano(planoId);

      // Se o plano deletado era o ativo, limpar seleção
      if (planoSelecionadoId === planoId) {
        setPlanoSelecionadoId(null);
      }

      // Recarregar dados para atualizar a lista
      await carregarDados();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar plano');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header com Menu */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] flex flex-col h-full">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              {/* Informações do usuário logado */}
              <div className="mt-6 mb-6 pb-6 border-b">
                <div className="flex items-center gap-3 px-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={perfilUsuario?.foto || undefined} alt={perfilUsuario?.username || 'Usuário'} />
                    <AvatarFallback className="bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {perfilUsuario?.username || userData?.username || userEmail || 'Usuário'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {userEmail || 'email@exemplo.com'}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="space-y-2 flex-1 overflow-auto">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                    }}
                    className="w-full text-left px-4 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-6 pb-4">
                <Button
                  variant="destructive"
                  className="w-full justify-center gap-2"
                  onClick={() => {
                    localStorage.removeItem('user');
                    navigate('/login');
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="ml-auto hidden sm:block">
            <UserInfoHeader variant="inline" />
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header da Página */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Nutrição</h1>
            <p className="text-muted-foreground">Planeja suas refeições</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowCriarPlanoDialog(true)}
            className="ml-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            {todosPlanos.length > 0 ? 'Novo Plano' : 'Criar Plano'}
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Seletor de Planos */}
        {todosPlanos.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Seus Planos Nutricionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {todosPlanos.map((plano) => (
                  <Card
                    key={plano.id.id}
                    className={`cursor-pointer transition-all relative ${planoSelecionadoId === plano.id.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-accent/50'
                      }`}
                    onClick={() => handleSelecionarPlano(plano.id.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold capitalize">{plano.objetivo}</span>
                        <div className="flex items-center gap-2">
                          {planoSelecionadoId === plano.id.id && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              Ativo
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletarPlano(plano.id.id, e);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Meta: {plano.caloriasObjetivo || (plano.objetivo === 'Cutting' ? 2000 : 2500)} cal
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {plano.refeicoes?.length || 0} refeições
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-lg font-semibold mb-2">Nenhum plano nutricional criado</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie seu primeiro plano nutricional para começar a planejar suas refeições
                </p>
                <Button onClick={() => setShowCriarPlanoDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Plano
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumo Diário - Só mostra se houver um plano selecionado */}
        {planoSelecionadoId && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Hoje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {nutricao.caloriasConsumidas} / {nutricao.metaCalorias} cal
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Restantes</p>
                    <p className="text-lg font-semibold">{nutricao.caloriasRestantes} cal</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">{nutricao.percentual}%</span>
                  </div>
                  <Progress value={nutricao.percentual} />
                </div>
              </CardContent>
            </Card>

            {/* Macronutrientes */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Proteína</p>
                    <p className="text-2xl font-bold">{nutricao.proteinas}g</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Carbo</p>
                    <p className="text-2xl font-bold">{nutricao.carboidratos}g</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Gordura</p>
                    <p className="text-2xl font-bold">{nutricao.gorduras}g</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Botão Criar Plano ou Adicionar Refeição */}
        {!planoSelecionadoId ? (
          <Button className="w-full" size="lg" onClick={() => setShowCriarPlanoDialog(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Criar Primeiro Plano Nutricional
          </Button>
        ) : (
          <Button className="w-full" size="lg" onClick={handleAdicionarRefeicao}>
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Refeição
          </Button>
        )}

        {/* Plano Ativo - Só mostra se houver um plano selecionado */}
        {planoSelecionadoId && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Plano {todosPlanos.find(p => p.id.id === planoSelecionadoId)?.objetivo || 'Nutricional'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {nutricao.refeicoes.reduce((acc, r) => acc + r.totalCalorias, 0)} cal
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (planoSelecionadoId) {
                        handleDeletarPlano(planoSelecionadoId, e);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {nutricao.refeicoes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma refeição cadastrada. Clique em "Adicionar Refeição" para começar.
                </p>
              ) : (
                nutricao.refeicoes.map((refeicao) => (
                  <div key={refeicao.id} className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <h3 className="font-semibold">{refeicao.nome}</h3>
                        <p className="text-sm text-muted-foreground">{refeicao.horario}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{refeicao.totalCalorias} cal</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleExcluirRefeicao(refeicao.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 pl-4">
                      {refeicao.alimentos.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum alimento cadastrado
                        </p>
                      ) : (
                        refeicao.alimentos.map((alimento) => (
                          <div
                            key={alimento.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{alimento.nome}</span>
                              <span className="text-muted-foreground">
                                {alimento.gramas}
                              </span>
                            </div>
                            <span className="text-muted-foreground">{alimento.calorias} cal</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog para Criar Plano Nutricional */}
      <Dialog open={showCriarPlanoDialog} onOpenChange={setShowCriarPlanoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Plano Nutricional</DialogTitle>
            <DialogDescription>
              Defina seu objetivo e meta de calorias personalizada
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="objetivo-plano">Objetivo</Label>
              <select
                id="objetivo-plano"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={novoPlano.objetivo}
                onChange={(e) =>
                  setNovoPlano({
                    ...novoPlano,
                    objetivo: e.target.value as Objetivo,
                    metaCalorias: e.target.value === 'Cutting' ? 2000 : 2500,
                  })
                }
              >
                <option value="Cutting">Cutting</option>
                <option value="Bulking">Bulking</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta-calorias">Meta de Calorias (kcal)</Label>
              <Input
                id="meta-calorias"
                type="number"
                value={novoPlano.metaCalorias || ''}
                onChange={(e) =>
                  setNovoPlano({
                    ...novoPlano,
                    metaCalorias: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Ex: 2500"
                min="1000"
                max="5000"
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: Cutting ~2000 cal | Bulking ~2500 cal
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCriarPlanoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarPlano}>Criar Plano</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Adicionar/Editar Refeição */}
      <Dialog open={showRefeicaoDialog} onOpenChange={setShowRefeicaoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {refeicaoEditando ? 'Editar Refeição' : 'Adicionar Refeição'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da refeição
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Refeição</Label>
              <select
                id="tipo"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={novaRefeicao.tipo}
                onChange={(e) =>
                  setNovaRefeicao({ ...novaRefeicao, tipo: e.target.value as TipoRefeicao })
                }
              >
                <option value="CafeDaManha">Café da manhã</option>
                <option value="Lanche">Lanche</option>
                <option value="Almoco">Almoço</option>
                <option value="Jantar">Jantar</option>
              </select>
            </div>
            {alimentosSelecionados.length > 0 && (
              <div className="space-y-2">
                <Label>Calorias Totais (calculadas automaticamente)</Label>
                <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm font-medium">
                  {alimentosSelecionados.reduce((total, id) => {
                    const alimento = alimentos.find(a => a.id === id);
                    return total + (alimento?.calorias || 0);
                  }, 0)} cal
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="alimentos">Alimentos</Label>
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="alimentos"
                    type="text"
                    placeholder="Pesquisar e selecionar alimentos..."
                    value={buscaAlimento}
                    onChange={(e) => {
                      setBuscaAlimento(e.target.value);
                      setMostrarDropdownAlimentos(true);
                    }}
                    onFocus={() => setMostrarDropdownAlimentos(true)}
                    className="pl-9 pr-9"
                  />
                  <ChevronDown
                    className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform ${mostrarDropdownAlimentos ? 'rotate-180' : ''
                      }`}
                  />
                </div>
                {mostrarDropdownAlimentos && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg">
                    {alimentos
                      .filter((alimento) => {
                        const busca = buscaAlimento.toLowerCase();
                        return (
                          alimento.nome.toLowerCase().includes(busca) ||
                          alimento.categoria.toLowerCase().includes(busca) ||
                          alimento.calorias.toString().includes(busca)
                        );
                      })
                      .filter((alimento) => !alimentosSelecionados.includes(alimento.id))
                      .length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {buscaAlimento
                          ? 'Nenhum alimento encontrado'
                          : 'Todos os alimentos já foram selecionados'}
                      </div>
                    ) : (
                      alimentos
                        .filter((alimento) => {
                          const busca = buscaAlimento.toLowerCase();
                          return (
                            alimento.nome.toLowerCase().includes(busca) ||
                            alimento.categoria.toLowerCase().includes(busca) ||
                            alimento.calorias.toString().includes(busca)
                          );
                        })
                        .filter((alimento) => !alimentosSelecionados.includes(alimento.id))
                        .map((alimento) => (
                          <button
                            key={alimento.id}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            onClick={() => {
                              const novosIds = [...alimentosSelecionados, alimento.id];
                              setAlimentosSelecionados(novosIds);
                              setNovaRefeicao({ ...novaRefeicao, alimentosIds: novosIds });
                              setBuscaAlimento('');
                              setMostrarDropdownAlimentos(false);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{alimento.nome}</span>
                              <span className="text-xs text-muted-foreground">
                                {alimento.calorias} cal • {alimento.categoria}
                              </span>
                            </div>
                          </button>
                        ))
                    )}
                  </div>
                )}
              </div>
              {alimentosSelecionados.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium">Alimentos selecionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {alimentosSelecionados.map((id) => {
                      const alimento = alimentos.find((a) => a.id === id);
                      return alimento ? (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs"
                        >
                          {alimento.nome}
                          <button
                            type="button"
                            onClick={() => {
                              const novosIds = alimentosSelecionados.filter((aid) => aid !== id);
                              setAlimentosSelecionados(novosIds);
                              setNovaRefeicao({ ...novaRefeicao, alimentosIds: novosIds });
                            }}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefeicaoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarRefeicao}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
