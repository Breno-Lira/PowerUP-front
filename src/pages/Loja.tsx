import { useState, useEffect } from 'react';
import { Menu, Package, User, LogOut } from 'lucide-react';
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
import { avatarService, AvatarResumo, lojaService, ItemLojaResumo, perfilService, PerfilResumo } from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  
  // Obter dados do usuário logado
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = userData?.email;
  const [perfilUsuario, setPerfilUsuario] = useState<PerfilResumo | null>(null);
  
  const [cofre, setCofre] = useState(500);
  const [inventarioAberto, setInventarioAberto] = useState(false);
  const [avatar, setAvatar] = useState<AvatarResumo | null>(null);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [itens, setItens] = useState<ItemLojaResumo[]>([]);
  const [loadingItens, setLoadingItens] = useState(false);
  const [filtros, setFiltros] = useState<CategoriaFiltro[]>([
    {
      nome: 'Qualidade',
      itens: [
        { id: 'basica', nome: 'Básica', quantidade: 0, selecionado: false },
        { id: 'esportiva', nome: 'Esportiva', quantidade: 0, selecionado: false },
        { id: 'premium', nome: 'Premium', quantidade: 0, selecionado: false },
      ],
    },
    {
      nome: 'Roupas',
      itens: [
        { id: 'regatas', nome: 'Regatas', quantidade: 0, selecionado: false },
        { id: 'camisetas', nome: 'Camisetas', quantidade: 0, selecionado: false },
        { id: 'moletons', nome: 'Moletons', quantidade: 0, selecionado: false },
        { id: 'shorts', nome: 'Shorts', quantidade: 0, selecionado: false },
        { id: 'bones', nome: 'Bonés', quantidade: 0, selecionado: false },
        { id: 'tenis', nome: 'Tênis', quantidade: 0, selecionado: false },
      ],
    },
    {
      nome: 'Acessórios',
      itens: [
        { id: 'colar', nome: 'Colar', quantidade: 0, selecionado: false },
        { id: 'straps', nome: 'Straps', quantidade: 0, selecionado: false },
      ],
    },
  ]);

  const [itensFiltrados, setItensFiltrados] = useState<ItemLojaResumo[]>([]);

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

  // Função para detectar a qualidade do item pelo nome
  const detectarQualidade = (nome: string): string | null => {
    const nomeLower = nome.toLowerCase();
    if (nomeLower.includes('básica') || nomeLower.includes('basica') || 
        nomeLower.includes('básico') || nomeLower.includes('basico')) return 'basica';
    if (nomeLower.includes('esportiva') || nomeLower.includes('esportivo')) return 'esportiva';
    if (nomeLower.includes('premium')) return 'premium';
    return null;
  };

  // Função para detectar o tipo de item pelo nome
  const detectarTipo = (nome: string): string | null => {
    const nomeLower = nome.toLowerCase();
    if (nomeLower.includes('regata')) return 'regatas';
    if (nomeLower.includes('camiseta')) return 'camisetas';
    if (nomeLower.includes('moletom') || nomeLower.includes('moletão')) return 'moletons';
    if (nomeLower.includes('short')) return 'shorts';
    if (nomeLower.includes('boné') || nomeLower.includes('bone') || nomeLower.includes('chapéu') || nomeLower.includes('chapeu')) return 'bones';
    if (nomeLower.includes('tênis') || nomeLower.includes('tenis') || nomeLower.includes('calçado') || nomeLower.includes('calcado')) return 'tenis';
    if (nomeLower.includes('colar')) return 'colar';
    if (nomeLower.includes('strap')) return 'straps';
    return null;
  };

  // Função para calcular quantidades dos filtros
  const calcularQuantidades = (itens: ItemLojaResumo[]) => {
    const contadores: { [key: string]: number } = {};

    itens.forEach((item) => {
      const qualidade = detectarQualidade(item.nome);
      const tipo = detectarTipo(item.nome);

      if (qualidade) {
        contadores[qualidade] = (contadores[qualidade] || 0) + 1;
      }
      if (tipo) {
        contadores[tipo] = (contadores[tipo] || 0) + 1;
      }
    });

    setFiltros((prev) =>
      prev.map((categoria) => ({
        ...categoria,
        itens: categoria.itens.map((item) => ({
          ...item,
          quantidade: contadores[item.id] || 0,
        })),
      }))
    );
  };

  // Função para filtrar itens baseado nos filtros selecionados
  const aplicarFiltros = (itens: ItemLojaResumo[], filtrosAtuais: CategoriaFiltro[]) => {
    const filtrosSelecionados = filtrosAtuais.flatMap((categoria) =>
      categoria.itens.filter((item) => item.selecionado).map((item) => item.id)
    );

    // Se nenhum filtro está selecionado, mostrar todos os itens
    if (filtrosSelecionados.length === 0) {
      setItensFiltrados(itens);
      return;
    }

    const itensFiltrados = itens.filter((item) => {
      const qualidade = detectarQualidade(item.nome);
      const tipo = detectarTipo(item.nome);

      // Verifica se o item corresponde a algum filtro selecionado
      return filtrosSelecionados.some((filtroId) => {
        return qualidade === filtroId || tipo === filtroId;
      });
    });

    setItensFiltrados(itensFiltrados);
  };

  const handleToggleFiltro = (categoriaIndex: number, itemId: string) => {
    setFiltros((prev) => {
      const novosFiltros = prev.map((categoria, idx) =>
        idx === categoriaIndex
          ? {
              ...categoria,
              itens: categoria.itens.map((item) =>
                item.id === itemId ? { ...item, selecionado: !item.selecionado } : item
              ),
            }
          : categoria
      );
      return novosFiltros;
    });
  };

  useEffect(() => {
    // Obter dados do usuário logado
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const perfilId = userData.perfilId;
    
    if (perfilId) {
      // Carregar perfil para obter foto
      perfilService.obterPorId(perfilId)
        .then(setPerfilUsuario)
        .catch(console.error);
      
      setLoadingAvatar(true);
      avatarService.obterPorPerfilId(perfilId)
        .then((avatarData) => {
          console.log('Avatar carregado:', avatarData);
          console.log('Acessórios do avatar:', avatarData?.acessorios);
          setAvatar(avatarData);
          setCofre(avatarData.dinheiro);
        })
        .catch((error) => {
          console.error('Erro ao carregar avatar:', error);
        })
        .finally(() => {
          setLoadingAvatar(false);
        });
    }
  }, []);

  useEffect(() => {
    // Carregar itens da loja
    setLoadingItens(true);
    console.log('Iniciando carregamento de itens da loja...');
    lojaService.listarItens()
      .then((itensData) => {
        console.log('Itens carregados com sucesso:', itensData);
        console.log('Quantidade de itens:', itensData?.length || 0);
        if (itensData && Array.isArray(itensData)) {
          setItens(itensData);
          calcularQuantidades(itensData);
          setItensFiltrados(itensData); // Inicialmente mostrar todos
        } else {
          console.warn('Dados recebidos não são um array:', itensData);
          setItens([]);
          setItensFiltrados([]);
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar itens da loja:', error);
        console.error('Status do erro:', error.response?.status);
        console.error('Detalhes do erro:', error.response?.data || error.message);
        console.error('URL da requisição:', error.config?.url);
        setItens([]); // Garantir que a lista fique vazia em caso de erro
        setItensFiltrados([]);
      })
      .finally(() => {
        setLoadingItens(false);
        console.log('Carregamento de itens finalizado');
      });
  }, []);

  // Aplicar filtros quando os filtros ou itens mudarem
  useEffect(() => {
    if (itens.length > 0) {
      aplicarFiltros(itens, filtros);
    }
  }, [filtros, itens]);

  const handleInventario = () => {
    setInventarioAberto(true);
  };

  const handleComprar = async (item: ItemLojaResumo) => {
    if (!avatar) {
      alert('Avatar não encontrado. Por favor, faça login novamente.');
      return;
    }

    // Verificar se já possui o item
    const jaPossui = avatar.acessorios?.some(a => a.id === item.id);
    if (jaPossui) {
      alert('Você já possui este acessório!');
      return;
    }

    // Verificar se tem dinheiro suficiente
    if (cofre < item.preco) {
      alert(`Dinheiro insuficiente! Você precisa de ${item.preco} $, mas possui apenas ${cofre} $.`);
      return;
    }

    if (!confirm(`Deseja comprar "${item.nome}" por ${item.preco} $?`)) {
      return;
    }

    try {
      await lojaService.comprarItem(avatar.id, item.id);
      
      // Recarregar avatar para atualizar dinheiro e inventário
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const perfilId = userData.perfilId;
      if (perfilId) {
        const avatarData = await avatarService.obterPorPerfilId(perfilId);
        setAvatar(avatarData);
        setCofre(avatarData.dinheiro);
        
        // Recarregar itens da loja para atualizar status (mostrar "Possuído")
        const itensData = await lojaService.listarItens();
        setItens(itensData);
      }
      
      alert(`✅ ${item.nome} comprado com sucesso!`);
    } catch (error: any) {
      const mensagem = error.response?.data?.message || error.message || 'Erro ao comprar item';
      console.error('Erro ao comprar:', error);
      alert(`❌ ${mensagem}`);
    }
  };

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
            <SheetContent side="left" className="w-[280px] sm:w-[320px] flex flex-col h-full">
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

              <nav className="space-y-2 flex-1 overflow-auto">
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

      {/* Sheet de Inventário */}
      <Sheet open={inventarioAberto} onOpenChange={setInventarioAberto}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Inventário</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {loadingAvatar ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : avatar && avatar.acessorios && avatar.acessorios.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {avatar.acessorios.map((acessorio) => {
                  console.log('Renderizando acessório no inventário:', acessorio);
                  return (
                    <Card key={acessorio.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden relative">
                          {acessorio.imagem && acessorio.imagem.trim() !== '' && !acessorio.imagem.includes('placeholder') ? (
                            <img 
                              src={acessorio.imagem} 
                              alt={acessorio.nome || 'Acessório'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Erro ao carregar imagem do acessório:', acessorio.imagem);
                                e.currentTarget.style.display = 'none';
                                const iconContainer = e.currentTarget.parentElement?.querySelector('.icon-fallback');
                                if (iconContainer) {
                                  iconContainer.classList.remove('hidden');
                                }
                              }}
                            />
                          ) : null}
                          <div className={`flex items-center justify-center absolute inset-0 ${acessorio.imagem && acessorio.imagem.trim() !== '' && !acessorio.imagem.includes('placeholder') ? 'hidden icon-fallback' : ''}`}>
                            {acessorio.icone && acessorio.icone.trim() !== '' ? (
                              <span className="text-6xl">{acessorio.icone}</span>
                            ) : (
                              <Package className="h-16 w-16 text-muted-foreground/50" />
                            )}
                          </div>
                        </div>
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
                          {acessorio.nome || 'Acessório sem nome'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Preço: <span className="font-bold text-primary">{acessorio.preco || 0} $</span>
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Seu inventário está vazio</p>
                <p className="text-sm mt-2">Compre itens na loja para começar!</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

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
                              {item.nome}
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-center mb-2">Itens</h2>
              {itens && itens.length > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  {itens.length} {itens.length === 1 ? 'item disponível' : 'itens disponíveis'}
                </p>
              )}
            </div>

            {/* Grid de Itens */}
            {loadingItens ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="ml-4 text-muted-foreground">Carregando itens...</p>
              </div>
            ) : itensFiltrados && itensFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {itensFiltrados.map((item) => {
                  const podeComprar = avatar && cofre >= item.preco;
                  const jaPossui = avatar?.acessorios?.some(a => a.id === item.id);
                  
                  return (
                    <Card 
                      key={item.id} 
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary"
                    >
                      <CardContent className="p-0">
                        {/* Área da Imagem/Ícone */}
                        <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
                          {item.imagem && item.imagem.trim() !== '' && !item.imagem.includes('placeholder') && !item.imagem.includes('placehc') ? (
                            <img 
                              src={item.imagem} 
                              alt={item.nome}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Se a imagem falhar, esconder e mostrar o ícone
                                const imgElement = e.currentTarget;
                                imgElement.style.display = 'none';
                                const iconContainer = imgElement.parentElement?.querySelector('.icon-fallback');
                                if (iconContainer) {
                                  iconContainer.classList.remove('hidden');
                                }
                              }}
                            />
                          ) : null}
                          <div className={`flex items-center justify-center ${item.imagem && item.imagem.trim() !== '' && !item.imagem.includes('placeholder') && !item.imagem.includes('placehc') ? 'hidden icon-fallback' : ''}`}>
                            {item.icone && item.icone.trim() !== '' ? (
                              <span className="text-7xl">{item.icone}</span>
                            ) : (
                              <Package className="h-20 w-20 text-muted-foreground/50" />
                            )}
                          </div>
                          {jaPossui && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
                              Possuído
                            </div>
                          )}
                        </div>
                        
                        {/* Informações do Item */}
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[3rem]">{item.nome}</h3>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Preço</span>
                              <span className="text-xl font-bold text-primary">{item.preco} $</span>
                            </div>
                            
                            <Button 
                              size="default"
                              onClick={() => handleComprar(item)}
                              disabled={!avatar || !podeComprar || jaPossui}
                              className="min-w-[100px]"
                              variant={jaPossui ? "secondary" : "default"}
                            >
                              {jaPossui ? 'Possuído' : !avatar ? 'Sem Avatar' : !podeComprar ? 'Sem Dinheiro' : 'Comprar'}
                            </Button>
                          </div>
                          
                          {!podeComprar && avatar && !jaPossui && (
                            <p className="text-xs text-destructive mt-2 text-center">
                              Faltam {item.preco - cofre} $ para comprar
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum item encontrado</p>
                <p className="text-sm mt-2">
                  {itens.length > 0 
                    ? 'Tente ajustar os filtros para ver mais itens' 
                    : 'Não há itens disponíveis na loja'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

