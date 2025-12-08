import { useEffect, useState } from 'react';
import { Menu, Dumbbell, Trophy, Sword, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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

  useEffect(() => {
    // Dados mockados baseados no wireframe
    const dadosMock: HomeData = {
      xpAtual: 750,
      xpMaximo: 1000,
      treinosCompletos: 5,
      treinosTotal: 5,
      rank: 'Lobo',
      atributo1: 80,
      atributo2: 65,
    };

    // Simular carregamento
    setTimeout(() => {
      setHome(dadosMock);
      setLoading(false);
    }, 500);
  }, []);

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

  if (!home) {
    return null;
  }

  const xpPercentual = (home.xpAtual / home.xpMaximo) * 100;

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
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 space-y-2">
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

          {/* XP no topo direito */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium">XP</div>
              <div className="text-xs text-muted-foreground">
                {home.xpAtual}/{home.xpMaximo}
              </div>
            </div>
            <div className="w-24">
              <Progress value={xpPercentual} className="h-2" />
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

