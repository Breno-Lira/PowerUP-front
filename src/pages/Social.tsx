import { useState } from 'react';
import { Menu, TrendingUp, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Grupo {
  id: number;
  nome: string;
  posicao: number;
}

export function Social() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState<'amizades' | 'rival'>('amizades');
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const codigoAmizade = 'yyy - 1111';

  const grupos: Grupo[] = [
    { id: 1, nome: 'Projetinho Fellas', posicao: 3 },
    { id: 2, nome: 'Gladiadores do Ferro', posicao: 5 },
    { id: 3, nome: 'Estoicos, os Robustos', posicao: 6 },
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

  const handleCopiarCodigo = () => {
    navigator.clipboard.writeText(codigoAmizade);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header da Página */}
          <h1 className="text-3xl font-bold">Social</h1>

          {/* Botões de Navegação */}
          <div className="flex gap-3">
            <Button
              variant={abaAtiva === 'amizades' ? 'default' : 'outline'}
              onClick={() => setAbaAtiva('amizades')}
              className="flex-1"
            >
              Amizades
            </Button>
            <Button
              variant={abaAtiva === 'rival' ? 'default' : 'outline'}
              onClick={() => setAbaAtiva('rival')}
              className="flex-1"
            >
              Rival
            </Button>
            <Button variant="default" className="flex-1">
              Criar grupo +
            </Button>
          </div>

          {/* Seção Desempenho */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Desempenho</p>
                  <p className="text-sm text-muted-foreground">
                    sequencia semanal : 5/7
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção Meus Grupos */}
          <Card>
            <CardHeader>
              <CardTitle>Meus Grupos</CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="space-y-3">
                    {grupos.map((grupo) => (
                      <button
                        key={grupo.id}
                        onClick={() => navigate(`/grupo/${grupo.id}`)}
                        className="w-full flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
                      >
                        <span className="font-medium">{grupo.nome}</span>
                        <span className="text-sm text-muted-foreground">#{grupo.posicao}</span>
                      </button>
                    ))}
                  </div>
            </CardContent>
          </Card>

          {/* Seção Código de Amizade */}
          <Card>
            <CardHeader>
              <CardTitle>Seu codigo de amizade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  value={codigoAmizade}
                  readOnly
                  className="flex-1 font-mono"
                />
                <Button
                  onClick={handleCopiarCodigo}
                  variant={codigoCopiado ? 'default' : 'outline'}
                  className="gap-2"
                >
                  {codigoCopiado ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

