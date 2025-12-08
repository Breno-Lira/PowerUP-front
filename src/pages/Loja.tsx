import { useState } from 'react';
import { Menu, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface FiltroItem {
  id: string;
  nome: string;
  quantidade: number;
  selecionado: boolean;
}

interface CategoriaFiltro {
  nome: string;
  itens: FiltroItem[];
}

export function Loja() {
  const navigate = useNavigate();
  const [cofre, setCofre] = useState(500);
  const [filtros, setFiltros] = useState<CategoriaFiltro[]>([
    {
      nome: 'Roupas',
      itens: [
        { id: 'regatas', nome: 'Regatas', quantidade: 2, selecionado: true },
        { id: 'camisetas', nome: 'camisetas', quantidade: 3, selecionado: false },
        { id: 'moletom', nome: 'moletom', quantidade: 3, selecionado: true },
        { id: 'shorts', nome: 'shorts', quantidade: 5, selecionado: false },
      ],
    },
    {
      nome: 'Acessórios',
      itens: [
        { id: 'chapeus', nome: 'chapéus', quantidade: 2, selecionado: true },
        { id: 'calcados', nome: 'calcados', quantidade: 3, selecionado: false },
        { id: 'colar', nome: 'colar', quantidade: 4, selecionado: false },
        { id: 'straps', nome: 'straps', quantidade: 2, selecionado: false },
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

  const handleToggleFiltro = (categoriaIndex: number, itemId: string) => {
    setFiltros((prev) =>
      prev.map((categoria, idx) =>
        idx === categoriaIndex
          ? {
              ...categoria,
              itens: categoria.itens.map((item) =>
                item.id === itemId ? { ...item, selecionado: !item.selecionado } : item
              ),
            }
          : categoria
      )
    );
  };

  const handleInventario = () => {
    // TODO: Implementar tela de inventário
    console.log('Abrir inventário');
  };

  // Placeholder items para o grid
  const itens = Array.from({ length: 6 }, (_, i) => ({ id: i + 1 }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header com Menu */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
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

          {/* Título Loja no centro */}
          <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
            Loja
          </h1>

          {/* Botão Inventário e Cofre */}
          <div className="flex flex-col items-end gap-1">
            <Button variant="outline" size="sm" onClick={handleInventario}>
              inventario
            </Button>
            <p className="text-sm font-medium">Cofre : {cofre} $</p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar de Filtros */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Filtros</h2>
                <div className="space-y-6">
                  {filtros.map((categoria, categoriaIndex) => (
                    <div key={categoria.nome}>
                      <h3 className="font-medium mb-3">{categoria.nome}</h3>
                      <div className="space-y-2">
                        {categoria.itens.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              id={`${categoria.nome}-${item.id}`}
                              checked={item.selecionado}
                              onCheckedChange={() =>
                                handleToggleFiltro(categoriaIndex, item.id)
                              }
                            />
                            <label
                              htmlFor={`${categoria.nome}-${item.id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {item.quantidade} {item.nome}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área Principal de Itens */}
          <div className="flex-1">
            {/* Banner Itens */}
            <Card className="mb-6">
              <CardContent className="pt-6 pb-6">
                <h2 className="text-2xl font-bold text-center">Itens</h2>
              </CardContent>
            </Card>

            {/* Grid de Itens */}
            <div className="grid grid-cols-3 gap-4">
              {itens.map((item) => (
                <Card key={item.id} className="aspect-square">
                  <CardContent className="h-full flex items-center justify-center p-6">
                    <div className="text-6xl font-bold text-muted-foreground/30">
                      X
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

