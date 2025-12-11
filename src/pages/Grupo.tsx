import { useState, useEffect } from 'react';
import { Menu, ArrowLeft, Copy, Settings, Crown, Trophy, Calendar, Users, Dumbbell, Heart, Plus, LogOut } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UserInfoHeader } from '@/components/UserInfoHeader';

interface Membro {
  id: number;
  nome: string;
  isLeader: boolean;
  posicao: number;
  contribuicao: number;
  avatar: string;
}

interface GrupoData {
  id: number;
  nome: string;
  motto: string;
  codigoConvite: string;
  diasRestantes: number;
  membros: number;
  pontosTotais: number;
  diasAtivos: number;
  membrosLista: Membro[];
}

export function Grupo() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [grupo, setGrupo] = useState<GrupoData | null>(null);
  const [loading, setLoading] = useState(true);

  // Dados mockados baseados no wireframe
  useEffect(() => {
    const dadosMock: GrupoData = {
      id: parseInt(id || '1'),
      nome: 'Iron Warriors',
      motto: 'We lift heavy and support each other!',
      codigoConvite: 'IRON2024',
      diasRestantes: 0,
      membros: 3,
      pontosTotais: 6500,
      diasAtivos: 403,
      membrosLista: [
        {
          id: 1,
          nome: 'PowerUser',
          isLeader: true,
          posicao: 1,
          contribuicao: 2500,
          avatar: 'PU',
        },
        {
          id: 2,
          nome: 'GymBro',
          isLeader: false,
          posicao: 2,
          contribuicao: 2200,
          avatar: 'GB',
        },
        {
          id: 3,
          nome: 'FitnessFan',
          isLeader: false,
          posicao: 3,
          contribuicao: 1800,
          avatar: 'FF',
        },
      ],
    };
    
    // Simular carregamento
    setTimeout(() => {
      setGrupo(dadosMock);
      setLoading(false);
    }, 500);
  }, [id]);

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

  const handleCopiarCodigo = () => {
    if (grupo) {
      navigator.clipboard.writeText(grupo.codigoConvite);
    }
  };

  if (loading || !grupo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando grupo...</p>
        </div>
      </div>
    );
  }


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
            <SheetContent side="left" className="w-[280px] sm:w-[320px] flex flex-col h-full">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 space-y-2 flex-1 overflow-auto">
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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header da Página */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => navigate('/social')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            <div>
              <h1 className="text-3xl font-bold">Teams</h1>
              <p className="text-muted-foreground mt-1">
                Join forces with friends and compete together
              </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Join Team</Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </div>
          </div>

          {/* Card de Detalhes do Time */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{grupo.nome}</CardTitle>
                  <Badge className="bg-yellow-500 text-yellow-900">
                    <Crown className="h-3 w-3 mr-1" />
                    Leader
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopiarCodigo}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground mt-2">{grupo.motto}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Invite Code */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Invite Code</p>
                <p className="text-xl font-bold">{grupo.codigoConvite}</p>
              </div>

              {/* Challenge End */}
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Challenge ends in{' '}
                  <span className="text-yellow-600 font-bold">{grupo.diasRestantes} days</span>
                </p>
              </div>

              {/* Estatísticas do Time */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{grupo.membros}</p>
                  <p className="text-sm text-muted-foreground">Members</p>
                </div>
                <div className="text-center">
                  <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{grupo.pontosTotais.toLocaleString('pt-BR')}</p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
                <div className="text-center">
                  <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{grupo.diasAtivos}</p>
                  <p className="text-sm text-muted-foreground">Days Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção Team Members */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Team Members</h2>
            <div className="space-y-2">
              {grupo.membrosLista.map((membro) => (
                <Card key={membro.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                          {membro.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{membro.nome}</p>
                          {membro.isLeader && (
                            <Badge variant="default">Leader</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">#{membro.posicao} in team</p>
                      </div>
                      <p className="text-lg font-semibold text-primary">
                        {membro.contribuicao.toLocaleString('pt-BR')} contribution
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Seção Team Benefits */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Team Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <Trophy className="h-8 w-8 text-yellow-500 mb-3" />
                  <h3 className="font-semibold mb-2">Team Rankings</h3>
                  <p className="text-sm text-muted-foreground">
                    Compete with other teams for the top spot
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Dumbbell className="h-8 w-8 text-yellow-500 mb-3" />
                  <h3 className="font-semibold mb-2">Group Challenges</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete challenges together for bonus rewards
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Heart className="h-8 w-8 text-yellow-500 mb-3" />
                  <h3 className="font-semibold mb-2">Accountability</h3>
                  <p className="text-sm text-muted-foreground">
                    Stay motivated with your team members
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

