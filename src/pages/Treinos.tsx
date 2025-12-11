import { useState, useEffect } from 'react';
import { Menu, Plus, Pencil, Trash2, Play, Check, Camera, X, Loader2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  planoTreinoService, 
  exercicioService,
  frequenciaService,
  perfilService,
  PlanoTreinoResumo,
  ExercicioResumo,
  TipoTreino,
  FrequenciaResumo,
  Dias,
  PerfilResumo
} from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Treinos() {
  const navigate = useNavigate();
  const [abaPrincipal, setAbaPrincipal] = useState('treino');
  const [abaPlanos, setAbaPlanos] = useState('ativo');
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalNovoPlanoAberto, setModalNovoPlanoAberto] = useState(false);
  const [planoEditando, setPlanoEditando] = useState<PlanoTreinoResumo | null>(null);
  const [nomeNovoPlano, setNomeNovoPlano] = useState('');
  const [novoExercicio, setNovoExercicio] = useState({
    exercicioId: '',
    peso: '',
    repeticoes: '',
    series: '',
    tipo: 'Peso' as TipoTreino,
    distancia: '',
    tempo: '',
  });
  const [periodoGrafico, setPeriodoGrafico] = useState<'5dias' | 'mensal' | 'anual'>('5dias');
  const [metaSemanal, setMetaSemanal] = useState(5);
  const [mostrarCheckin, setMostrarCheckin] = useState(true);
  const [planosAtivos, setPlanosAtivos] = useState<PlanoTreinoResumo[]>([]);
  const [planosHistoricos, setPlanosHistoricos] = useState<PlanoTreinoResumo[]>([]);
  const [exercicios, setExercicios] = useState<ExercicioResumo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  
  // Estados para frequência
  const [perfilId, setPerfilId] = useState<number | null>(null);
  const [planoTreinoSelecionado, setPlanoTreinoSelecionado] = useState<PlanoTreinoResumo | null>(null);
  const [sequenciaDias, setSequenciaDias] = useState(0);
  const [frequenciaSemanal, setFrequenciaSemanal] = useState(0);
  const [frequencias, setFrequencias] = useState<FrequenciaResumo[]>([]);
  const [registrandoFrequencia, setRegistrandoFrequencia] = useState(false);
  const [editandoDias, setEditandoDias] = useState<number | null>(null);

  // Obter dados do usuário logado
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = userData?.email;
  const [perfilUsuario, setPerfilUsuario] = useState<PerfilResumo | null>(null);

  const carregarDados = async () => {
    if (!userEmail) return;
    
    setCarregando(true);
    setErro(null);
    try {
      const [planos, exerciciosList, perfil] = await Promise.all([
        planoTreinoService.listarPorUsuario(userEmail),
        exercicioService.listarTodos(),
        perfilService.obterPorEmail(userEmail).catch(() => null),
      ]);
      
      setPlanosAtivos(planos.filter(p => p.estado === 'Ativo'));
      setPlanosHistoricos(planos.filter(p => p.estado === 'Historico'));
      setExercicios(exerciciosList);
      
      if (perfil) {
        setPerfilId(perfil.id);
        // Selecionar o primeiro plano ativo por padrão
        const primeiroPlanoAtivo = planos.find(p => p.estado === 'Ativo');
        if (primeiroPlanoAtivo) {
          setPlanoTreinoSelecionado(primeiroPlanoAtivo);
        }
        // Calcular meta semanal como soma de todos os dias de todos os planos ativos
        const totalDias = planos
          .filter(p => p.estado === 'Ativo')
          .reduce((sum, p) => sum + p.dias.length, 0);
        setMetaSemanal(totalDias);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const carregarFrequencias = async () => {
    if (!perfilId || planosAtivos.length === 0) return;
    
    try {
      const frequenciasList = await frequenciaService.listarPorPerfil(perfilId);
      
      // Calcular sequência total considerando todos os planos
      const sequenciaTotal = await frequenciaService.calcularSequenciaDiasTotal(perfilId);
      
      // Calcular frequência semanal de todos os planos ativos
      const frequenciasSemanais = await Promise.all(
        planosAtivos.map(plano => 
          frequenciaService.calcularFrequenciaSemanal(perfilId, plano.id!)
        )
      );
      const frequenciaTotal = frequenciasSemanais.reduce((sum, freq) => sum + freq, 0);
      
      // Filtrar frequências do plano selecionado ou todas se não houver seleção
      const frequenciasFiltradas = planoTreinoSelecionado?.id
        ? frequenciasList.filter(f => f.planoTreinoId === planoTreinoSelecionado.id)
        : frequenciasList;
      
      setFrequencias(frequenciasFiltradas);
      setSequenciaDias(sequenciaTotal);
      setFrequenciaSemanal(frequenciaTotal);
    } catch (error: any) {
      console.error('Erro ao carregar frequências:', error);
    }
  };

  // Carregar perfil para obter foto
  useEffect(() => {
    if (userData?.perfilId) {
      perfilService.obterPorId(userData.perfilId)
        .then(setPerfilUsuario)
        .catch(console.error);
    }
  }, [userData?.perfilId]);

  // Carregar planos de treino e exercícios
  useEffect(() => {
    if (userEmail) {
      carregarDados();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  // Carregar frequências quando perfilId ou planos ativos mudarem
  useEffect(() => {
    if (perfilId && planosAtivos.length > 0) {
      carregarFrequencias();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfilId, planosAtivos]);

  // Recalcular meta semanal quando planos ativos mudarem
  useEffect(() => {
    const totalDias = planosAtivos.reduce((sum, p) => sum + p.dias.length, 0);
    setMetaSemanal(totalDias);
  }, [planosAtivos]);

  const menuItems = [
    { label: 'Home', path: '/home' },
    { label: 'Treinos', path: '/treinos' },
    { label: 'Nutrição', path: '/nutricao' },
    { label: 'Feedback', path: '/feedback' },
    { label: 'Loja', path: '/loja' },
    { label: 'Ranking', path: '/ranking' },
    { label: 'Perfil', path: '/perfil' },
    { label: 'Social', path: '/social' },
  ];


  const handleEditar = (planoId: number | null) => {
    const plano = [...planosAtivos, ...planosHistoricos].find((p) => p.id === planoId);
    if (plano) {
      setPlanoEditando(plano);
      setModalEditarAberto(true);
    }
  };

  const handleAdicionarExercicio = async () => {
    if (!planoEditando || !novoExercicio.exercicioId || !novoExercicio.repeticoes) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    const repeticoes = parseInt(novoExercicio.repeticoes);
    const series = parseInt(novoExercicio.series) || 3;
    const peso = parseFloat(novoExercicio.peso) || 0;
    const distancia = novoExercicio.distancia ? parseFloat(novoExercicio.distancia) : null;
    const tempo = novoExercicio.tempo ? new Date(novoExercicio.tempo).toISOString() : null;

    if (isNaN(repeticoes) || isNaN(series)) {
      setErro('Repetições e séries devem ser números válidos.');
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      await planoTreinoService.adicionarTreino(planoEditando.id!, {
        treinoId: null,
        exercicioId: parseInt(novoExercicio.exercicioId),
        tipo: novoExercicio.tipo,
        repeticoes,
        peso,
        series,
        distancia,
        tempo,
      });

      // Recarregar dados
      await carregarDados();
      
      // Reset form
      setNovoExercicio({
        exercicioId: '',
        peso: '',
        repeticoes: '',
        series: '',
        tipo: 'Peso',
        distancia: '',
        tempo: '',
      });
    } catch (error: any) {
      console.error('Erro ao adicionar exercício:', error);
      setErro(error.response?.data || error.message || 'Erro ao adicionar exercício.');
    } finally {
      setCarregando(false);
    }
  };

  const handleFecharModal = () => {
    setModalEditarAberto(false);
    setPlanoEditando(null);
    setNovoExercicio({
      exercicioId: '',
      peso: '',
      repeticoes: '',
      series: '',
      tipo: 'Peso',
      distancia: '',
      tempo: '',
    });
    setErro(null);
  };

  const handleCriarNovoPlano = async () => {
    if (!nomeNovoPlano.trim() || !userEmail) {
      setErro('Preencha o nome do plano.');
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      await planoTreinoService.criarPlanoTreino({
        id: null,
        usuarioEmail: userEmail,
        nome: nomeNovoPlano,
      });

      // Recarregar dados
      await carregarDados();
      
      // Fechar modal e reset
      setModalNovoPlanoAberto(false);
      setNomeNovoPlano('');
    } catch (error: any) {
      console.error('Erro ao criar plano:', error);
      setErro(error.response?.data || error.message || 'Erro ao criar plano de treino.');
    } finally {
      setCarregando(false);
    }
  };

  const handleFecharModalNovoPlano = () => {
    setModalNovoPlanoAberto(false);
    setNomeNovoPlano('');
    setErro(null);
  };

  const handleDeletar = async (planoId: number | null) => {
    if (!planoId || !confirm('Tem certeza que deseja excluir este plano de treino?')) {
      return;
    }

    setCarregando(true);
    try {
      await planoTreinoService.excluirPlanoTreino(planoId);
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao deletar plano:', error);
      setErro(error.response?.data || error.message || 'Erro ao deletar plano.');
    } finally {
      setCarregando(false);
    }
  };

  const handleAtualizarDiasPlano = async (planoId: number, novosDias: Dias[]) => {
    setCarregando(true);
    setErro(null);
    try {
      await planoTreinoService.atualizarDias(planoId, novosDias);
      await carregarDados();
      setMensagemSucesso('Dias da semana atualizados com sucesso!');
      setEditandoDias(null);
    } catch (error: any) {
      console.error('Erro ao atualizar dias:', error);
      setErro('Erro ao atualizar dias da semana.');
    } finally {
      setCarregando(false);
    }
  };

  const handleRegistrarFrequencia = async (comFoto: boolean = false) => {
    if (!perfilId || !userEmail) {
      setErro('Dados do usuário não encontrados.');
      return;
    }

    setRegistrandoFrequencia(true);
    setErro(null);

    try {
      if (comFoto) {
        // Criar input de arquivo temporário
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) {
            setRegistrandoFrequencia(false);
            return;
          }

          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            const base64Data = base64.split(',')[1]; // Remove o prefixo data:image/...

            try {
              await frequenciaService.registrarPresencaComFotoAutomatica({
                perfilId,
                usuarioEmail: userEmail,
                fotoBase64: base64Data,
              });
              setMensagemSucesso('Frequência registrada com foto com sucesso!');
              await carregarFrequencias();
              await carregarDados(); // Recarregar para atualizar os planos
            } catch (error: any) {
              console.error('Erro ao registrar frequência com foto:', error);
              const mensagemErro = error.response?.data?.mensagem || error.message || 'Erro ao registrar frequência com foto.';
              setErro(mensagemErro);
              setTimeout(() => setErro(null), 5000);
            } finally {
              setRegistrandoFrequencia(false);
            }
          };
          reader.readAsDataURL(file);
        };
        input.click();
      } else {
        await frequenciaService.registrarPresencaAutomatica({
          perfilId,
          usuarioEmail: userEmail,
        });
        setMensagemSucesso('Frequência registrada com sucesso!');
        await carregarFrequencias();
        await carregarDados(); // Recarregar para atualizar os planos
      }
    } catch (error: any) {
      console.error('Erro ao registrar frequência:', error);
      const mensagemErro = error.response?.data?.mensagem || error.message || 'Erro ao registrar frequência. Tente novamente.';
      setErro(mensagemErro);
      setTimeout(() => setErro(null), 5000);
    } finally {
      setRegistrandoFrequencia(false);
    }
  };

  const handleDeletarExercicio = async (planoId: number | null, treinoId: number | null) => {
    if (!planoId) {
      setErro('ID do plano não encontrado.');
      return;
    }
    
    if (!treinoId) {
      setErro('ID do treino não encontrado.');
      return;
    }

    if (!confirm('Tem certeza que deseja remover este exercício?')) {
      return;
    }

    setCarregando(true);
    setErro(null);
    try {
      await planoTreinoService.removerTreino(planoId, treinoId);
      await carregarDados();
      setMensagemSucesso('Exercício removido com sucesso!');
      setTimeout(() => setMensagemSucesso(null), 3000);
    } catch (error: any) {
      console.error('Erro ao deletar exercício:', error);
      let errorMessage = 'Erro ao deletar exercício.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      setErro(errorMessage);
      setTimeout(() => setErro(null), 5000);
    } finally {
      setCarregando(false);
    }
  };


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
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
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

              <nav className="space-y-2">
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
            </SheetContent>
          </Sheet>

          {/* Navegação Principal */}
          <Tabs value={abaPrincipal} onValueChange={setAbaPrincipal} className="flex-1">
            <TabsList className="bg-transparent h-auto p-0">
              <TabsTrigger
                value="treino"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-4 py-2"
              >
                Treino
              </TabsTrigger>
              <TabsTrigger
                value="progresso"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-4 py-2"
              >
                Progresso
              </TabsTrigger>
              <TabsTrigger
                value="frequencia"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-4 py-2"
              >
                Frequência
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-6">
        {/* Mensagens de Sucesso e Erro */}
        {mensagemSucesso && (
          <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm flex items-center justify-between">
            <span>{mensagemSucesso}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setMensagemSucesso(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {erro && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between">
            <span>{erro}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setErro(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Tabs value={abaPrincipal} onValueChange={setAbaPrincipal}>
          <TabsContent value="treino" className="mt-6">
            {/* Seção de Planos de Treino */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Meus planos de treino</h2>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => setModalNovoPlanoAberto(true)}
                >
                  <Plus className="h-4 w-4" />
                  Novo Plano
                </Button>
              </div>

              {/* Tabs Ativo/Histórico */}
              <Tabs value={abaPlanos} onValueChange={setAbaPlanos} className="mb-4">
                <TabsList className="h-9">
                  <TabsTrigger value="ativo" className="text-sm">
                    Ativo
                  </TabsTrigger>
                  <TabsTrigger value="historico" className="text-sm">
                    Histórico
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ativo" className="mt-4">
                  {carregando ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Carregando...</span>
                    </div>
                  ) : erro ? (
                    <div className="text-center py-8 text-destructive">
                      <p>{erro}</p>
                      <Button variant="outline" className="mt-4" onClick={carregarDados}>
                        Tentar novamente
                      </Button>
                    </div>
                  ) : planosAtivos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhum plano ativo encontrado</p>
                      <p className="text-sm mt-2">Crie um novo plano para começar!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {planosAtivos.map((plano) => (
                        <Card key={plano.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xl">{plano.nome}</CardTitle>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditar(plano.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDeletar(plano.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {plano.treinos.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  Nenhum exercício adicionado ainda
                                </p>
                              ) : (
                                plano.treinos.map((treino) => {
                                  const exercicio = exercicios.find(e => e.id === treino.exercicioId);
                                  return (
                                    <div
                                      key={treino.id}
                                      className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
                                    >
                                      <label className="flex-1 cursor-pointer">
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium">
                                            {exercicio?.nome || `Exercício ${treino.exercicioId}`}
                                          </span>
                                          <span className="text-sm text-muted-foreground">
                                            {treino.series}x{treino.repeticoes} {treino.peso > 0 ? `- ${treino.peso}kg` : ''}
                                          </span>
                                        </div>
                                      </label>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log('Deletar treino:', { planoId: plano.id, treinoId: treino.id });
                                          handleDeletarExercicio(plano.id, treino.id);
                                        }}
                                        disabled={carregando || !treino.id || !plano.id}
                                        title={!treino.id || !plano.id ? 'ID não disponível' : 'Remover exercício'}
                                      >
                                        {carregando ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="historico" className="mt-4">
                  {carregando ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : planosHistoricos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhum plano histórico encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {planosHistoricos.map((plano) => (
                        <Card key={plano.id}>
                          <CardHeader>
                            <CardTitle className="text-xl">{plano.nome}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {plano.treinos.map((treino) => {
                                const exercicio = exercicios.find(e => e.id === treino.exercicioId);
                                return (
                                  <div key={treino.id} className="p-2">
                                    <span className="font-medium">
                                      {exercicio?.nome || `Exercício ${treino.exercicioId}`}
                                    </span>
                                    <span className="text-sm text-muted-foreground ml-2">
                                      {treino.series}x{treino.repeticoes} {treino.peso > 0 ? `- ${treino.peso}kg` : ''}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="progresso" className="mt-6">
            <div className="space-y-6">
              {/* Header Evolução */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Evolução</h2>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Registrar
                </Button>
              </div>

              {/* Gráfico de Progresso */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Peito - supino reto</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={periodoGrafico === '5dias' ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setPeriodoGrafico('5dias')}
                      >
                        5 dias
                      </Button>
                      <Button
                        variant={periodoGrafico === 'mensal' ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setPeriodoGrafico('mensal')}
                      >
                        Mensal
                      </Button>
                      <Button
                        variant={periodoGrafico === 'anual' ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setPeriodoGrafico('anual')}
                      >
                        Anual
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Gráfico de Linha Simples */}
                  <div className="relative h-64 w-full">
                    {/* Eixos e Grid */}
                    <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                      {/* Grid horizontal */}
                      {[0, 20, 40, 60, 80].map((value, index) => {
                        const y = 200 - (value / 80) * 200;
                        return (
                          <g key={`grid-${value}`}>
                            <line
                              x1="40"
                              y1={y}
                              x2="400"
                              y2={y}
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                              className="text-muted-foreground opacity-30"
                            />
                            <text
                              x="35"
                              y={y + 4}
                              textAnchor="end"
                              className="text-xs fill-muted-foreground"
                            >
                              {value}
                            </text>
                          </g>
                        );
                      })}

                      {/* Dados do gráfico (5 dias) */}
                      {periodoGrafico === '5dias' && (() => {
                        // Valores: 68, 68, 72, 78, 78 (convertendo para coordenadas Y)
                        // Y máximo = 80, altura do gráfico = 200
                        const valores = [68, 68, 72, 78, 78];
                        const datas = ['30/08', '02/09', '04/09', '06/09', '08/09'];
                        const pontos = valores.map((valor, index) => {
                          const x = 60 + (index * 90);
                          const y = 200 - (valor / 80) * 200;
                          return { x, y, valor, date: datas[index] };
                        });
                        const pontosString = pontos.map(p => `${p.x},${p.y}`).join(' ');

                        return (
                          <>
                            {/* Linha do gráfico */}
                            <polyline
                              points={pontosString}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-primary"
                            />
                            {/* Pontos do gráfico */}
                            {pontos.map((point, index) => (
                              <g key={`point-${index}`}>
                                <circle
                                  cx={point.x}
                                  cy={point.y}
                                  r="4"
                                  fill="currentColor"
                                  className="text-primary"
                                />
                                <text
                                  x={point.x}
                                  y={195}
                                  textAnchor="middle"
                                  className="text-xs fill-muted-foreground"
                                >
                                  {point.date}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}

                      {/* Placeholder para outros períodos */}
                      {periodoGrafico !== '5dias' && (
                        <text
                          x="200"
                          y="100"
                          textAnchor="middle"
                          className="text-sm fill-muted-foreground"
                        >
                          Dados para {periodoGrafico === 'mensal' ? 'período mensal' : 'período anual'} em breve
                        </text>
                      )}
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="frequencia" className="mt-6">
            <div className="space-y-6">
              {/* Seleção de Plano de Treino */}
              {planosAtivos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Planos de Treino</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {planosAtivos.map((plano) => (
                        <div key={plano.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant={planoTreinoSelecionado?.id === plano.id ? 'default' : 'outline'}
                              className="flex-1 justify-start"
                              onClick={() => {
                                setPlanoTreinoSelecionado(plano);
                              }}
                            >
                              <div className="flex flex-col items-start w-full">
                                <span>{plano.nome}</span>
                                {plano.dias.length > 0 ? (
                                  <span className="text-xs font-normal opacity-90 mt-0.5">
                                    {plano.dias.map((dia, idx) => {
                                      const nomesCompletos: Record<Dias, string> = {
                                        Segunda: 'Segunda',
                                        Terca: 'Terça',
                                        Quarta: 'Quarta',
                                        Quinta: 'Quinta',
                                        Sexta: 'Sexta',
                                        Sabado: 'Sábado',
                                        Domingo: 'Domingo'
                                      };
                                      return (
                                        <span key={idx}>
                                          {nomesCompletos[dia]}
                                          {idx < plano.dias.length - 1 ? ', ' : ''}
                                        </span>
                                      );
                                    })}
                                  </span>
                                ) : (
                                  <span className="text-xs font-normal opacity-70 mt-0.5">
                                    Nenhum dia configurado
                                  </span>
                                )}
                              </div>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditandoDias(editandoDias === plano.id ? null : plano.id || 0);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                          {editandoDias === plano.id && (
                            <div className="p-4 border rounded-lg bg-muted/50">
                              <p className="text-sm font-medium mb-3">Selecione os dias da semana:</p>
                              <div className="grid grid-cols-7 gap-2">
                                {(['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'] as Dias[]).map((dia) => {
                                  const isSelected = plano.dias.includes(dia);
                                  return (
                                    <button
                                      key={dia}
                                      type="button"
                                      onClick={() => {
                                        const novosDias = isSelected
                                          ? plano.dias.filter(d => d !== dia)
                                          : [...plano.dias, dia];
                                        handleAtualizarDiasPlano(plano.id!, novosDias);
                                      }}
                                      className={`p-2 rounded-md text-sm font-medium transition-colors ${
                                        isSelected
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-background border hover:bg-accent'
                                      }`}
                                    >
                                      {dia.substring(0, 3)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!planoTreinoSelecionado && planosAtivos.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      Crie um plano de treino primeiro para registrar frequências.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Card Dias Consecutivos */}
              {planosAtivos.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Dias Consecutivos</p>
                      <p className="text-2xl font-bold">{sequenciaDias} {sequenciaDias === 1 ? 'dia' : 'dias'} consecutivos</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Considerando todos os planos de treino
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cards Esta Semana e Meta Semanal */}
              {planosAtivos.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Esta Semana</p>
                        <p className="text-2xl font-bold">{frequenciaSemanal}/{metaSemanal} treinos</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Meta Semanal</p>
                        <p className="text-2xl font-bold">{metaSemanal} treinos</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Soma de todos os planos ativos
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Card Check-in Diário */}
              {planosAtivos.length > 0 && mostrarCheckin && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Fazer check-in diário</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setMostrarCheckin(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button 
                          className="w-full" 
                          variant="default"
                          onClick={() => handleRegistrarFrequencia(false)}
                          disabled={registrandoFrequencia}
                        >
                          {registrandoFrequencia ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Registrando...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Registrar presença
                            </>
                          )}
                        </Button>
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => handleRegistrarFrequencia(true)}
                          disabled={registrandoFrequencia}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Registrar com foto
                        </Button>
                      </CardContent>
                    </Card>
                  )}

              {/* Grid de Dias da Semana */}
              {planosAtivos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dias da Semana</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {(() => {
                        const hoje = new Date();
                        const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
                        // Buscar todas as frequências de todos os planos ativos
                        const todasFrequencias = frequencias.filter(f => 
                          planosAtivos.some(p => p.id === f.planoTreinoId)
                        );
                        const diasCompletos = todasFrequencias.map(f => {
                          const data = new Date(f.dataDePresenca);
                          return data.toDateString();
                        });

                        // Gerar os últimos 7 dias
                        const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
                          const data = new Date(hoje);
                          data.setDate(data.getDate() - (6 - i));
                          return {
                            dia: diasSemana[data.getDay()],
                            data: data.getDate(),
                            completo: diasCompletos.includes(data.toDateString()),
                            dataObj: data,
                          };
                        });

                        return ultimos7Dias.map((item, index) => (
                          <div
                            key={index}
                            className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center ${
                              item.completo
                                ? 'bg-green-500 border-green-700 text-white'
                                : 'bg-gray-200 border-gray-400 text-gray-600'
                            }`}
                          >
                            <span className="text-xs font-medium">{item.dia}</span>
                            <span className="text-sm font-bold">{item.data}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mensagem Motivacional */}
              {planosAtivos.length > 0 && sequenciaDias > 0 && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <p className="text-center text-sm">
                      {sequenciaDias >= 7 
                        ? 'Incrível! Você está mantendo uma sequência excelente! Continue assim!'
                        : sequenciaDias >= 3
                        ? 'Ótimo trabalho! Continue mantendo essa sequência!'
                        : 'Bom começo! Continue registrando seus treinos!'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Criar Novo Plano */}
      <Dialog open={modalNovoPlanoAberto} onOpenChange={handleFecharModalNovoPlano}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar plano de treino</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="nome-plano">Nome:</Label>
              <Input
                id="nome-plano"
                placeholder="Nome do plano de treino"
                value={nomeNovoPlano}
                onChange={(e) => setNomeNovoPlano(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCriarNovoPlano();
                  }
                }}
              />
            </div>

            <Button onClick={handleCriarNovoPlano} className="w-full">
              Criar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Plano de Treino */}
      <Dialog open={modalEditarAberto} onOpenChange={handleFecharModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar plano de treino</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {mensagemSucesso && (
              <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm flex items-center justify-between">
                <span>{mensagemSucesso}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setMensagemSucesso(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {erro && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between">
                <span>{erro}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setErro(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="exercicio">Exercício:</Label>
              <select
                id="exercicio"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={novoExercicio.exercicioId}
                onChange={(e) =>
                  setNovoExercicio({ ...novoExercicio, exercicioId: e.target.value })
                }
              >
                <option value="">Selecione um exercício</option>
                {exercicios.map((exercicio) => (
                  <option key={exercicio.id} value={exercicio.id}>
                    {exercicio.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo:</Label>
              <select
                id="tipo"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={novoExercicio.tipo}
                onChange={(e) =>
                  setNovoExercicio({ ...novoExercicio, tipo: e.target.value as TipoTreino })
                }
              >
                <option value="Peso">Peso</option>
                <option value="Cardio">Cardio</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg):</Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                placeholder="Peso em kg"
                value={novoExercicio.peso}
                onChange={(e) =>
                  setNovoExercicio({ ...novoExercicio, peso: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repeticoes">Repetições:</Label>
              <Input
                id="repeticoes"
                type="number"
                placeholder="Número de repetições"
                value={novoExercicio.repeticoes}
                onChange={(e) =>
                  setNovoExercicio({ ...novoExercicio, repeticoes: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="series">Séries:</Label>
              <Input
                id="series"
                type="number"
                placeholder="Número de séries"
                value={novoExercicio.series}
                onChange={(e) =>
                  setNovoExercicio({ ...novoExercicio, series: e.target.value })
                }
              />
            </div>

            {novoExercicio.tipo === 'Cardio' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="distancia">Distância (km):</Label>
                  <Input
                    id="distancia"
                    type="number"
                    step="0.1"
                    placeholder="Distância em km"
                    value={novoExercicio.distancia}
                    onChange={(e) =>
                      setNovoExercicio({ ...novoExercicio, distancia: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempo">Tempo:</Label>
                  <Input
                    id="tempo"
                    type="datetime-local"
                    value={novoExercicio.tempo}
                    onChange={(e) =>
                      setNovoExercicio({ ...novoExercicio, tempo: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            <Button 
              onClick={handleAdicionarExercicio} 
              className="w-full"
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  add +
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

