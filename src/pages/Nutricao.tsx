import { useState } from 'react';
import { Menu, Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Alimento {
  id: number;
  nome: string;
  quantidade: string;
  calorias: number;
}

interface Refeicao {
  id: number;
  nome: string;
  horario: string;
  totalCalorias: number;
  alimentos: Alimento[];
}

interface NutricaoData {
  objetivo: 'cutting' | 'bulking';
  metaCalorias: number;
  caloriasConsumidas: number;
  caloriasRestantes: number;
  percentual: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  refeicoes: Refeicao[];
}

export function Nutricao() {
  const navigate = useNavigate();
  const [nutricao, setNutricao] = useState<NutricaoData>({
    objetivo: 'bulking',
    metaCalorias: 2500,
    caloriasConsumidas: 1850,
    caloriasRestantes: 650,
    percentual: 74,
    proteinas: 180,
    carboidratos: 250,
    gorduras: 70,
    refeicoes: [
      {
        id: 1,
        nome: 'Café da manhã',
        horario: '08:00',
        totalCalorias: 450,
        alimentos: [
          { id: 1, nome: 'Ovos', quantidade: '3 unidades', calorias: 180 },
          { id: 2, nome: 'Pão integral', quantidade: '2 fatias', calorias: 150 },
          { id: 3, nome: 'Whey protein', quantidade: '1 scoop', calorias: 120 },
        ],
      },
      {
        id: 2,
        nome: 'Almoço',
        horario: '12:00',
        totalCalorias: 1002,
        alimentos: [
          { id: 4, nome: 'Frango grelhado', quantidade: '200g', calorias: 478 },
          { id: 5, nome: 'Ovo cozido', quantidade: '3 unidades', calorias: 203 },
          { id: 6, nome: 'Suco de uva', quantidade: '500ml', calorias: 321 },
        ],
      },
    ],
  });

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

  const handleObjetivoChange = (objetivo: 'cutting' | 'bulking') => {
    const metaCalorias = objetivo === 'cutting' ? 2000 : 2500;
    setNutricao((prev) => ({
      ...prev,
      objetivo,
      metaCalorias,
      caloriasRestantes: metaCalorias - prev.caloriasConsumidas,
      percentual: Math.round((prev.caloriasConsumidas / metaCalorias) * 100),
    }));
  };

  const handleEditarPlano = () => {
    // TODO: Implementar edição do plano
    console.log('Editar plano de nutrição');
  };

  const handleDeletarPlano = () => {
    // TODO: Implementar deleção do plano
    console.log('Deletar plano de nutrição');
  };

  const handleAdicionarRefeicao = () => {
    // TODO: Implementar adição de refeição
    console.log('Adicionar refeição');
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
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header da Página */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Nutrição</h1>
          <p className="text-muted-foreground">Planeja suas refeições</p>
        </div>

        {/* Seleção de Objetivo */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            className={`cursor-pointer transition-all ${
              nutricao.objetivo === 'cutting'
                ? 'ring-2 ring-primary'
                : 'hover:bg-accent/50'
            }`}
            onClick={() => handleObjetivoChange('cutting')}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="font-semibold mb-1">Cutting</p>
                <p className="text-2xl font-bold">2000 cal</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              nutricao.objetivo === 'bulking'
                ? 'ring-2 ring-primary'
                : 'hover:bg-accent/50'
            }`}
            onClick={() => handleObjetivoChange('bulking')}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="font-semibold mb-1">Bulking</p>
                <p className="text-2xl font-bold">2500 cal</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Diário */}
        <Card>
          <CardHeader>
            <CardTitle>Hoje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {nutricao.caloriasConsumidas} / {nutricao.metaCalorias} cal
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Restantes</p>
                <p className="text-lg font-semibold">{nutricao.caloriasRestantes} cal</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{nutricao.percentual}%</span>
              </div>
              <Progress value={nutricao.percentual} />
            </div>
          </CardContent>
        </Card>

        {/* Macronutrientes */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Proteína</p>
                <p className="text-2xl font-bold">{nutricao.proteinas}g</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Carbo</p>
                <p className="text-2xl font-bold">{nutricao.carboidratos}g</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Gordura</p>
                <p className="text-2xl font-bold">{nutricao.gorduras}g</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão Adicionar Refeição */}
        <Button className="w-full" size="lg" onClick={handleAdicionarRefeicao}>
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Refeição
        </Button>

        {/* Plano de Hoje */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Plano de hoje</CardTitle>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{nutricao.refeicoes.reduce((acc, r) => acc + r.totalCalorias, 0)} cal</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDeletarPlano}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleEditarPlano}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {nutricao.refeicoes.map((refeicao) => (
              <div key={refeicao.id} className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h3 className="font-semibold">{refeicao.nome}</h3>
                    <p className="text-sm text-muted-foreground">{refeicao.horario}</p>
                  </div>
                  <p className="font-semibold">{refeicao.totalCalorias} cal</p>
                </div>
                <div className="space-y-2 pl-4">
                  {refeicao.alimentos.map((alimento) => (
                    <div
                      key={alimento.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{alimento.nome}</span>
                        <span className="text-muted-foreground">
                          {alimento.quantidade}
                        </span>
                      </div>
                      <span className="text-muted-foreground">{alimento.calorias} cal</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

