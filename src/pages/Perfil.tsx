import { useEffect, useState } from 'react';
import { Menu, Settings, Dumbbell, TrendingUp, Sword, Flame, Activity, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface PerfilData {
  id: number;
  username: string;
  nivel: number;
  titulo: string;
  totalTreinos: number;
  xpTotal: number;
  atributos: {
    forca: number;
    resistencia: number;
    velocidade: number;
    agilidade: number;
    flexibilidade: number;
  };
  conquistas: Array<{
    id: number;
    nome: string;
    dataConquista: string;
    icone: string;
  }>;
}

export function Perfil() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'estatisticas' | 'avatar'>('estatisticas');
  
  // Obter dados do usuário logado
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = userData.email;

  useEffect(() => {
    // Dados mockados baseados no wireframe
    const dadosMock: PerfilData = {
      id: 1,
      username: 'Você',
      nivel: 27,
      titulo: 'Lobo',
      totalTreinos: 156,
      xpTotal: 4500,
      atributos: {
        forca: 85,
        resistencia: 72,
        velocidade: 88,
        agilidade: 70,
        flexibilidade: 65,
      },
      conquistas: [
        {
          id: 1,
          nome: 'Gladiador',
          dataConquista: 'Há 2 dias',
          icone: 'sword',
        },
        {
          id: 2,
          nome: 'Sequência de Fogo',
          dataConquista: 'Há 5 dias',
          icone: 'flame',
        },
        {
          id: 3,
          nome: 'Iniciante Maluco',
          dataConquista: 'Há 2 semanas',
          icone: 'flex',
        },
      ],
    };

    // Simular carregamento
    setTimeout(() => {
      setPerfil(dadosMock);
      setLoading(false);
    }, 500);
  }, []);

  const getIconeConquista = (icone: string) => {
    switch (icone) {
      case 'sword':
        return <Sword className="h-5 w-5" />;
      case 'flame':
        return <Flame className="h-5 w-5" />;
      case 'flex':
        return <Activity className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return null;
  }

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
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
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
          {/* Header do Perfil */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" alt={perfil.username} />
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {perfil.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold">{perfil.username}</h1>
                      <span className="text-lg text-muted-foreground">
                        Nível {perfil.nivel}
                      </span>
                      <span className="text-lg text-muted-foreground">·</span>
                      <span className="text-lg text-muted-foreground">{perfil.titulo}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">Sequência de fogo</Badge>
                      <Badge variant="secondary">Iniciante maluco</Badge>
                      <Badge variant="secondary">Gladiador</Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Treinos</p>
                    <p className="text-3xl font-bold">{perfil.totalTreinos}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Dumbbell className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">XP Total</p>
                    <p className="text-3xl font-bold">{perfil.xpTotal}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Abas de Navegação */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setAbaAtiva('estatisticas')}
              className={`px-4 py-2 font-medium transition-colors ${
                abaAtiva === 'estatisticas'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Estatísticas
            </button>
            <button
              onClick={() => setAbaAtiva('avatar')}
              className={`px-4 py-2 font-medium transition-colors ${
                abaAtiva === 'avatar'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Avatar
            </button>
          </div>

          {/* Conteúdo da Aba Estatísticas */}
          {abaAtiva === 'estatisticas' && (
            <Card>
              <CardHeader>
                <CardTitle>Atributos Físicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Força</span>
                    <span className="text-muted-foreground">{perfil.atributos.forca}</span>
                  </div>
                  <Progress value={perfil.atributos.forca} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Resistência</span>
                    <span className="text-muted-foreground">{perfil.atributos.resistencia}</span>
                  </div>
                  <Progress value={perfil.atributos.resistencia} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Velocidade</span>
                    <span className="text-muted-foreground">{perfil.atributos.velocidade}</span>
                  </div>
                  <Progress value={perfil.atributos.velocidade} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Agilidade</span>
                    <span className="text-muted-foreground">{perfil.atributos.agilidade}</span>
                  </div>
                  <Progress value={perfil.atributos.agilidade} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Flexibilidade</span>
                    <span className="text-muted-foreground">{perfil.atributos.flexibilidade}</span>
                  </div>
                  <Progress value={perfil.atributos.flexibilidade} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conteúdo da Aba Avatar */}
          {abaAtiva === 'avatar' && (
            <Card>
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
                <CardDescription>Personalize seu avatar</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade de avatar em desenvolvimento...</p>
              </CardContent>
            </Card>
          )}

          {/* Conquistas Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Conquistas Recentes</CardTitle>
              <CardDescription>Suas últimas conquistas desbloqueadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {perfil.conquistas.map((conquista) => (
                  <div
                    key={conquista.id}
                    className="flex flex-col items-center p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <div className="text-primary">
                        {getIconeConquista(conquista.icone)}
                      </div>
                    </div>
                    <h3 className="font-semibold text-center mb-1">{conquista.nome}</h3>
                    <p className="text-xs text-muted-foreground">{conquista.dataConquista}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
