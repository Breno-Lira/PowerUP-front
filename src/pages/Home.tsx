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
import { perfilService, PerfilResumo, avatarService, AvatarResumo, rankingService, RankingEntry, AtributosCalculados } from '@/services/api';

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

  // Obter dados do usuário logado
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

        // Buscar atributos calculados do avatar
        try {
          const atributosResp = await avatarService.obterAtributos(avatarResp.id);
          setAtributos(atributosResp);
        } catch (e) {
          console.warn('Não foi possível carregar atributos do avatar', e);
        }

        // Ranking global: busca posição do usuário
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

        setHome({
          xpAtual: avatarResp.experiencia ?? 0,
          xpMaximo: 100,
          treinosCompletos: 0,
          treinosTotal: 0,
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
                  <span className="text-sm font-medium">Progresso de XP</span>
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
                  <Progress value={Math.min((atributos.forca / 100) * 100, 100)} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Resistência</span>
                    <span className="text-muted-foreground">{atributos.resistencia}</span>
                  </div>
                  <Progress value={Math.min((atributos.resistencia / 100) * 100, 100)} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Agilidade</span>
                    <span className="text-muted-foreground">{atributos.agilidade}</span>
                  </div>
                  <Progress value={Math.min((atributos.agilidade / 100) * 100, 100)} />
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
      </div>
    </div>
  );
}

