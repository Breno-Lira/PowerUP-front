import { useEffect, useMemo, useState } from 'react';
import { Menu, Sword, Trophy, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserInfoHeader } from '@/components/UserInfoHeader';
import { dueloService, DueloResumo, avatarService, perfilService, usuarioService, UsuarioResumo } from '@/services/api';
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

export function ArenaDuelos() {
  const navigate = useNavigate();
  const [vitorias, setVitorias] = useState(0);
  const [derrotas, setDerrotas] = useState(0);
  const [duelosHoje, setDuelosHoje] = useState({ completos: 0, maximo: 5 });
  const [modalResultadoAberto, setModalResultadoAberto] = useState(false);
  const [resultadoDuelo, setResultadoDuelo] = useState<'vitoria' | 'derrota' | 'empate' | null>(null);
  const [historico, setHistorico] = useState<DueloResumo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const perfilId = userData?.perfilId as number | undefined;
  const userEmail = userData?.email as string | undefined;
  const [nomesPerfis, setNomesPerfis] = useState<Record<number, string>>({});
  const [nomesAvatares, setNomesAvatares] = useState<Record<number, string>>({});
  const [amigos, setAmigos] = useState<UsuarioResumo[]>([]);
  const [carregandoAmigos, setCarregandoAmigos] = useState(false);
  const [perfilAmigoPorEmail, setPerfilAmigoPorEmail] = useState<Record<string, number>>({});
  const [avatarUsuarioId, setAvatarUsuarioId] = useState<number | null>(null);
  const [carregandoNomes, setCarregandoNomes] = useState(false);
  const recompensaMoedas = 25;
  const recompensaXp = 5;

  const oponenteAtual = 'Jogador n1';

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

  const roundsDuelo = useMemo(
    () => [
      { numero: 1, atributo: 'Resistência', pontuacaoUsuario: 87, pontuacaoOponente: 90 },
      { numero: 2, atributo: 'Agilidade', pontuacaoUsuario: 82, pontuacaoOponente: 87 },
      { numero: 3, atributo: 'Força', pontuacaoUsuario: 83, pontuacaoOponente: 88 },
    ],
    []
  );

  const carregarHistorico = async () => {
    if (!perfilId) return;
    setCarregando(true);
    setErro(null);
    try {
      const duelos = await dueloService.listarPorPerfil(perfilId);
      setHistorico(duelos);
      if (avatarUsuarioId) {
        const vits = duelos.filter((d) => {
          const r = d.resultado?.toLowerCase() || '';
          
          if (r.includes('desafiante') && d.avatar1Id === avatarUsuarioId) return true;
          if (r.includes('desafiado') && d.avatar2Id === avatarUsuarioId) return true;
          return false;
        }).length;
        const derr = duelos.filter((d) => {
          const r = d.resultado?.toLowerCase() || '';
          
          if (r.includes('desafiante') && d.avatar2Id === avatarUsuarioId) return true;
          if (r.includes('desafiado') && d.avatar1Id === avatarUsuarioId) return true;
          return false;
        }).length;
        setVitorias(vits);
        setDerrotas(derr);
        const hoje = new Date().toDateString();
        const duelosHoje = duelos.filter(
          (d) => d.dataDuelo && new Date(d.dataDuelo).toDateString() === hoje
        ).length;
        setDuelosHoje({ completos: duelosHoje, maximo: 5 });
      }
    } catch (error: any) {
      console.error('Erro ao carregar histórico de duelos', error);
      setErro('Não foi possível carregar o histórico de duelos.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (perfilId) {
      carregarHistorico();
    }
  }, [perfilId]);

  const resolverNomes = async (duelos: DueloResumo[]) => {
    setCarregandoNomes(true);
    const novosPerfis: Record<number, string> = {};
    const novosAvatares: Record<number, string> = {};

    for (const duelo of duelos) {
      const avatars = [duelo.avatar1Id, duelo.avatar2Id].filter(Boolean) as number[];
      for (const avatarId of avatars) {
        try {
          
          const avatar = await avatarService.obterPorId(avatarId);
          const pid = avatar.perfilId;
          if (pid) {
            const perfil = await perfilService.obterPorId(pid);
            novosPerfis[pid] = perfil.username;
            novosAvatares[avatarId] = perfil.username;
          } else {
            novosAvatares[avatarId] = `Avatar ${avatarId}`;
          }
        } catch (e) {
          
          novosAvatares[avatarId] = `Avatar ${avatarId}`;
        }
      }
    }

    if (Object.keys(novosPerfis).length > 0) {
      setNomesPerfis((prev) => ({ ...prev, ...novosPerfis }));
    }
    if (Object.keys(novosAvatares).length > 0) {
      setNomesAvatares((prev) => ({ ...prev, ...novosAvatares }));
    }
    setCarregandoNomes(false);
  };

  useEffect(() => {
    if (historico.length > 0) {
      resolverNomes(historico);
    }
    
  }, [historico]);

  const carregarAmigos = async () => {
    if (!userEmail) return;
    setCarregandoAmigos(true);
    try {
      const lista = await usuarioService.listarAmigos(userEmail);
      setAmigos(lista);
      const perfisEncontrados: Record<string, number> = {};
      for (const amigo of lista) {
        try {
          const perfil = await perfilService.obterPorEmail(amigo.usuarioEmail);
          perfisEncontrados[amigo.usuarioEmail] = perfil.id;
          setNomesPerfis((prev) => ({ ...prev, [perfil.id]: perfil.username }));
        } catch (e) {
          console.warn('Perfil não encontrado para amigo', amigo.usuarioEmail);
        }
      }
      if (Object.keys(perfisEncontrados).length > 0) {
        setPerfilAmigoPorEmail((prev) => ({ ...prev, ...perfisEncontrados }));
      }
    } catch (e) {
      console.error('Erro ao carregar amigos', e);
    } finally {
      setCarregandoAmigos(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      carregarAmigos();
    }
  }, [userEmail]);

  useEffect(() => {
    if (perfilId) {
      avatarService
        .obterPorPerfilId(perfilId)
        .then((a) => setAvatarUsuarioId(a.id))
        .catch(() => { });
    }
  }, [perfilId]);

  useEffect(() => {
    if (perfilId && avatarUsuarioId) {
      carregarHistorico();
    }
    
  }, [avatarUsuarioId]);

  const handleIniciarDuelo = async (desafiadoPerfilId: number, nomeDesafiado: string) => {
    if (!perfilId) {
      setErro('Perfil não identificado. Faça login novamente.');
      return;
    }
    try {
      const resultado = await dueloService.realizarDuelo(perfilId, desafiadoPerfilId);
      const resultadoLower = resultado.resultado?.toLowerCase() || '';

      let tipoResultado: 'vitoria' | 'derrota' | 'empate' = 'empate';
      if (resultadoLower.includes('desafiante') || resultadoLower.includes('a1')) {
        tipoResultado = 'vitoria';
      } else if (resultadoLower.includes('desafiado') || resultadoLower.includes('a2')) {
        tipoResultado = 'derrota';
      }

      setResultadoDuelo(tipoResultado);
      setModalResultadoAberto(true);
      await carregarHistorico();
    } catch (error: any) {
      console.error('Erro ao iniciar duelo', error);
      const msgBackend = error?.response?.data?.message;
      setErro(msgBackend || `Não foi possível duelar com ${nomeDesafiado}.`);
    }
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

          {/* Histórico de Duelos */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Duelos</CardTitle>
            </CardHeader>
            <CardContent>
              {erro && <p className="text-sm text-destructive mb-2">{erro}</p>}
              {carregando || carregandoNomes ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : historico.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum duelo registrado ainda.</p>
              ) : (
                <div className="space-y-4">
                  {historico.map((duelo) => {
                    const resultadoLower = duelo.resultado?.toLowerCase() || '';

                    
                    let tipoResultado: 'vitoria' | 'derrota' | 'empate' = 'empate';

                    
                    if (duelo.avatar1Id === avatarUsuarioId) {
                      if (resultadoLower.includes('desafiante') || resultadoLower.includes('a1')) {
                        tipoResultado = 'vitoria';
                      } else if (resultadoLower.includes('desafiado') || resultadoLower.includes('a2')) {
                        tipoResultado = 'derrota';
                      }
                    }
                    
                    else if (duelo.avatar2Id === avatarUsuarioId) {
                      if (resultadoLower.includes('desafiado') || resultadoLower.includes('a2')) {
                        tipoResultado = 'vitoria';
                      } else if (resultadoLower.includes('desafiante') || resultadoLower.includes('a1')) {
                        tipoResultado = 'derrota';
                      }
                    }

                    const dataStr = duelo.dataDuelo
                      ? new Date(duelo.dataDuelo).toLocaleString('pt-BR')
                      : '';
                    const nome1 =
                      (duelo.avatar1Id && nomesAvatares[duelo.avatar1Id]) ||
                      `Avatar ${duelo.avatar1Id}`;
                    const nome2 =
                      (duelo.avatar2Id && nomesAvatares[duelo.avatar2Id]) ||
                      `Avatar ${duelo.avatar2Id}`;
                    return (
                      <div
                        key={duelo.id ?? `${duelo.avatar1Id}-${duelo.avatar2Id}-${duelo.dataDuelo}`}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-muted">
                            <Sword className="h-6 w-6 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <p className="font-semibold">{nome1} vs {nome2}</p>
                              <p className="text-sm text-muted-foreground">{dataStr}</p>
                            </div>
                            <Badge variant={tipoResultado === 'vitoria' ? 'default' : tipoResultado === 'empate' ? 'secondary' : 'destructive'}>
                              {tipoResultado === 'vitoria' ? 'Vitória' : tipoResultado === 'empate' ? 'Empate' : 'Derrota'}
                            </Badge>
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

      {/* Modal de Resultado do Duelo */}
      <Dialog open={modalResultadoAberto} onOpenChange={setModalResultadoAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              {resultadoDuelo === 'vitoria' ? 'Vitória' : resultadoDuelo === 'empate' ? 'Empate' : 'Derrota'}
            </DialogTitle>
            <DialogDescription className="text-center">
              vs {oponenteAtual}
            </DialogDescription>
          </DialogHeader>

          {resultadoDuelo === 'vitoria' && (
            <div className="flex items-center justify-center gap-4 text-green-600 font-semibold mt-2">
              <span className="text-lg">+{recompensaMoedas} moedas</span>
              <span className="text-lg">+{recompensaXp} XP</span>
            </div>
          )}

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

