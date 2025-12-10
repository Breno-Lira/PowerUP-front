import { useState, useEffect } from 'react';
import { Menu, ArrowLeft, UserPlus, Check, Calendar, Users, Crown, Loader2, Edit, Save, X, UserMinus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { equipeService, EquipeResumo, usuarioService, UsuarioResumo, MembroRanking } from '@/services/api';

export function Equipe() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [equipe, setEquipe] = useState<EquipeResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [isLider, setIsLider] = useState(false);
  const [modalAdicionarMembro, setModalAdicionarMembro] = useState(false);
  const [amigos, setAmigos] = useState<UsuarioResumo[]>([]);
  const [carregandoAmigos, setCarregandoAmigos] = useState(false);
  const [adicionandoMembro, setAdicionandoMembro] = useState<string | null>(null);
  const [editandoEquipe, setEditandoEquipe] = useState(false);
  const [nomeEditado, setNomeEditado] = useState('');
  const [descricaoEditada, setDescricaoEditada] = useState('');
  const [dataInicioEditada, setDataInicioEditada] = useState('');
  const [dataFimEditada, setDataFimEditada] = useState('');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [expulsandoMembro, setExpulsandoMembro] = useState<string | null>(null);
  const [excluindoEquipe, setExcluindoEquipe] = useState(false);
  const [modalExcluirEquipe, setModalExcluirEquipe] = useState(false);
  const [ranking, setRanking] = useState<MembroRanking[]>([]);
  const [carregandoRanking, setCarregandoRanking] = useState(false);

  // Obter email do usuário logado
  const userEmail = JSON.parse(localStorage.getItem('user') || '{}')?.email;
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

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

  // Carregar dados da equipe
  useEffect(() => {
    const carregarEquipe = async () => {
      if (!id || !userEmail) return;

      setLoading(true);
      setErro(null);

      try {
        const equipeId = parseInt(id);
        const equipeData = await equipeService.obterPorId(equipeId);
        
        if (!equipeData) {
          setErro('Equipe não encontrada.');
          setLoading(false);
          return;
        }

        setEquipe(equipeData);
        setNomeEditado(equipeData.nome);
        setDescricaoEditada(equipeData.descricao || '');
        // Converter datas para formato YYYY-MM-DD para input type="date"
        setDataInicioEditada(equipeData.inicio ? equipeData.inicio.split('T')[0] : '');
        setDataFimEditada(equipeData.fim ? equipeData.fim.split('T')[0] : '');

        // Verificar se o usuário é líder
        const lider = await equipeService.isLider(equipeId, userEmail);
        setIsLider(lider);

        // Carregar ranking
        await carregarRanking(equipeId);
      } catch (error: any) {
        console.error('Erro ao carregar equipe:', error);
        setErro('Erro ao carregar dados da equipe. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    carregarEquipe();
  }, [id, userEmail]);

  // Carregar amigos quando o modal abrir
  useEffect(() => {
    const carregarAmigos = async () => {
      if (modalAdicionarMembro && userEmail) {
        setCarregandoAmigos(true);
        setErro(null);
        try {
          const amigosLista = await usuarioService.listarAmigos(userEmail);
          // Filtrar o próprio usuário e membros que já estão na equipe
          const membrosEmails = equipe?.usuariosEmails || [];
          const amigosFiltrados = amigosLista.filter(
            amigo => amigo.usuarioEmail !== userEmail && !membrosEmails.includes(amigo.usuarioEmail)
          );
          setAmigos(amigosFiltrados);
        } catch (error: any) {
          console.error('Erro ao carregar amigos:', error);
          setErro('Erro ao carregar lista de amigos.');
        } finally {
          setCarregandoAmigos(false);
        }
      }
    };

    carregarAmigos();
  }, [modalAdicionarMembro, userEmail, equipe]);

  const handleSalvarEdicao = async () => {
    if (!id || !nomeEditado.trim()) {
      setErro('O nome da equipe é obrigatório.');
      return;
    }

    setSalvandoEdicao(true);
    setErro(null);

    try {
      const equipeId = parseInt(id);

      // Atualizar informações básicas
      await equipeService.atualizarInformacoes(equipeId, {
        nome: nomeEditado.trim(),
        descricao: descricaoEditada.trim() || null,
        foto: equipe?.foto || null,
      });

      // Atualizar período se as datas foram alteradas
      if (dataInicioEditada || dataFimEditada) {
        await equipeService.definirPeriodo(equipeId, {
          inicio: dataInicioEditada || null,
          fim: dataFimEditada || null,
        });
      }

      // Recarregar dados da equipe
      const equipeData = await equipeService.obterPorId(equipeId);
      if (equipeData) {
        setEquipe(equipeData);
        setEditandoEquipe(false);
      }
    } catch (error: any) {
      console.error('Erro ao salvar edição:', error);
      const mensagemErro = error.response?.data || error.message || 'Erro ao salvar alterações. Tente novamente.';
      setErro(mensagemErro);
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const handleCancelarEdicao = () => {
    if (equipe) {
      setNomeEditado(equipe.nome);
      setDescricaoEditada(equipe.descricao || '');
      setDataInicioEditada(equipe.inicio || '');
      setDataFimEditada(equipe.fim || '');
    }
    setEditandoEquipe(false);
    setErro(null);
  };

  const handleAdicionarMembro = async (emailAmigo: string) => {
    if (!id) return;

    setAdicionandoMembro(emailAmigo);
    setErro(null);

    try {
      await equipeService.adicionarMembro(parseInt(id), emailAmigo);
      
      // Recarregar dados da equipe
      const equipeData = await equipeService.obterPorId(parseInt(id));
      if (equipeData) {
        setEquipe(equipeData);
      }

      // Remover o amigo da lista (já foi adicionado)
      setAmigos(amigos.filter(amigo => amigo.usuarioEmail !== emailAmigo));
    } catch (error: any) {
      console.error('Erro ao adicionar membro:', error);
      const mensagemErro = error.response?.data || error.message || 'Erro ao adicionar membro. Tente novamente.';
      setErro(mensagemErro);
    } finally {
      setAdicionandoMembro(null);
    }
  };

  const handleExpulsarMembro = async (emailMembro: string) => {
    if (!id || !userEmail) return;

    // Confirmar antes de expulsar
    if (!confirm(`Tem certeza que deseja expulsar ${emailMembro} da equipe?`)) {
      return;
    }

    setExpulsandoMembro(emailMembro);
    setErro(null);

    try {
      await equipeService.removerMembro(parseInt(id), emailMembro, userEmail);
      
      // Recarregar dados da equipe
      const equipeData = await equipeService.obterPorId(parseInt(id));
      if (equipeData) {
        setEquipe(equipeData);
      }
    } catch (error: any) {
      console.error('Erro ao expulsar membro:', error);
      const mensagemErro = error.response?.data?.mensagem || error.response?.data || error.message || 'Erro ao expulsar membro. Tente novamente.';
      setErro(mensagemErro);
    } finally {
      setExpulsandoMembro(null);
    }
  };

  const handleExcluirEquipe = async () => {
    if (!id || !userEmail) return;

    setExcluindoEquipe(true);
    setErro(null);

    try {
      await equipeService.excluirEquipe(parseInt(id), userEmail);
      // Redirecionar para a página Social após excluir
      navigate('/social');
    } catch (error: any) {
      console.error('Erro ao excluir equipe:', error);
      const mensagemErro = error.response?.data?.mensagem || error.response?.data || error.message || 'Erro ao excluir equipe. Tente novamente.';
      setErro(mensagemErro);
      setExcluindoEquipe(false);
      setModalExcluirEquipe(false);
    }
  };

  const carregarRanking = async (equipeId: number) => {
    setCarregandoRanking(true);
    try {
      const rankingData = await equipeService.obterRanking(equipeId);
      setRanking(rankingData);
    } catch (error: any) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setCarregandoRanking(false);
    }
  };

  const formatarData = (data: string | null) => {
    if (!data) return 'Não definido';
    try {
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando equipe...</p>
        </div>
      </div>
    );
  }

  if (erro && !equipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{erro}</p>
              <Button onClick={() => navigate('/social')}>Voltar para Social</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!equipe) {
    return null;
  }

  // Calcular posição do usuário no ranking
  const posicaoRanking = ranking.findIndex(m => m.email === userEmail) + 1 || ranking.length + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header com Menu */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 mr-2"
            onClick={() => navigate('/social')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
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
              
              <div className="mt-6 mb-6 pb-6 border-b">
                <div className="flex items-center gap-3 px-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {userData.username || userEmail || 'Usuário'}
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
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header da Equipe */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {editandoEquipe ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nomeEquipe">Nome da Equipe *</Label>
                        <Input
                          id="nomeEquipe"
                          value={nomeEditado}
                          onChange={(e) => setNomeEditado(e.target.value)}
                          className="mt-1"
                          placeholder="Nome da equipe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="descricaoEquipe">Descrição</Label>
                        <Input
                          id="descricaoEquipe"
                          value={descricaoEditada}
                          onChange={(e) => setDescricaoEditada(e.target.value)}
                          className="mt-1"
                          placeholder="Descrição da equipe"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="dataInicio">Data de Início</Label>
                          <Input
                            id="dataInicio"
                            type="date"
                            value={dataInicioEditada}
                            onChange={(e) => setDataInicioEditada(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dataFim">Data de Fim</Label>
                          <Input
                            id="dataFim"
                            type="date"
                            value={dataFimEditada}
                            onChange={(e) => setDataFimEditada(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSalvarEdicao}
                          disabled={salvandoEdicao || !nomeEditado.trim()}
                          className="gap-2"
                        >
                          {salvandoEdicao ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Salvar
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelarEdicao}
                          disabled={salvandoEdicao}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h1 className="text-3xl font-bold mb-2">{equipe.nome}</h1>
                          {equipe.descricao && (
                            <p className="text-muted-foreground">{equipe.descricao}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          #{posicaoRanking}
                        </Badge>
                      </div>
                      {/* Datas de Início e Fim */}
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Início:</span>
                          <span className="font-medium">{formatarData(equipe.inicio)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Fim:</span>
                          <span className="font-medium">{formatarData(equipe.fim)}</span>
                        </div>
                      </div>
                      {isLider && (
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditandoEquipe(true)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Editar Equipe
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              {erro && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm mt-4">
                  {erro}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seção de Participantes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participantes
                </CardTitle>
                {isLider && (
                  <Button
                    size="sm"
                    onClick={() => setModalAdicionarMembro(true)}
                    className="gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Adicionar Membro
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {equipe.usuariosEmails.map((email, index) => {
                  const isLeader = email === equipe.usuarioAdm;
                  const isYou = email === userEmail;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex flex-col items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {isLeader ? (
                              <Crown className="h-5 w-5 text-yellow-600" />
                            ) : (
                              <Users className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <span className="text-xs font-medium mt-1">
                            {isLeader ? 'leader' : isYou ? 'you' : ''}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {email.split('@')[0]}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {email}
                          </p>
                        </div>
                      </div>
                      {isLider && !isLeader && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExpulsarMembro(email)}
                          disabled={expulsandoMembro === email}
                          className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                        >
                          {expulsandoMembro === email ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Expulsando...
                            </>
                          ) : (
                            <>
                              <UserMinus className="h-4 w-4" />
                              Expulsar
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Total: {equipe.quantidadeMembros} {equipe.quantidadeMembros === 1 ? 'membro' : 'membros'}
              </p>
            </CardContent>
          </Card>

          {/* Botão de Excluir Equipe (apenas para líderes) */}
          {isLider && (
            <Card className="border-destructive/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-destructive">Zona de Perigo</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Excluir esta equipe permanentemente. Esta ação não pode ser desfeita.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setModalExcluirEquipe(true)}
                    disabled={excluindoEquipe}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir Equipe
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ranking da Equipe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Ranking de Dias Consecutivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {carregandoRanking ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : ranking.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum membro encontrado no ranking.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ranking.map((membro, index) => {
                    const isLeader = membro.email === equipe?.usuarioAdm;
                    const isYou = membro.email === userEmail;
                    const posicao = index + 1;
                    
                    // Cores para as medalhas
                    let medalhaCor = '';
                    let medalhaIcon = null;
                    if (posicao === 1) {
                      medalhaCor = 'text-yellow-600';
                      medalhaIcon = '🥇';
                    } else if (posicao === 2) {
                      medalhaCor = 'text-gray-400';
                      medalhaIcon = '🥈';
                    } else if (posicao === 3) {
                      medalhaCor = 'text-orange-600';
                      medalhaIcon = '🥉';
                    }
                    
                    return (
                      <div
                        key={membro.email}
                        className={`flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
                          isYou ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        <div className="flex-shrink-0 w-12 flex items-center justify-center">
                          {medalhaIcon ? (
                            <span className="text-2xl">{medalhaIcon}</span>
                          ) : (
                            <span className="text-lg font-bold text-muted-foreground">
                              #{posicao}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {membro.email.split('@')[0]}
                            </p>
                            {isLeader && (
                              <Crown className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                            )}
                            {isYou && (
                              <Badge variant="secondary" className="text-xs">
                                Você
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {membro.email}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-2xl font-bold text-primary">
                            {membro.diasConsecutivos}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {membro.diasConsecutivos === 1 ? 'dia' : 'dias'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Adicionar Membro */}
      <Dialog open={modalAdicionarMembro} onOpenChange={setModalAdicionarMembro}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {carregandoAmigos ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Carregando amigos...</span>
              </div>
            ) : amigos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum amigo disponível para adicionar.</p>
                <p className="text-sm mt-2">Todos os seus amigos já são membros da equipe ou você não tem amigos.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {amigos.map((amigo) => (
                  <div
                    key={amigo.usuarioEmail}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{amigo.nome}</p>
                        <p className="text-sm text-muted-foreground truncate">{amigo.usuarioEmail}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAdicionarMembro(amigo.usuarioEmail)}
                      disabled={adicionandoMembro === amigo.usuarioEmail}
                      className="ml-2 flex-shrink-0"
                    >
                      {adicionandoMembro === amigo.usuarioEmail ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adicionando...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Adicionar
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {erro && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
                {erro}
              </div>
            )}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setModalAdicionarMembro(false);
                  setErro(null);
                  setAmigos([]);
                }}
                disabled={carregandoAmigos}
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmar Exclusão de Equipe */}
      <Dialog open={modalExcluirEquipe} onOpenChange={setModalExcluirEquipe}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir Equipe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir a equipe <strong>{equipe?.nome}</strong>?
            </p>
            <p className="text-sm text-destructive font-medium">
              Esta ação não pode ser desfeita. Todos os membros serão removidos e a equipe será permanentemente excluída.
            </p>
            {erro && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
                {erro}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setModalExcluirEquipe(false);
                  setErro(null);
                }}
                disabled={excluindoEquipe}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleExcluirEquipe}
                disabled={excluindoEquipe}
              >
                {excluindoEquipe ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Equipe
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

