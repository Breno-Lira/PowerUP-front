import { useState } from 'react';
import { Menu, Plus, Pencil, Trash2, Play, Check, Camera, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
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
import { Checkbox } from '@/components/ui/checkbox';

interface Exercicio {
  id: number;
  nome: string;
  series: number;
  repeticoes: number;
  concluido: boolean;
}

interface PlanoTreino {
  id: number;
  nome: string;
  exercicios: Exercicio[];
}

export function Treinos() {
  const navigate = useNavigate();
  const [abaPrincipal, setAbaPrincipal] = useState('treino');
  const [abaPlanos, setAbaPlanos] = useState('ativo');
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalNovoPlanoAberto, setModalNovoPlanoAberto] = useState(false);
  const [planoEditando, setPlanoEditando] = useState<PlanoTreino | null>(null);
  const [nomeNovoPlano, setNomeNovoPlano] = useState('');
  const [novoExercicio, setNovoExercicio] = useState({
    nome: '',
    peso: '',
    repeticoes: '',
  });
  const [periodoGrafico, setPeriodoGrafico] = useState<'5dias' | 'mensal' | 'anual'>('5dias');
  const [metaSemanal, setMetaSemanal] = useState(5);
  const [mostrarCheckin, setMostrarCheckin] = useState(true);
  const [planosAtivos, setPlanosAtivos] = useState<PlanoTreino[]>([
    {
      id: 1,
      nome: 'Peito e tríceps',
      exercicios: [
        { id: 1, nome: 'Supino reto', series: 4, repeticoes: 12, concluido: false },
        { id: 2, nome: 'Supino inclinado', series: 3, repeticoes: 10, concluido: false },
        { id: 3, nome: 'Crucifixo', series: 3, repeticoes: 12, concluido: false },
        { id: 4, nome: 'Tríceps testa', series: 3, repeticoes: 12, concluido: false },
      ],
    },
  ]);

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

  const handleToggleExercicio = (planoId: number, exercicioId: number) => {
    setPlanosAtivos((prev) =>
      prev.map((plano) =>
        plano.id === planoId
          ? {
              ...plano,
              exercicios: plano.exercicios.map((ex) =>
                ex.id === exercicioId ? { ...ex, concluido: !ex.concluido } : ex
              ),
            }
          : plano
      )
    );
  };

  const handleEditar = (planoId: number) => {
    const plano = planosAtivos.find((p) => p.id === planoId);
    if (plano) {
      setPlanoEditando(plano);
      setModalEditarAberto(true);
    }
  };

  const handleAdicionarExercicio = () => {
    if (!planoEditando || !novoExercicio.nome || !novoExercicio.repeticoes) {
      return;
    }

    const repeticoes = parseInt(novoExercicio.repeticoes);
    if (isNaN(repeticoes)) {
      return;
    }

    const novoExercicioObj: Exercicio = {
      id: Date.now(),
      nome: novoExercicio.nome,
      series: 3, // Default, pode ser ajustado
      repeticoes: repeticoes,
      concluido: false,
    };

    setPlanosAtivos((prev) =>
      prev.map((plano) =>
        plano.id === planoEditando.id
          ? {
              ...plano,
              exercicios: [...plano.exercicios, novoExercicioObj],
            }
          : plano
      )
    );

    // Reset form
    setNovoExercicio({ nome: '', peso: '', repeticoes: '' });
  };

  const handleFecharModal = () => {
    setModalEditarAberto(false);
    setPlanoEditando(null);
    setNovoExercicio({ nome: '', peso: '', repeticoes: '' });
  };

  const handleCriarNovoPlano = () => {
    if (!nomeNovoPlano.trim()) {
      return;
    }

    const novoPlano: PlanoTreino = {
      id: Date.now(),
      nome: nomeNovoPlano,
      exercicios: [],
    };

    setPlanosAtivos((prev) => [...prev, novoPlano]);
    setNomeNovoPlano('');
    setModalNovoPlanoAberto(false);
  };

  const handleFecharModalNovoPlano = () => {
    setModalNovoPlanoAberto(false);
    setNomeNovoPlano('');
  };

  const handleDeletar = (planoId: number) => {
    // TODO: Implementar deleção
    console.log('Deletar plano:', planoId);
  };

  const handleDeletarExercicio = (planoId: number, exercicioId: number) => {
    setPlanosAtivos((prev) =>
      prev.map((plano) =>
        plano.id === planoId
          ? {
              ...plano,
              exercicios: plano.exercicios.filter((ex) => ex.id !== exercicioId),
            }
          : plano
      )
    );
  };

  const handleIniciar = (planoId: number) => {
    // TODO: Implementar início do treino
    console.log('Iniciar treino:', planoId);
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

          {/* Navegação Principal */}
          <Tabs value={abaPrincipal} onValueChange={setAbaPrincipal} className="flex-1">
            <TabsList className="bg-transparent h-auto p-0">
              <TabsTrigger
                value="treino"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-4 py-2"
              >
                Treino
              </TabsTrigger>
              <TabsTrigger
                value="progresso"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-4 py-2"
              >
                Progresso
              </TabsTrigger>
              <TabsTrigger
                value="frequencia"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-4 py-2"
              >
                Frequência
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={abaPrincipal} onValueChange={setAbaPrincipal}>
          <TabsContent value="treino" className="mt-6">
            {/* Seção de Planos de Treino */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Meus planos de treino</h2>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => setModalNovoPlanoAberto(true)}
                >
                  <Plus className="h-4 w-4" />
                  Novo Plano
                </Button>
              </div>

              {/* Tabs Ativo/Histórico */}
              <Tabs value={abaPlanos} onValueChange={setAbaPlanos} className="mb-4">
                <TabsList className="h-9">
                  <TabsTrigger value="ativo" className="text-sm">
                    Ativo
                  </TabsTrigger>
                  <TabsTrigger value="historico" className="text-sm">
                    Histórico
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ativo" className="mt-4">
                  <div className="space-y-4">
                    {planosAtivos.map((plano) => (
                      <Card key={plano.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">{plano.nome}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditar(plano.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeletar(plano.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleIniciar(plano.id)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {plano.exercicios.map((exercicio) => (
                              <div
                                key={exercicio.id}
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
                              >
                                <Checkbox
                                  id={`ex-${plano.id}-${exercicio.id}`}
                                  checked={exercicio.concluido}
                                  onCheckedChange={() =>
                                    handleToggleExercicio(plano.id, exercicio.id)
                                  }
                                />
                                <label
                                  htmlFor={`ex-${plano.id}-${exercicio.id}`}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={
                                        exercicio.concluido
                                          ? 'line-through text-muted-foreground'
                                          : 'font-medium'
                                      }
                                    >
                                      {exercicio.nome}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {exercicio.series}x{exercicio.repeticoes}
                                    </span>
                                  </div>
                                </label>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => handleDeletarExercicio(plano.id, exercicio.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="historico" className="mt-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum plano histórico encontrado</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="progresso" className="mt-6">
            <div className="space-y-6">
              {/* Header Evolução */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Evolução</h2>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Registrar
                </Button>
              </div>

              {/* Gráfico de Progresso */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Peito - supino reto</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={periodoGrafico === '5dias' ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setPeriodoGrafico('5dias')}
                      >
                        5 dias
                      </Button>
                      <Button
                        variant={periodoGrafico === 'mensal' ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setPeriodoGrafico('mensal')}
                      >
                        Mensal
                      </Button>
                      <Button
                        variant={periodoGrafico === 'anual' ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setPeriodoGrafico('anual')}
                      >
                        Anual
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Gráfico de Linha Simples */}
                  <div className="relative h-64 w-full">
                    {/* Eixos e Grid */}
                    <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                      {/* Grid horizontal */}
                      {[0, 20, 40, 60, 80].map((value, index) => {
                        const y = 200 - (value / 80) * 200;
                        return (
                          <g key={`grid-${value}`}>
                            <line
                              x1="40"
                              y1={y}
                              x2="400"
                              y2={y}
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                              className="text-muted-foreground opacity-30"
                            />
                            <text
                              x="35"
                              y={y + 4}
                              textAnchor="end"
                              className="text-xs fill-muted-foreground"
                            >
                              {value}
                            </text>
                          </g>
                        );
                      })}

                      {/* Dados do gráfico (5 dias) */}
                      {periodoGrafico === '5dias' && (() => {
                        // Valores: 68, 68, 72, 78, 78 (convertendo para coordenadas Y)
                        // Y máximo = 80, altura do gráfico = 200
                        const valores = [68, 68, 72, 78, 78];
                        const datas = ['30/08', '02/09', '04/09', '06/09', '08/09'];
                        const pontos = valores.map((valor, index) => {
                          const x = 60 + (index * 90);
                          const y = 200 - (valor / 80) * 200;
                          return { x, y, valor, date: datas[index] };
                        });
                        const pontosString = pontos.map(p => `${p.x},${p.y}`).join(' ');

                        return (
                          <>
                            {/* Linha do gráfico */}
                            <polyline
                              points={pontosString}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-primary"
                            />
                            {/* Pontos do gráfico */}
                            {pontos.map((point, index) => (
                              <g key={`point-${index}`}>
                                <circle
                                  cx={point.x}
                                  cy={point.y}
                                  r="4"
                                  fill="currentColor"
                                  className="text-primary"
                                />
                                <text
                                  x={point.x}
                                  y={195}
                                  textAnchor="middle"
                                  className="text-xs fill-muted-foreground"
                                >
                                  {point.date}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}

                      {/* Placeholder para outros períodos */}
                      {periodoGrafico !== '5dias' && (
                        <text
                          x="200"
                          y="100"
                          textAnchor="middle"
                          className="text-sm fill-muted-foreground"
                        >
                          Dados para {periodoGrafico === 'mensal' ? 'período mensal' : 'período anual'} em breve
                        </text>
                      )}
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="frequencia" className="mt-6">
            <div className="space-y-6">
              {/* Card Sequência Ativa */}
              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Sequência Ativa</p>
                    <p className="text-2xl font-bold">6 dias consecutivos</p>
                  </div>
                </CardContent>
              </Card>

              {/* Cards Esta Semana e Meta Semanal */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Esta Semana</p>
                      <p className="text-2xl font-bold">6/7 treinos</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Meta Semanal</p>
                        <p className="text-2xl font-bold">{metaSemanal} treinos</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Implementar edição de meta
                          const novaMeta = prompt('Nova meta semanal:', metaSemanal.toString());
                          if (novaMeta && !isNaN(parseInt(novaMeta))) {
                            setMetaSemanal(parseInt(novaMeta));
                          }
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card Check-in Diário */}
              {mostrarCheckin && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Fazer check-in diário</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setMostrarCheckin(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Tirar foto
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Grid de Dias da Semana */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-7 gap-2">
                    {[
                      { dia: 'D', data: 5, completo: true },
                      { dia: 'S', data: 6, completo: true },
                      { dia: 'T', data: 7, completo: true },
                      { dia: 'Q', data: 8, completo: true },
                      { dia: 'Q', data: 9, completo: true },
                      { dia: 'S', data: 10, completo: false },
                      { dia: 'S', data: 11, completo: false },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center ${
                          item.completo
                            ? 'bg-green-500 border-green-700 text-white'
                            : 'bg-gray-200 border-gray-400 text-gray-600'
                        }`}
                      >
                        <span className="text-xs font-medium">{item.dia}</span>
                        <span className="text-sm font-bold">{item.data}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mensagem Motivacional */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <p className="text-center text-sm">
                    Continue Assim! Você está mantendo uma sequência incrível. Não quebre agora!
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Criar Novo Plano */}
      <Dialog open={modalNovoPlanoAberto} onOpenChange={handleFecharModalNovoPlano}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar plano de treino</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="nome-plano">Nome:</Label>
              <Input
                id="nome-plano"
                placeholder="Nome do plano de treino"
                value={nomeNovoPlano}
                onChange={(e) => setNomeNovoPlano(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCriarNovoPlano();
                  }
                }}
              />
            </div>

            <Button onClick={handleCriarNovoPlano} className="w-full">
              Criar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Plano de Treino */}
      <Dialog open={modalEditarAberto} onOpenChange={handleFecharModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar plano de treino</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="exercicio">Exercicio:</Label>
              <Input
                id="exercicio"
                placeholder="Nome do exercício"
                value={novoExercicio.nome}
                onChange={(e) =>
                  setNovoExercicio({ ...novoExercicio, nome: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso">Peso:</Label>
              <Input
                id="peso"
                type="number"
                placeholder="Peso em kg"
                value={novoExercicio.peso}
                onChange={(e) =>
                  setNovoExercicio({ ...novoExercicio, peso: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repeticoes">Repeticoes:</Label>
              <Input
                id="repeticoes"
                type="number"
                placeholder="Número de repetições"
                value={novoExercicio.repeticoes}
                onChange={(e) =>
                  setNovoExercicio({ ...novoExercicio, repeticoes: e.target.value })
                }
              />
            </div>

            <Button onClick={handleAdicionarExercicio} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              add +
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

