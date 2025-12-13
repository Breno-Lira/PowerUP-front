import { useState, useEffect, useMemo } from 'react';
import { Menu, TrendingUp, Crown, Check, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UserInfoHeader } from '@/components/UserInfoHeader';
import {
  perfilService,
  PerfilResumo,
  rankingService,
  RankingEntry,
  equipeService,
  EquipeResumo,
} from '@/services/api';

interface TituloRank {
  nome: string;
  nivelMin: number;
}

export function Ranking() {
  const navigate = useNavigate();
  
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = userData?.email;
  const [perfilUsuario, setPerfilUsuario] = useState<PerfilResumo | null>(null);

  const [abaAtiva, setAbaAtiva] = useState<'global' | 'amigos' | 'equipes'>('global');
  const [rankingGlobal, setRankingGlobal] = useState<RankingEntry[]>([]);
  const [rankingAmigos, setRankingAmigos] = useState<RankingEntry[]>([]);
  const [rankingEquipe, setRankingEquipe] = useState<RankingEntry[]>([]);
  const [equipesUsuario, setEquipesUsuario] = useState<EquipeResumo[]>([]);
  const [equipeSelecionada, setEquipeSelecionada] = useState<number | null>(null);
  const [loading, setLoading] = useState<{ global: boolean; amigos: boolean; equipe: boolean }>({
    global: false,
    amigos: false,
    equipe: false,
  });
  const [erro, setErro] = useState<string | null>(null);

  const titulosRank: TituloRank[] = [
    { nome: 'Camundongo', nivelMin: 1 },
    { nome: 'Gato', nivelMin: 5 },
    { nome: 'Cachorro', nivelMin: 10 },
    { nome: 'Lobo', nivelMin: 15 },
    { nome: 'Leão', nivelMin: 20 },
    { nome: 'Dragão', nivelMin: 25 },
  ];

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
    
    if (userData?.perfilId) {
      perfilService.obterPorId(userData.perfilId)
        .then(setPerfilUsuario)
        .catch(console.error);
    }
  }, [userData?.perfilId]);

  useEffect(() => {
    const carregarGlobal = async () => {
      setLoading((prev) => ({ ...prev, global: true }));
      setErro(null);
      try {
        const dados = await rankingService.global();
        setRankingGlobal(dados);
      } catch (e: any) {
        setErro(e?.message || 'Erro ao carregar ranking global');
      } finally {
        setLoading((prev) => ({ ...prev, global: false }));
      }
    };
    carregarGlobal();
  }, []);

  useEffect(() => {
    const carregarEquipes = async () => {
      if (!userEmail) return;
      try {
        const equipes = await equipeService.listarPorUsuario(userEmail);
        setEquipesUsuario(equipes);
        if (equipes.length > 0 && !equipeSelecionada) {
          setEquipeSelecionada(equipes[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    carregarEquipes();
  }, [userEmail, equipeSelecionada]);

  useEffect(() => {
    const carregarAmigos = async () => {
      if (abaAtiva !== 'amigos' || !userEmail || rankingAmigos.length > 0) return;
      setLoading((prev) => ({ ...prev, amigos: true }));
      setErro(null);
      try {
        const dados = await rankingService.amigos(userEmail);
        setRankingAmigos(dados);
      } catch (e: any) {
        setErro(e?.message || 'Erro ao carregar ranking de amigos');
      } finally {
        setLoading((prev) => ({ ...prev, amigos: false }));
      }
    };
    carregarAmigos();
  }, [abaAtiva, userEmail, rankingAmigos.length]);

  useEffect(() => {
    const carregarRankingEquipe = async () => {
      if (abaAtiva !== 'equipes' || !equipeSelecionada) return;
      setLoading((prev) => ({ ...prev, equipe: true }));
      setErro(null);
      try {
        const dados = await rankingService.equipe(equipeSelecionada);
        setRankingEquipe(dados);
      } catch (e: any) {
        setErro(e?.message || 'Erro ao carregar ranking da equipe');
      } finally {
        setLoading((prev) => ({ ...prev, equipe: false }));
      }
    };
    carregarRankingEquipe();
  }, [abaAtiva, equipeSelecionada]);

  const posicaoUsuario = useMemo(() => {
    if (!userEmail || rankingGlobal.length === 0) {
      return null;
    }
    const entrada = rankingGlobal.find((r) => r.email === userEmail);
    if (!entrada) return null;

    const titulo = titulosRank.reduce((acc, t) => {
      if (entrada.nivel >= t.nivelMin) return t.nome;
      return acc;
    }, titulosRank[0].nome);

    return {
      posicao: entrada.posicao,
      titulo,
      xp: entrada.xpTotal,
      nivel: entrada.nivel,
    };
  }, [rankingGlobal, userEmail, titulosRank]);

  const getIconePosicao = (posicao: number) => {
    if (posicao === 1) {
      return <Crown className="h-5 w-5 text-yellow-500" />;
    }
    return (
      <div className="flex flex-col items-center">
        <Check className="h-4 w-4" />
        <span className="text-xs font-bold">{posicao}</span>
      </div>
    );
  };

  const getCorAvatar = (posicao: number, isUsuario: boolean) => {
    if (isUsuario) return 'bg-green-600 text-white';
    if (posicao === 1) return 'bg-yellow-500 text-white';
    if (posicao === 2) return 'bg-gray-400 text-white';
    return 'bg-gray-300 text-gray-700';
  };

  const getTituloPorNivel = (nivel: number) => {
    let titulo = titulosRank[0].nome;
    for (const t of titulosRank) {
      if (nivel >= t.nivelMin) {
        titulo = t.nome;
      } else {
        break;
      }
    }
    return titulo;
  };

  const getEmojiPorTitulo = (titulo: string) => {
    switch (titulo) {
      case 'Camundongo':
        return '🐭';
      case 'Gato':
        return '🐱';
      case 'Cachorro':
        return '🐶';
      case 'Lobo':
        return '🐺';
      case 'Leão':
        return '🦁';
      case 'Dragão':
        return '🐲';
      default:
        return '🏅';
    }
  };

  const renderLinhaRanking = (entrada: RankingEntry) => {
    const isUsuario = userEmail && entrada.email === userEmail;
    const tituloRank = getTituloPorNivel(entrada.nivel);
    return (
      <div
        key={`${entrada.perfilId}-${entrada.email}-${entrada.posicao}`}
        className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${isUsuario ? 'bg-green-100 border-2 border-green-500' : 'hover:bg-accent/50'
          }`}
      >
        <div className="flex items-center gap-3">
          {getIconePosicao(entrada.posicao)}
          <Avatar className={`h-10 w-10 ${getCorAvatar(entrada.posicao, !!isUsuario)}`}>
            <AvatarImage src={entrada.foto || ''} alt={entrada.username || entrada.email || 'Usuário'} />
            <AvatarFallback className="text-sm font-bold">
              {(entrada.username || entrada.email || '?').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <p className="font-semibold">{entrada.username || entrada.email || 'Usuário'}</p>
          <div className="text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
            <span>Nível {entrada.nivel}</span>
            <span>·</span>
            <span>{entrada.xpTotal.toLocaleString('pt-BR')} XP</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
              <span>{getEmojiPorTitulo(tituloRank)}</span>
              <span>{tituloRank}</span>
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">#{entrada.posicao}</p>
        </div>
      </div>
    );
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

              {/* Logout fixo no rodapé da sidebar */}
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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header da Página */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Rankings</h1>
            <p className="text-muted-foreground">Competição global</p>
          </div>

          {/* Card Sua Posição Global */}
          {posicaoUsuario && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Sua Posição Global</p>
                      <p className="text-lg font-semibold flex items-center gap-1">
                        <span>#{posicaoUsuario.posicao} ·</span>
                        <span>{getEmojiPorTitulo(posicaoUsuario.titulo)}</span>
                        <span>{posicaoUsuario.titulo}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{posicaoUsuario.xp.toLocaleString('pt-BR')} XP</p>
                    <p className="text-sm text-muted-foreground">Nível {posicaoUsuario.nivel}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Títulos de Rank */}
          <Card>
            <CardHeader>
              <CardTitle>Títulos de Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {titulosRank.map((titulo, index) => (
                  <div
                    key={titulo.nome}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <span className="font-medium flex items-center gap-2">
                      <span>{getEmojiPorTitulo(titulo.nome)}</span>
                      <span>{titulo.nome}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Nível mínimo: {titulo.nivelMin}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs de Navegação */}
          <Tabs value={abaAtiva} onValueChange={(value) => setAbaAtiva(value as typeof abaAtiva)}>
            <TabsList className="w-full">
              <TabsTrigger value="global" className="flex-1">
                Global
              </TabsTrigger>
              <TabsTrigger value="amigos" className="flex-1">
                Amigos
              </TabsTrigger>
              <TabsTrigger value="equipes" className="flex-1">
                Equipes
              </TabsTrigger>
            </TabsList>

            {/* Conteúdo Global */}
            <TabsContent value="global" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {loading.global && <p className="text-center text-muted-foreground">Carregando ranking global...</p>}
                  {!loading.global && rankingGlobal.length === 0 && (
                    <p className="text-center text-muted-foreground">Nenhum dado de ranking global disponível.</p>
                  )}
                  {erro && <p className="text-center text-red-500">{erro}</p>}
                  {rankingGlobal.map((entrada) => renderLinhaRanking(entrada))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conteúdo Amigos */}
            <TabsContent value="amigos" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {loading.amigos && <p className="text-center text-muted-foreground">Carregando ranking de amigos...</p>}
                  {!loading.amigos && rankingAmigos.length === 0 && (
                    <p className="text-center text-muted-foreground">Nenhum amigo encontrado ou sem dados.</p>
                  )}
                  {erro && <p className="text-center text-red-500">{erro}</p>}
                  {rankingAmigos.map((entrada) => renderLinhaRanking(entrada))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conteúdo Equipes */}
            <TabsContent value="equipes" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {equipesUsuario.length > 1 && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-muted-foreground">Selecione a equipe</label>
                      <select
                        value={equipeSelecionada ?? ''}
                        onChange={(e) => setEquipeSelecionada(Number(e.target.value))}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      >
                        {equipesUsuario.map((eq) => (
                          <option key={eq.id} value={eq.id}>
                            {eq.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {loading.equipe && <p className="text-center text-muted-foreground">Carregando ranking da equipe...</p>}
                  {!loading.equipe && rankingEquipe.length === 0 && (
                    <p className="text-center text-muted-foreground">Nenhum dado de ranking para a equipe.</p>
                  )}
                  {erro && <p className="text-center text-red-500">{erro}</p>}
                  {rankingEquipe.map((entrada) => renderLinhaRanking(entrada))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}


