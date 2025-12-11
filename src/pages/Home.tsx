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
import { perfilService, PerfilResumo, avatarService, AvatarResumo } from '@/services/api';

interface HomeData {
  xpAtual: number;
  xpMaximo: number;
  treinosCompletos: number;
  treinosTotal: number;
  rank: string;
  atributo1: number;
  atributo2: number;
}

export function Home() {
  const navigate = useNavigate();
  const [home, setHome] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<PerfilResumo | null>(null);
  const [avatar, setAvatar] = useState<AvatarResumo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  
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
        // Perfil (nome/foto) e Avatar (nível/XP)
        const [perfilResp, avatarResp] = await Promise.all([
          perfilService.obterPorId(userData.perfilId),
          avatarService.obterPorPerfilId(userData.perfilId),
        ]);

        setPerfil(perfilResp);
        setAvatar(avatarResp);

        // Monta dados básicos para cards/progresso
        setHome({
          xpAtual: avatarResp.experiencia ?? 0,
          xpMaximo: 100, // Cada nível exige 100 XP; total é calculado abaixo
          treinosCompletos: 0,
          treinosTotal: 0,
          rank: '—',
          atributo1: 0,
          atributo2: 0,
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
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 gap-4">
          {/* Card Treinos */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center">
                <Dumbbell className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Treinos</p>
                <p className="text-2xl font-bold">
                  {home.treinosCompletos}/{home.treinosTotal}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card Rank */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center">
                <Trophy className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Rank</p>
                <p className="text-2xl font-bold">{home.rank}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barras de Progresso de Atributos */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Atributo 1</span>
                <span className="text-sm text-muted-foreground">{home.atributo1}%</span>
              </div>
              <Progress value={home.atributo1} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Atributo 2</span>
                <span className="text-sm text-muted-foreground">{home.atributo2}%</span>
              </div>
              <Progress value={home.atributo2} />
            </div>
          </CardContent>
        </Card>

        {/* Card Duelos */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center">
              <Sword className="h-8 w-8 text-primary mb-2" />
              <p className="text-lg font-semibold mb-1">Duelos</p>
              <p className="text-sm text-muted-foreground mb-4">
                Desafie outros usuários
              </p>
              <Button
                onClick={() => navigate('/arena-duelos')}
                className="w-full"
                size="sm"
              >
                <Sword className="h-4 w-4 mr-2" />
                Arena de Duelos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botão Iniciar Treino */}
        <Button
          onClick={() => navigate('/treinos')}
          size="lg"
          className="w-full"
        >
          <Play className="h-5 w-5 mr-2" />
          Iniciar Treino
        </Button>
      </div>
    </div>
  );
}

