import { useState, useEffect } from 'react';
import { Menu, Plus, Pencil, Trash2, Play, Check, Camera, X, Loader2, User, LogOut } from 'lucide-react';
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
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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
  PerfilResumo,
  treinoProgressoService,
  TreinoProgressoRegistro,
  RegistrarTreinoProgressoRequest
} from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserInfoHeader } from '@/components/UserInfoHeader';

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
  const [modalProgressoAberto, setModalProgressoAberto] = useState(false);
  const [registroProgresso, setRegistroProgresso] = useState({
    exercicioId: '',
    dataRegistro: '',
    pesoKg: '',
    repeticoes: '',
    series: '',
  });
  const [salvandoProgresso, setSalvandoProgresso] = useState(false);
  const [progresso, setProgresso] = useState<Record<number, TreinoProgressoRegistro[]>>({});

  const [metaSemanal, setMetaSemanal] = useState(5);
  const [mostrarCheckin, setMostrarCheckin] = useState(true);
  const [planosAtivos, setPlanosAtivos] = useState<PlanoTreinoResumo[]>([]);
  const [planosHistoricos, setPlanosHistoricos] = useState<PlanoTreinoResumo[]>([]);
  const [todosPlanos, setTodosPlanos] = useState<PlanoTreinoResumo[]>([]); // Para buscar nomes de planos deletados
  const [exercicios, setExercicios] = useState<ExercicioResumo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  
  
  const [perfilId, setPerfilId] = useState<number | null>(null);
  const [planoTreinoSelecionado, setPlanoTreinoSelecionado] = useState<PlanoTreinoResumo | null>(null);
  const [sequenciaDias, setSequenciaDias] = useState(0);
  const [frequenciaSemanal, setFrequenciaSemanal] = useState(0);
  const [frequencias, setFrequencias] = useState<FrequenciaResumo[]>([]);
  const [registrandoFrequencia, setRegistrandoFrequencia] = useState(false);
  const [editandoDias, setEditandoDias] = useState<number | null>(null);

  
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
      setTodosPlanos(planos); 
      setExercicios(exerciciosList);
      
      if (perfil) {
        setPerfilId(perfil.id);
        
        const primeiroPlanoAtivo = planos.find(p => p.estado === 'Ativo');
        if (primeiroPlanoAtivo) {
          setPlanoTreinoSelecionado(primeiroPlanoAtivo);
        } else {
          
          setPlanoTreinoSelecionado(null);
        }
        
        const totalDias = planos
          .filter(p => p.estado === 'Ativo')
          .reduce((sum, p) => sum + p.dias.length, 0);
        setMetaSemanal(totalDias);
      } else if (userData?.perfilId) {
        
        setPerfilId(userData.perfilId);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const carregarFrequencias = async () => {
    if (!perfilId) {
      console.log('carregarFrequencias: perfilId não disponível. userData.perfilId:', userData?.perfilId);
      return;
    }
    
    try {
      const frequenciasList = await frequenciaService.listarPorPerfil(perfilId);
      
      
      const sequenciaTotal = await frequenciaService.calcularSequenciaDiasTotal(perfilId);
      
      
      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay() + 1); 
      inicioSemana.setHours(0, 0, 0, 0);
      
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6); 
      fimSemana.setHours(23, 59, 59, 999);
      
      
      const frequenciasSemanaAtual = frequenciasList
        .filter(f => {
          const dataFrequencia = new Date(f.dataDePresenca);
          return dataFrequencia >= inicioSemana && dataFrequencia <= fimSemana;
        })
        .map(f => {
          const dataFrequencia = new Date(f.dataDePresenca);
          return dataFrequencia.toDateString(); 
        });
      
      
      const diasUnicos = new Set(frequenciasSemanaAtual);
      const frequenciaTotal = diasUnicos.size;
      
      
      setFrequencias(frequenciasList);
      setSequenciaDias(sequenciaTotal);
      setFrequenciaSemanal(frequenciaTotal);
    } catch (error: any) {
      console.error('Erro ao carregar frequências:', error);
    }
  };

  const carregarProgresso = async () => {
    if (!perfilId) return;
    try {
      const registros = await treinoProgressoService.listar(perfilId);
      const agrupado: Record<number, TreinoProgressoRegistro[]> = {};
      registros.forEach((r) => {
        if (!agrupado[r.exercicioId]) agrupado[r.exercicioId] = [];
        agrupado[r.exercicioId].push(r);
      });
      setProgresso(agrupado);
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const registrarProgresso = async () => {
    if (!perfilId) {
      setErro('Perfil não identificado.');
      return;
    }
    if (!registroProgresso.exercicioId || !registroProgresso.dataRegistro) {
      setErro('Selecione um exercício e uma data.');
      return;
    }
    setSalvandoProgresso(true);
    setErro(null);
    try {
      const payload = {
        perfilId,
        exercicioId: Number(registroProgresso.exercicioId),
        dataRegistro: registroProgresso.dataRegistro,
        pesoKg: registroProgresso.pesoKg ? Number(registroProgresso.pesoKg) : null,
        repeticoes: registroProgresso.repeticoes ? Number(registroProgresso.repeticoes) : null,
        series: registroProgresso.series ? Number(registroProgresso.series) : null,
      } as RegistrarTreinoProgressoRequest;
      await treinoProgressoService.registrar(payload);
      setMensagemSucesso('Progresso registrado!');
      setModalProgressoAberto(false);
      setRegistroProgresso({ exercicioId: '', dataRegistro: '', pesoKg: '', repeticoes: '', series: '' });
      await carregarProgresso();
    } catch (error) {
      console.error('Erro ao registrar progresso:', error);
      setErro('Não foi possível registrar o progresso.');
    } finally {
      setSalvandoProgresso(false);
    }
  };

  
  useEffect(() => {
    if (userData?.perfilId) {
      perfilService.obterPorId(userData.perfilId)
        .then(setPerfilUsuario)
        .catch(console.error);
    }
  }, [userData?.perfilId]);

  
  useEffect(() => {
    if (userEmail) {
      carregarDados();
    }
    
  }, [userEmail]);

  
  useEffect(() => {
    if (!perfilId && userData?.perfilId) {
      setPerfilId(userData.perfilId);
    }
  }, [perfilId, userData?.perfilId]);

  
  useEffect(() => {
    if (perfilId) {
      carregarFrequencias();
    }
    
  }, [perfilId]);
  
  
  useEffect(() => {
    if (perfilId) {
      carregarFrequencias();
    }
    
  }, [planosAtivos]);

  
  useEffect(() => {
    const totalDias = planosAtivos.reduce((sum, p) => sum + p.dias.length, 0);
    setMetaSemanal(totalDias);
  }, [planosAtivos]);

  useEffect(() => {
    if (perfilId) {
      carregarProgresso();
    }
    
  }, [perfilId]);

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


  const formatarTempo = (tempoStr: string | null): string => {
    if (!tempoStr) return '—';
    
    try {
      if (tempoStr.includes('T')) {
        
        const partes = tempoStr.split('T')[1]?.split('.')[0] || tempoStr;
        return partes.substring(0, 8); 
      }
      
      return tempoStr.substring(0, 8);
    } catch {
      return tempoStr;
    }
  };

  const handleEditar = (planoId: number | null) => {
    const plano = [...planosAtivos, ...planosHistoricos].find((p) => p.id === planoId);
    if (plano) {
      setPlanoEditando(plano);
      setModalEditarAberto(true);
    }
  };

  const handleAdicionarExercicio = async () => {
    if (!planoEditando || !novoExercicio.exercicioId) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    
    if (novoExercicio.tipo === 'Peso') {
      if (!novoExercicio.repeticoes) {
        setErro('Preencha todos os campos obrigatórios.');
        return;
      }
    } else if (novoExercicio.tipo === 'Cardio') {
      
    }

    const repeticoes = novoExercicio.tipo === 'Peso' ? parseInt(novoExercicio.repeticoes) : null;
    const series = novoExercicio.tipo === 'Peso' ? (parseInt(novoExercicio.series) || 3) : null;
    const peso = novoExercicio.tipo === 'Peso' ? (parseFloat(novoExercicio.peso) || 0) : null;
    const distancia = novoExercicio.distancia ? parseFloat(novoExercicio.distancia) : null;
    
    
    let tempo = null;
    if (novoExercicio.tempo) {
      const partes = novoExercicio.tempo.split(':');
      const horas = parseInt(partes[0]) || 0;
      const minutos = parseInt(partes[1]) || 0;
      const segundos = parseInt(partes[2]) || 0;
      
      
      const horasStr = String(horas).padStart(2, '0');
      const minutosStr = String(minutos).padStart(2, '0');
      const segundosStr = String(segundos).padStart(2, '0');
      tempo = `1970-01-01T${horasStr}:${minutosStr}:${segundosStr}`;
    }

    if (novoExercicio.tipo === 'Peso' && (isNaN(repeticoes!) || isNaN(series!))) {
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

      
      await carregarDados();
      
      
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

      
      await carregarDados();
      
      
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
      
      if (perfilId) {
        await carregarFrequencias();
      }
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
            const base64Data = base64.split(',')[1]; 

            try {
              await frequenciaService.registrarPresencaComFotoAutomatica({
                perfilId,
                usuarioEmail: userEmail,
                fotoBase64: base64Data,
              });
              setMensagemSucesso('Frequência registrada com foto com sucesso!');
              await carregarFrequencias();
              await carregarDados(); 
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
        await carregarDados(); 
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
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Tabs value={abaPrincipal} onValueChange={setAbaPrincipal} className="flex-1">
            <TabsList className="bg-background shadow-sm rounded-md">
              <TabsTrigger
                value="treino"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2 rounded-md"
              >
                Treino
              </TabsTrigger>
              <TabsTrigger
                value="progresso"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2 rounded-md"
              >
                Progresso
              </TabsTrigger>
              <TabsTrigger
                value="frequencia"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2 rounded-md"
              >
                Frequência
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
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
                                            {treino.tipo === 'Cardio' ? (
                                              formatarTempo(treino.tempo)
                                            ) : (
                                              `${treino.series}x${treino.repeticoes} ${treino.peso > 0 ? `- ${treino.peso}kg` : ''}`
                                            )}
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
                                      {treino.tipo === 'Cardio' ? (
                                        formatarTempo(treino.tempo)
                                      ) : (
                                        `${treino.series}x${treino.repeticoes} ${treino.peso > 0 ? `- ${treino.peso}kg` : ''}`
                                      )}
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
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Evolução</h2>
                <Button size="sm" className="gap-2" onClick={() => setModalProgressoAberto(true)}>
                  <Plus className="h-4 w-4" />
                  Registrar
                </Button>
              </div>

              {Object.keys(progresso).length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sem registros ainda</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Adicione um exercício ao tracker para acompanhar peso, repetições e séries ao longo do tempo.
                    </p>
                    <Button onClick={() => setModalProgressoAberto(true)} size="sm" className="w-fit">
                      Registrar primeiro progresso
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                Object.entries(progresso).map(([exercicioIdStr, registros]) => {
                  const exercicioId = Number(exercicioIdStr);
                  const exercicio = exercicios.find((e) => e.id === exercicioId);
                  const dataChart = [...registros]
                    .sort((a, b) => new Date(a.dataRegistro).getTime() - new Date(b.dataRegistro).getTime())
                    .map((r) => ({
                      ...r,
                      pesoKg: r.pesoKg ?? 0,
                      repeticoes: r.repeticoes ?? 0,
                      series: r.series ?? 0,
                    }));

                  return (
                    <Card key={exercicioId}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          {exercicio?.nome || `Exercício ${exercicioId}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dataChart}>
                            <defs>
                              <linearGradient id={`pesoGrad-${exercicioId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                              </linearGradient>
                              <linearGradient id={`repGrad-${exercicioId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                              </linearGradient>
                              <linearGradient id={`seriesGrad-${exercicioId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="text-muted-foreground" />
                            <XAxis dataKey="dataRegistro" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="pesoKg"
                              name="Peso (kg)"
                              stroke="hsl(var(--primary))"
                              fill={`url(#pesoGrad-${exercicioId})`}
                              strokeWidth={2}
                              dot={false}
                              connectNulls
                            />
                            <Area
                              type="monotone"
                              dataKey="repeticoes"
                              name="Repetições"
                              stroke="#10b981"
                              fill={`url(#repGrad-${exercicioId})`}
                              strokeWidth={2}
                              dot={false}
                              connectNulls
                            />
                            <Area
                              type="monotone"
                              dataKey="series"
                              name="Séries"
                              stroke="#f59e0b"
                              fill={`url(#seriesGrad-${exercicioId})`}
                              strokeWidth={2}
                              dot={false}
                              connectNulls
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  );
                })
              )}
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

              {!planoTreinoSelecionado && planosAtivos.length === 0 && frequencias.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      Crie um plano de treino primeiro para registrar frequências.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Card Dias Consecutivos */}
              {(planosAtivos.length > 0 || frequencias.length > 0) && (
                <Card>
                  <CardContent className="pt-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Dias Consecutivos</p>
                      <p className="text-2xl font-bold">{sequenciaDias} {sequenciaDias === 1 ? 'dia' : 'dias'} consecutivos</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {planosAtivos.length > 0 
                          ? 'Considerando todos os planos de treino'
                          : 'Histórico de frequências'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cards Esta Semana e Meta Semanal */}
              {(planosAtivos.length > 0 || frequencias.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Esta Semana</p>
                        <p className="text-2xl font-bold">
                          {frequenciaSemanal}/{planosAtivos.length > 0 ? metaSemanal : frequenciaSemanal} treinos
                        </p>
                        {planosAtivos.length === 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Frequências registradas esta semana
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {planosAtivos.length > 0 && (
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
                  )}
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
              {(planosAtivos.length > 0 || frequencias.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dias da Semana</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {(() => {
                        const hoje = new Date();
                        const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
                        
                        
                        const normalizarData = (data: Date | string): string => {
                          let d: Date;
                          if (typeof data === 'string') {
                            
                            if (/^\d{4}-\d{2}-\d{2}/.test(data)) {
                              return data.substring(0, 10);
                            }
                            d = new Date(data);
                          } else {
                            d = data;
                          }
                          
                          const ano = d.getFullYear();
                          const mes = String(d.getMonth() + 1).padStart(2, '0');
                          const dia = String(d.getDate()).padStart(2, '0');
                          return `${ano}-${mes}-${dia}`;
                        };
                        
                        
                        const diasCompletos = frequencias.map(f => {
                          return normalizarData(f.dataDePresenca);
                        });

                       
                        const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
                          const data = new Date(hoje);
                          data.setDate(data.getDate() - (6 - i));
                          
                          data.setHours(0, 0, 0, 0);
                          const dataNormalizada = normalizarData(data);
                          const estaCompleto = diasCompletos.includes(dataNormalizada);
                          return {
                            dia: diasSemana[data.getDay()],
                            data: data.getDate(),
                            completo: estaCompleto,
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
              {sequenciaDias > 0 && (
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

              {/* Lista de Frequências */}
              {frequencias.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Histórico de Frequências</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {frequencias
                        .sort((a, b) => {
                          
                          return new Date(b.dataDePresenca).getTime() - new Date(a.dataDePresenca).getTime();
                        })
                        .map((frequencia) => {
                          
                          const plano = todosPlanos.find(p => p.id === frequencia.planoTreinoId);
                          const nomePlano = plano?.nome || (frequencia.planoTreinoId ? 'Plano deletado' : 'Sem plano');
                          
                          
                          const dataFormatada = new Date(frequencia.dataDePresenca).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });

                          return (
                            <div
                              key={frequencia.id}
                              className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                              {/* Foto */}
                              {frequencia.foto ? (
                                <div className="flex-shrink-0">
                                  <img
                                    src={`data:image/jpeg;base64,${frequencia.foto}`}
                                    alt={`Frequência ${dataFormatada}`}
                                    className="w-16 h-16 object-cover rounded-lg border"
                                  />
                                </div>
                              ) : (
                                <div className="flex-shrink-0 w-16 h-16 rounded-lg border bg-muted flex items-center justify-center">
                                  <span className="text-2xl">📅</span>
                                </div>
                              )}
                              
                              {/* Informações */}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{nomePlano}</p>
                                <p className="text-sm text-muted-foreground">{dataFormatada}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de registrar progresso */}
      <Dialog open={modalProgressoAberto} onOpenChange={setModalProgressoAberto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar progresso</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="exercicio-progresso">Exercício</Label>
              <select
                id="exercicio-progresso"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={registroProgresso.exercicioId}
                onChange={(e) => setRegistroProgresso({ ...registroProgresso, exercicioId: e.target.value })}
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
              <Label htmlFor="data-registro">Data</Label>
              <Input
                id="data-registro"
                type="date"
                value={registroProgresso.dataRegistro}
                onChange={(e) => setRegistroProgresso({ ...registroProgresso, dataRegistro: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="peso-kg">Peso (kg)</Label>
                <Input
                  id="peso-kg"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 80"
                  value={registroProgresso.pesoKg}
                  onChange={(e) => setRegistroProgresso({ ...registroProgresso, pesoKg: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repeticoes-prog">Repetições</Label>
                <Input
                  id="repeticoes-prog"
                  type="number"
                  placeholder="Ex: 10"
                  value={registroProgresso.repeticoes}
                  onChange={(e) => setRegistroProgresso({ ...registroProgresso, repeticoes: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="series-prog">Séries</Label>
                <Input
                  id="series-prog"
                  type="number"
                  placeholder="Ex: 4"
                  value={registroProgresso.series}
                  onChange={(e) => setRegistroProgresso({ ...registroProgresso, series: e.target.value })}
                />
              </div>
            </div>

            <Button className="w-full" onClick={registrarProgresso} disabled={salvandoProgresso}>
              {salvandoProgresso ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar registro'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

            {novoExercicio.tipo !== 'Cardio' && (
              <>
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
              </>
            )}

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
                  <Label htmlFor="tempo">Tempo (duração):</Label>
                  <Input
                    id="tempo"
                    type="time"
                    step="1"
                    value={novoExercicio.tempo}
                    onChange={(e) =>
                      setNovoExercicio({ ...novoExercicio, tempo: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Informe a duração do treino (ex: 00:30 para 30 minutos)
                  </p>
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
                  Adicionar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

