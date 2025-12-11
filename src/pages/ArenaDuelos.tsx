import { useState } from 'react';
import { Menu, Sword, Trophy, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserInfoHeader } from '@/components/UserInfoHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface DueloHistorico {
  id: number;
  oponente: string;
  data: string;
  resultado: 'vitoria' | 'derrota';
  pontuacaoOponente: number;
  pontuacaoUsuario: number;
}

interface RoundDuelo {
  numero: number;
  atributo: string;
  pontuacaoUsuario: number;
  pontuacaoOponente: number;
}

export function ArenaDuelos() {
  const navigate = useNavigate();
  const [vitorias, setVitorias] = useState(1);
  const [derrotas, setDerrotas] = useState(2);
  const [duelosHoje, setDuelosHoje] = useState({ completos: 3, maximo: 5 });
  const [modalResultadoAberto, setModalResultadoAberto] = useState(false);
  const [resultadoDuelo, setResultadoDuelo] = useState<'vitoria' | 'derrota' | null>(null);

  const oponenteAtual = 'Jogador n1';

  const historicoDuelos: DueloHistorico[] = [
    {
      id: 1,
      oponente: 'Carlos M.',
      data: '12/04/25',
      resultado: 'vitoria',
      pontuacaoOponente: 1,
      pontuacaoUsuario: 2,
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

  const roundsDuelo: RoundDuelo[] = [
    { numero: 1, atributo: 'Resistência', pontuacaoUsuario: 87, pontuacaoOponente: 90 },
    { numero: 2, atributo: 'Agilidade', pontuacaoUsuario: 82, pontuacaoOponente: 87 },
    { numero: 3, atributo: 'Força', pontuacaoUsuario: 83, pontuacaoOponente: 88 },
  ];

  const handleIniciarDuelo = () => {
    // Simular duelo e calcular resultado
    const totalUsuario = roundsDuelo.reduce((acc, round) => acc + round.pontuacaoUsuario, 0);
    const totalOponente = roundsDuelo.reduce((acc, round) => acc + round.pontuacaoOponente, 0);
    
    const resultado = totalUsuario > totalOponente ? 'vitoria' : 'derrota';
    setResultadoDuelo(resultado);
    setModalResultadoAberto(true);

    // Atualizar estatísticas
    if (resultado === 'vitoria') {
      setVitorias((prev) => prev + 1);
    } else {
      setDerrotas((prev) => prev + 1);
    }
    setDuelosHoje((prev) => ({
      ...prev,
      completos: Math.min(prev.completos + 1, prev.maximo),
    }));
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
        <UserInfoHeader className="mb-4" />
        <div className="space-y-6">
          {/* Header da Página */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Arena de duelos</h1>
            <p className="text-muted-foreground">
              Desafie seus amigos e mostre sua força!
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold mb-1">{vitorias}</p>
                  <p className="text-sm text-muted-foreground">Vitórias</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold mb-1">{derrotas}</p>
                  <p className="text-sm text-muted-foreground">Derrotas</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold mb-1">
                    {duelosHoje.completos}/{duelosHoje.maximo}
                  </p>
                  <p className="text-sm text-muted-foreground">Hoje</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botão Iniciar Duelo */}
          <Button
            onClick={handleIniciarDuelo}
            size="lg"
            className="w-full"
          >
            <Sword className="h-5 w-5 mr-2" />
            Iniciar duelo contra {oponenteAtual}
          </Button>

          {/* Histórico de Duelos */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Duelos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historicoDuelos.map((duelo) => (
                  <div
                    key={duelo.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" alt={duelo.oponente} />
                      <AvatarFallback className="bg-muted">
                        <X className="h-6 w-6 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="font-semibold">{duelo.oponente}</p>
                          <p className="text-sm text-muted-foreground">{duelo.data}</p>
                        </div>
                        <Badge
                          variant={duelo.resultado === 'vitoria' ? 'default' : 'destructive'}
                        >
                          {duelo.resultado === 'vitoria' ? 'Vitória' : 'Derrota'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <span className="font-medium">{duelo.oponente}</span>
                        <span className="text-muted-foreground">{duelo.pontuacaoOponente}</span>
                        <span className="text-muted-foreground">X</span>
                        <span className="text-muted-foreground">{duelo.pontuacaoUsuario}</span>
                        <span className="font-medium">Você</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Resultado do Duelo */}
      <Dialog open={modalResultadoAberto} onOpenChange={setModalResultadoAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              {resultadoDuelo === 'vitoria' ? 'Vitória' : 'Derrota'}
            </DialogTitle>
            <DialogDescription className="text-center">
              vs {oponenteAtual}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            {roundsDuelo.map((round) => (
              <Card key={round.numero}>
                <CardContent className="pt-4">
                  <p className="text-sm font-medium mb-3">
                    Round {round.numero}: {round.atributo}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{round.pontuacaoUsuario}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="text-lg font-bold">{round.pontuacaoOponente}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={() => setModalResultadoAberto(false)}
            className="w-full mt-4"
          >
            Fechar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

