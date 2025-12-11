import { useState, useEffect } from 'react';
import { Menu, TrendingUp, Crown, Check, User } from 'lucide-react';
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
import { perfilService, PerfilResumo } from '@/services/api';

interface TituloRank {
  nome: string;
  xpNecessario: number;
}

interface JogadorRanking {
  id: number;
  nome: string;
  nivel: number;
  titulo: string;
  xp: number;
  posicao: number;
  isUsuario: boolean;
}

export function Ranking() {
  const navigate = useNavigate();
  // Obter dados do usuário logado
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = userData?.email;
  const [perfilUsuario, setPerfilUsuario] = useState<PerfilResumo | null>(null);
  
  const [abaAtiva, setAbaAtiva] = useState<'global' | 'amigos' | 'equipes'>('global');

  const posicaoUsuario = {
    posicao: 12,
    titulo: 'Dragão',
    xp: 23700,
    nivel: 40,
  };

  const titulosRank: TituloRank[] = [
    { nome: 'Camundongo', xpNecessario: 0 },
    { nome: 'Gato', xpNecessario: 1000 },
    { nome: 'Cachorro', xpNecessario: 2500 },
    { nome: 'Lobo', xpNecessario: 5000 },
    { nome: 'Leão', xpNecessario: 10000 },
    { nome: 'Dragão', xpNecessario: 20000 },
  ];

  const rankingGlobal: JogadorRanking[] = [
    {
      id: 1,
      nome: 'Ned',
      nivel: 45,
      titulo: 'Dragão',
      xp: 25500,
      posicao: 1,
      isUsuario: false,
    },
    {
      id: 2,
      nome: 'Torres',
      nivel: 43,
      titulo: 'Dragão',
      xp: 24000,
      posicao: 2,
      isUsuario: false,
    },
    {
      id: 3,
      nome: 'Você',
      nivel: 40,
      titulo: 'Dragão',
      xp: 23700,
      posicao: 12,
      isUsuario: true,
    },
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
  ];

  useEffect(() => {
    // Carregar perfil para obter foto
    if (userData?.perfilId) {
      perfilService.obterPorId(userData.perfilId)
        .then(setPerfilUsuario)
        .catch(console.error);
    }
  }, [userData?.perfilId]);

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
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Sua Posição Global</p>
                    <p className="text-lg font-semibold">
                      #{posicaoUsuario.posicao} . {posicaoUsuario.titulo}
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
                    <span className="font-medium">{titulo.nome}</span>
                    <span className="text-sm text-muted-foreground">
                      {titulo.xpNecessario.toLocaleString('pt-BR')} XP
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
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {rankingGlobal.map((jogador) => (
                      <div
                        key={jogador.id}
                        className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                          jogador.isUsuario
                            ? 'bg-green-100 border-2 border-green-500'
                            : 'hover:bg-accent/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {getIconePosicao(jogador.posicao)}
                          <Avatar className={`h-10 w-10 ${getCorAvatar(jogador.posicao, jogador.isUsuario)}`}>
                            <AvatarImage src="" alt={jogador.nome} />
                            <AvatarFallback className="text-sm font-bold">
                              {jogador.nome.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{jogador.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            Nível {jogador.nivel} . {jogador.titulo}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{jogador.xp.toLocaleString('pt-BR')} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conteúdo Amigos */}
            <TabsContent value="amigos" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground py-8">
                    Ranking de amigos em breve
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conteúdo Equipes */}
            <TabsContent value="equipes" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground py-8">
                    Ranking de equipes em breve
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}


