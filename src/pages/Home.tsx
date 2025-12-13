import { useEffect, useState } from 'react';
import { Menu, Dumbbell, Trophy, Sword, Play, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { perfilService, PerfilResumo, avatarService, AvatarResumo, rankingService, RankingEntry, AtributosCalculados, conquistaService, ConquistaResumo, ConquistasComStatusResponse, planoTreinoService, frequenciaService } from '@/services/api';

interface HomeData {
  xpAtual: number;
  xpMaximo: number;
  treinosCompletos: number;
  treinosTotal: number;
  rank: string;
}

export function Home() {
  const navigate = useNavigate();
  const [home, setHome] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<PerfilResumo | null>(null);
  const [avatar, setAvatar] = useState<AvatarResumo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [posicaoRanking, setPosicaoRanking] = useState<RankingEntry | null>(null);
  const [atributos, setAtributos] = useState<AtributosCalculados | null>(null);
  const [conquistas, setConquistas] = useState<ConquistasComStatusResponse | null>(null);
  const [conquistaSelecionada, setConquistaSelecionada] = useState<ConquistaResumo | null>(null);

  
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = userData.email;

  useEffect(() => {
    const carregarDados = async () => {
      if (!userData.perfilId || !userEmail) {
        setErro('Usuário não identificado. Faça login novamente.');
        setLoading(false);
        return;
      }

      try {
        const [perfilResp, avatarResp] = await Promise.all([
          perfilService.obterPorId(userData.perfilId),
          avatarService.obterPorPerfilId(userData.perfilId),
        ]);

        setPerfil(perfilResp);
        setAvatar(avatarResp);

        
        try {
          const atributosResp = await avatarService.obterAtributos(avatarResp.id);
          setAtributos(atributosResp);
        } catch (e) {
          console.warn('Não foi possível carregar atributos do avatar', e);
        }

        
        try {
          const rankingGlobal = await rankingService.global();
          const entradaUsuario = rankingGlobal.find(r =>
            r.perfilId === userData.perfilId ||
            (r.email && userEmail && r.email.toLowerCase() === userEmail.toLowerCase())
          );
          if (entradaUsuario) {
            setPosicaoRanking(entradaUsuario);
          }
        } catch (e) {
          console.warn('Não foi possível carregar posição no ranking global', e);
        }

        
        try {
          const conquistasData = await conquistaService.listarTodasComStatus(userData.perfilId);
          setConquistas(conquistasData);
        } catch (e) {
          console.warn('Não foi possível carregar conquistas', e);
        }

        
        let treinosCompletos = 0;
        let treinosTotal = 0;
        try {
          
          const planos = await planoTreinoService.listarPorUsuario(userEmail);
          const planosAtivos = planos.filter(p => p.estado === 'Ativo');
          
          
          if (planosAtivos.length > 0) {
            treinosTotal = planosAtivos.reduce((sum, p) => sum + p.dias.length, 0);
          }

          
          const frequenciasList = await frequenciaService.listarPorPerfil(userData.perfilId);
          
          
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
          treinosCompletos = diasUnicos.size;
          
          
          if (planosAtivos.length === 0) {
            treinosTotal = treinosCompletos;
          }
        } catch (e) {
          console.warn('Não foi possível carregar dados de frequência', e);
        }

        setHome({
          xpAtual: avatarResp.experiencia ?? 0,
          xpMaximo: 100,
          treinosCompletos: treinosCompletos,
          treinosTotal: treinosTotal,
          rank: '—',
        });
      } catch (e: any) {
        console.error(e);
        setErro(e.message || 'Não foi possível carregar os dados do usuário.');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [userData.perfilId, userEmail]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md text-center space-y-3">
          <p className="text-lg font-semibold">Ops!</p>
          <p className="text-sm text-muted-foreground">{erro}</p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Ir para login
          </Button>
        </div>
      </div>
    );
  }

  if (!home) {
    return null;
  }

  const xpTotal = avatar ? (avatar.nivel - 1) * 100 + avatar.experiencia : home.xpAtual;
  const xpPercentual = home.xpMaximo ? Math.min((home.xpAtual / home.xpMaximo) * 100, 100) : 0;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header com Menu e XP */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Botão do Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
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
                    <AvatarImage src={perfil?.foto || undefined} alt={perfil?.username || 'Usuário'} />
                    <AvatarFallback className="bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {perfil?.username || userData.username || userEmail || 'Usuário'}
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

          {/* Dados do usuário + XP */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={perfil?.foto || undefined} alt={perfil?.username || 'Usuário'} />
              <AvatarFallback className="bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <p className="font-semibold text-sm truncate">{perfil?.username || userData.username || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail || 'email@exemplo.com'}</p>
              <p className="text-xs text-muted-foreground flex gap-2">
                <span>Nível {avatar?.nivel ?? 1}</span>
                <span>·</span>
                <span>{xpTotal.toLocaleString('pt-BR')} XP</span>
                <span>·</span>
                <span>{(avatar?.dinheiro ?? 0).toLocaleString('pt-BR')} $</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero / Saudações */}
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8 bg-gradient-to-r from-blue-50 to-indigo-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={perfil?.foto || undefined} alt={perfil?.username || 'Usuário'} />
                  <AvatarFallback className="bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Bem-vindo de volta</p>
                  <p className="text-xl font-semibold">{perfil?.username || userData.username || 'Usuário'}</p>
                  <p className="text-sm text-muted-foreground">{userEmail || 'email@exemplo.com'}</p>
                </div>
              </div>
              <div className="flex-1 md:max-w-md">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Nível {avatar?.nivel ?? 1}</span>
                    <span className="text-sm text-muted-foreground">·</span>
                    <span className="text-sm font-medium">Progresso de XP</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{xpTotal} XP</span>
                </div>
                <Progress value={xpPercentual} className="h-3" />
                <div className="text-xs text-muted-foreground mt-1">
                  {home.xpAtual}/{home.xpMaximo} XP para o próximo nível
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grades de destaques */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Treinos</p>
                  <p className="text-2xl font-bold">{home.treinosCompletos}/{home.treinosTotal}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/treinos')} className="w-full">
                Ver treinos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ranking Global</p>
                  <p className="text-2xl font-bold">
                    {posicaoRanking ? `#${posicaoRanking.posicao}` : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {posicaoRanking ? `${posicaoRanking.xpTotal.toLocaleString('pt-BR')} XP` : 'carregando...'}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/ranking')} className="w-full">
                Ver ranking
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Sword className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duelos</p>
                  <p className="text-2xl font-bold">Arena</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/arena-duelos')} className="w-full">
                Ir para arena
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Barras de Progresso de Atributos */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">Atributos</span>
              <span className="text-sm text-muted-foreground">Estatísticas do avatar</span>
            </div>
            {atributos ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Força</span>
                    <span className="text-muted-foreground">{atributos.forca}</span>
                  </div>
                  <Progress value={Math.min((atributos.forca / 1000) * 100, 100)} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Resistência</span>
                    <span className="text-muted-foreground">{atributos.resistencia}</span>
                  </div>
                  <Progress value={Math.min((atributos.resistencia / 1000) * 100, 100)} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Agilidade</span>
                    <span className="text-muted-foreground">{atributos.agilidade}</span>
                  </div>
                  <Progress value={Math.min((atributos.agilidade / 1000) * 100, 100)} />
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Carregando atributos...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações rápidas */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                <p className="text-lg font-semibold">Iniciar Treino</p>
              </div>
              <p className="text-sm text-muted-foreground">Continue sua rotina e ganhe XP mais rápido.</p>
              <Button onClick={() => navigate('/treinos')} className="w-full" size="lg">
                Começar agora
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <p className="text-lg font-semibold">Personalizar Avatar</p>
              </div>
              <p className="text-sm text-muted-foreground">Equipe acessórios e destaque seu perfil.</p>
              <Button variant="outline" onClick={() => navigate('/perfil')} className="w-full" size="lg">
                Ir para perfil
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Conquistas */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-600" />
                <span className="text-base font-semibold">Conquistas</span>
              </div>
              {conquistas && (
                <span className="text-sm text-muted-foreground">
                  {conquistas.totalConquistadas} / {conquistas.totalGeral}
                </span>
              )}
            </div>
            
            {conquistas && conquistas.conquistas.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {conquistas.conquistas.map((conquista) => (
                  <div
                    key={conquista.id}
                    onClick={() => setConquistaSelecionada(conquista)}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                      conquista.concluida
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                        : 'border-gray-200 bg-gray-50 dark:bg-gray-900/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          conquista.concluida
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-300 text-gray-500'
                        }`}
                      >
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold text-sm ${
                            conquista.concluida ? 'text-amber-900 dark:text-amber-100' : 'text-gray-500'
                          }`}
                        >
                          {conquista.nome}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            conquista.concluida ? 'text-amber-700 dark:text-amber-300' : 'text-gray-400'
                          }`}
                        >
                          {conquista.descricao}
                        </p>
                        {conquista.concluida ? (
                          <span className="inline-block mt-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
                            ✓ Conquistada
                          </span>
                        ) : (
                          <span className="inline-block mt-2 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            Não conquistada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Nenhuma conquista disponível no momento.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Requisitos da Conquista */}
      <Dialog open={!!conquistaSelecionada} onOpenChange={(open) => !open && setConquistaSelecionada(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className={`h-5 w-5 ${conquistaSelecionada?.concluida ? 'text-amber-600' : 'text-gray-400'}`} />
              {conquistaSelecionada?.nome}
            </DialogTitle>
            <DialogDescription>{conquistaSelecionada?.descricao}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Status:</p>
              {conquistaSelecionada?.concluida ? (
                <span className="inline-block text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded">
                  ✓ Conquistada
                </span>
              ) : (
                <span className="inline-block text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
                  Não conquistada
                </span>
              )}
            </div>

            {(conquistaSelecionada?.pesoMinimo || 
              conquistaSelecionada?.atributoMinimo || 
              conquistaSelecionada?.repeticoesMinimas || 
              conquistaSelecionada?.seriesMinimas) && (
              <div>
                <p className="text-sm font-medium mb-3">Requisitos mínimos:</p>
                <div className="space-y-2">
                  {conquistaSelecionada.pesoMinimo && (
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm text-muted-foreground">Peso mínimo:</span>
                      <span className="text-sm font-medium">{conquistaSelecionada.pesoMinimo} kg</span>
                    </div>
                  )}
                  {conquistaSelecionada.atributoMinimo && 
                   conquistaSelecionada.tipoAtributo && 
                   conquistaSelecionada.tipoAtributo.toLowerCase() !== 'peso' && (
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm text-muted-foreground">
                        {conquistaSelecionada.tipoAtributo.charAt(0).toUpperCase() + conquistaSelecionada.tipoAtributo.slice(1)}:
                      </span>
                      <span className="text-sm font-medium">{conquistaSelecionada.atributoMinimo}</span>
                    </div>
                  )}
                  {conquistaSelecionada.repeticoesMinimas && (
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm text-muted-foreground">Repetições mínimas:</span>
                      <span className="text-sm font-medium">{conquistaSelecionada.repeticoesMinimas}</span>
                    </div>
                  )}
                  {conquistaSelecionada.seriesMinimas && (
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                      <span className="text-sm text-muted-foreground">Séries mínimas:</span>
                      <span className="text-sm font-medium">{conquistaSelecionada.seriesMinimas}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!conquistaSelecionada?.pesoMinimo && 
             !conquistaSelecionada?.atributoMinimo && 
             !conquistaSelecionada?.repeticoesMinimas && 
             !conquistaSelecionada?.seriesMinimas && (
              <div className="text-sm text-muted-foreground text-center py-4">
                Esta conquista não possui requisitos específicos definidos.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

