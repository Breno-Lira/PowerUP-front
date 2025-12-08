import { useState } from 'react';
import { Menu, Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Feedback {
  id: number;
  tipoTreino: string;
  data: string;
  sensacao: 'excelente' | 'cansado' | 'com-dor' | 'bom' | 'ruim';
  descricao: string;
}

export function Feedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: 1,
      tipoTreino: 'Peito e Tríceps',
      data: '08 de Outubro de 2025',
      sensacao: 'excelente',
      descricao:
        'Treino muito pegado hoje! Aumentei minha carga no supino com halteres e tríceps testa! Alcancei a essência',
    },
    {
      id: 2,
      tipoTreino: 'Perna',
      data: '10 de Outubro de 2025',
      sensacao: 'cansado',
      descricao:
        'Treino foi bom mas saí muito cansado da academia, provavelmente foi porque eu não treinava há duas semanas',
    },
    {
      id: 3,
      tipoTreino: 'Ombro',
      data: '11 de Outubro de 2025',
      sensacao: 'com-dor',
      descricao:
        'Treino hoje foi estranho, senti uma dor fina no ombro direito acho que tenho aquecer mais o manguito',
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

  const getSensacaoLabel = (sensacao: Feedback['sensacao']) => {
    const labels: Record<Feedback['sensacao'], string> = {
      excelente: 'Excelente',
      cansado: 'Cansado',
      'com-dor': 'Com dor',
      bom: 'Bom',
      ruim: 'Ruim',
    };
    return labels[sensacao];
  };

  const getSensacaoVariant = (sensacao: Feedback['sensacao']) => {
    const variants: Record<Feedback['sensacao'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
      excelente: 'default',
      cansado: 'secondary',
      'com-dor': 'destructive',
      bom: 'default',
      ruim: 'destructive',
    };
    return variants[sensacao];
  };

  const handleNovoFeedback = () => {
    // TODO: Implementar criação de novo feedback
    console.log('Novo feedback');
  };

  const handleEditar = (id: number) => {
    // TODO: Implementar edição
    console.log('Editar feedback:', id);
  };

  const handleDeletar = (id: number) => {
    // TODO: Implementar deleção
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    console.log('Deletar feedback:', id);
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
          <h1 className="text-3xl font-bold mb-2">Feedback de treino</h1>
          <p className="text-muted-foreground">Registre sua sensação pós-treino!</p>
        </div>

        {/* Botão Novo Feedback */}
        <Button className="w-full" size="lg" onClick={handleNovoFeedback}>
          <Plus className="h-5 w-5 mr-2" />
          Novo Feedback
        </Button>

        {/* Histórico de Feedbacks */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Histórico de Feedbacks</h2>
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <Card key={feedback.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{feedback.tipoTreino}</CardTitle>
                        <Badge variant={getSensacaoVariant(feedback.sensacao)}>
                          {getSensacaoLabel(feedback.sensacao)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{feedback.data}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeletar(feedback.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditar(feedback.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{feedback.descricao}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

