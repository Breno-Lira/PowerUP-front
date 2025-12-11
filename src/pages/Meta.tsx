import { useState, useEffect } from 'react';
import { Menu, Plus, Pencil, Trash2, Target, Calendar, User, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserInfoHeader } from '@/components/UserInfoHeader';
import { metaService, MetaResumo, CriarMetaRequest, perfilService, PerfilResumo, exercicioService, ExercicioResumo, planoTreinoService, PlanoTreinoResumo, TreinoResumo } from '@/services/api';
import { Badge } from '@/components/ui/badge';

export function Meta() {
  const navigate = useNavigate();
  const [metas, setMetas] = useState<MetaResumo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [metaEditando, setMetaEditando] = useState<MetaResumo | null>(null);
  const [perfilUsuario, setPerfilUsuario] = useState<PerfilResumo | null>(null);
  const [exercicios, setExercicios] = useState<ExercicioResumo[]>([]);
  const [treinos, setTreinos] = useState<Array<{ id: number; nome: string; exercicioNome: string }>>([]);

  const [formMeta, setFormMeta] = useState<CriarMetaRequest>({
    nome: '',
    exercicioId: null,
    treinoId: null,
    dataInicio: '',
    dataFim: '',
    exigenciaMinima: null,
  });

  // Obter dados do usuário logado
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = userData?.email;

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
    carregarDados();
    carregarExerciciosETreinos();
  }, []);

  const carregarExerciciosETreinos = async () => {
    if (!userEmail) return;
    
    try {
      // Carregar exercícios primeiro
      const exerciciosList = await exercicioService.listarTodos();
      setExercicios(exerciciosList);

      // Carregar planos de treino do usuário
      const planos = await planoTreinoService.listarPorUsuario(userEmail);
      
      // Extrair todos os treinos de todos os planos
      // Usar exerciciosList que acabou de ser carregado
      const todosTreinos: Array<{ id: number; nome: string; exercicioNome: string }> = [];
      planos.forEach(plano => {
        plano.treinos.forEach(treino => {
          if (treino.id !== null) {
            const exercicio = exerciciosList.find(e => e.id === treino.exercicioId);
            const nomeExercicio = exercicio ? exercicio.nome : `Exercício ${treino.exercicioId}`;
            todosTreinos.push({
              id: treino.id,
              nome: `${nomeExercicio} - ${plano.nome}`,
              exercicioNome: nomeExercicio,
            });
          }
        });
      });
      
      setTreinos(todosTreinos);
    } catch (error) {
      console.error('Erro ao carregar exercícios e treinos:', error);
    }
  };

  const carregarDados = async () => {
    if (!userData.perfilId || !userEmail) {
      setErro('Usuário não identificado. Faça login novamente.');
      return;
    }

    setCarregando(true);
    setErro(null);
    try {
      const [metasData, perfil] = await Promise.all([
        metaService.obterPorUsuario(userData.perfilId),
        perfilService.obterPorId(userData.perfilId),
      ]);
      setMetas(metasData);
      setPerfilUsuario(perfil);
    } catch (error: any) {
      console.error('Erro ao carregar metas:', error);
      setErro('Erro ao carregar metas. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const abrirModalNovo = async () => {
    setEditando(false);
    setMetaEditando(null);
    setFormMeta({
      nome: '',
      exercicioId: null,
      treinoId: null,
      dataInicio: '',
      dataFim: '',
      exigenciaMinima: null,
    });
    // Recarregar exercícios e treinos ao abrir o modal
    await carregarExerciciosETreinos();
    setModalAberto(true);
  };

  const abrirModalEditar = async (meta: MetaResumo) => {
    setEditando(true);
    setMetaEditando(meta);
    // Extrair apenas a data (yyyy-MM-dd) da string ISO
    const dataInicio = meta.dataInicio ? meta.dataInicio.split('T')[0] : '';
    const dataFim = meta.dataFim ? meta.dataFim.split('T')[0] : '';
    setFormMeta({
      nome: meta.nome,
      exercicioId: meta.exercicioId,
      treinoId: meta.treinoId,
      dataInicio,
      dataFim,
      exigenciaMinima: meta.exigenciaMinima,
    });
    // Recarregar exercícios e treinos ao abrir o modal
    await carregarExerciciosETreinos();
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditando(false);
    setMetaEditando(null);
  };

  const salvarMeta = async () => {
    if (!formMeta.nome || !formMeta.dataInicio || !formMeta.dataFim) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (new Date(formMeta.dataFim) < new Date(formMeta.dataInicio)) {
      alert('A data de fim deve ser posterior à data de início.');
      return;
    }

    setCarregando(true);
    try {
      if (editando && metaEditando) {
        await metaService.atualizar(metaEditando.id, formMeta);
      } else {
        await metaService.criar(formMeta);
      }
      await carregarDados();
      fecharModal();
    } catch (error: any) {
      console.error('Erro ao salvar meta:', error);
      alert('Erro ao salvar meta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const deletarMeta = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta meta?')) {
      return;
    }

    setCarregando(true);
    try {
      await metaService.deletar(id);
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao deletar meta:', error);
      alert('Erro ao deletar meta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const obterStatusMeta = (meta: MetaResumo) => {
    // Se a meta foi marcada como concluída pelo sistema
    if (meta.concluida) {
      return { texto: 'Concluída', cor: 'bg-green-600' };
    }

    const hoje = new Date();
    const dataFim = new Date(meta.dataFim);
    const dataInicio = new Date(meta.dataInicio);

    if (hoje < dataInicio) {
      return { texto: 'Agendada', cor: 'bg-blue-500' };
    } else if (hoje >= dataInicio && hoje <= dataFim) {
      return { texto: 'Em Andamento', cor: 'bg-yellow-500' };
    } else {
      return { texto: 'Expirada', cor: 'bg-gray-500' };
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Metas</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {metas.filter(m => m.concluida).length} de {metas.length} metas concluídas
              </p>
            </div>
          </div>
          <Button onClick={abrirModalNovo} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Meta
          </Button>
        </div>

        {erro && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
            {erro}
          </div>
        )}

        {/* Card de Estatísticas */}
        {metas.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Metas Concluídas</p>
                    <p className="text-2xl font-bold">
                      {metas.filter(m => m.concluida).length} <span className="text-lg font-normal text-muted-foreground">/ {metas.length}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                  <p className="text-2xl font-bold text-primary">
                    {metas.length > 0 ? Math.round((metas.filter(m => m.concluida).length / metas.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {carregando && !metas.length ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : metas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Nenhuma meta cadastrada ainda.</p>
              <Button onClick={abrirModalNovo} variant="outline">
                Criar Primeira Meta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metas.map((meta) => {
              const status = obterStatusMeta(meta);
              return (
                <Card key={meta.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{meta.nome}</CardTitle>
                      <Badge className={status.cor}>{status.texto}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatarData(meta.dataInicio)} - {formatarData(meta.dataFim)}
                        </span>
                      </div>
                      {meta.exercicioId && (() => {
                        const exercicio = exercicios.find(e => e.id === meta.exercicioId);
                        return (
                          <p className="text-sm text-muted-foreground">
                            Exercício: {exercicio ? exercicio.nome : `ID ${meta.exercicioId}`}
                          </p>
                        );
                      })()}
                      {meta.treinoId && (() => {
                        const treino = treinos.find(t => t.id === meta.treinoId);
                        return (
                          <p className="text-sm text-muted-foreground">
                            Treino: {treino ? treino.nome : `ID ${meta.treinoId}`}
                          </p>
                        );
                      })()}
                      {meta.exigenciaMinima && (
                        <p className="text-sm text-muted-foreground">
                          Exigência Mínima: {meta.exigenciaMinima} kg
                        </p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirModalEditar(meta)}
                          className="flex-1"
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletarMeta(meta.id)}
                          className="flex-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Meta */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome da Meta *</Label>
              <Input
                id="nome"
                value={formMeta.nome}
                onChange={(e) => setFormMeta({ ...formMeta, nome: e.target.value })}
                placeholder="Ex: Perder 5kg em 3 meses"
              />
            </div>
            <div>
              <Label htmlFor="dataInicio">Data de Início *</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formMeta.dataInicio}
                onChange={(e) => setFormMeta({ ...formMeta, dataInicio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dataFim">Data de Fim *</Label>
              <Input
                id="dataFim"
                type="date"
                value={formMeta.dataFim}
                onChange={(e) => setFormMeta({ ...formMeta, dataFim: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="exercicioId">Exercício (Opcional)</Label>
              <select
                id="exercicioId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formMeta.exercicioId || ''}
                onChange={(e) =>
                  setFormMeta({
                    ...formMeta,
                    exercicioId: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              >
                <option value="">Nenhum exercício</option>
                {exercicios.map((exercicio) => (
                  <option key={exercicio.id} value={exercicio.id}>
                    {exercicio.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="treinoId">Treino (Opcional)</Label>
              <select
                id="treinoId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formMeta.treinoId || ''}
                onChange={(e) =>
                  setFormMeta({
                    ...formMeta,
                    treinoId: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              >
                <option value="">Nenhum treino</option>
                {treinos.map((treino) => (
                  <option key={treino.id} value={treino.id}>
                    {treino.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="exigenciaMinima">Exigência Mínima (kg) - Opcional</Label>
              <Input
                id="exigenciaMinima"
                type="number"
                step="0.01"
                value={formMeta.exigenciaMinima || ''}
                onChange={(e) =>
                  setFormMeta({
                    ...formMeta,
                    exigenciaMinima: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="Ex: 35.0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Peso mínimo (em kg) que o usuário precisa atingir no exercício para concluir a meta
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={fecharModal}
                className="flex-1"
                disabled={carregando}
              >
                Cancelar
              </Button>
              <Button onClick={salvarMeta} className="flex-1" disabled={carregando}>
                {carregando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

