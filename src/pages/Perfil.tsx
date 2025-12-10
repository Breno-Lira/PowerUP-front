import { useEffect, useState } from 'react';
import { Menu, Settings, Dumbbell, TrendingUp, Sword, Flame, Activity, User, Loader2, X, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { perfilService, PerfilResumo, avatarService, AvatarResumo, AtributosCalculados, frequenciaService, conquistaService, ConquistaResumo } from '@/services/api';
import { Checkbox } from '@/components/ui/checkbox';

// Função para determinar o ícone baseado no nome da conquista
const getIconePorNome = (nome: string): string => {
  const nomeLower = nome.toLowerCase();
  if (nomeLower.includes('gladiador') || nomeLower.includes('força') || nomeLower.includes('bruta')) {
    return 'sword';
  }
  if (nomeLower.includes('fogo') || nomeLower.includes('sequência')) {
    return 'flame';
  }
  if (nomeLower.includes('iniciante') || nomeLower.includes('maluco') || nomeLower.includes('resistência')) {
    return 'flex';
  }
  if (nomeLower.includes('velocidade')) {
    return 'trending';
  }
  return 'activity'; // padrão
};

interface PerfilData {
  id: number;
  username: string;
  nivel: number;
  titulo: string;
  totalTreinos: number;
  xpTotal: number;
  atributos: {
    forca: number;
    resistencia: number;
    velocidade: number;
    agilidade: number;
    flexibilidade: number;
  };
  conquistasSelecionadas: number[];
}

export function Perfil() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [perfilResumo, setPerfilResumo] = useState<PerfilResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'estatisticas' | 'avatar'>('estatisticas');
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [editandoUsername, setEditandoUsername] = useState('');
  const [editandoFoto, setEditandoFoto] = useState<string | null>(null);
  const [editandoConquistas, setEditandoConquistas] = useState<number[]>([]);
  const [conquistasDisponiveis, setConquistasDisponiveis] = useState<ConquistaResumo[]>([]);
  const [conquistasRecent, setConquistasRecent] = useState<ConquistaResumo[]>([]);
  const [carregandoConquistas, setCarregandoConquistas] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroEditar, setErroEditar] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  
  // Obter dados do usuário logado
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = userData.email;
  const userPerfilId = userData.perfilId;

  useEffect(() => {
    carregarPerfil();
    carregarConquistas();
  }, []);

  const carregarConquistas = async () => {
    if (!userPerfilId) return;
    
    setCarregandoConquistas(true);
    try {
      // Buscar apenas as conquistas que o usuário conquistou
      const conquistas = await conquistaService.listarPorPerfil(userPerfilId);
      setConquistasDisponiveis(conquistas);
      // As últimas 5 conquistas como "recentes"
      setConquistasRecent(conquistas.slice(-5).reverse());
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
      setConquistasDisponiveis([]);
      setConquistasRecent([]);
    } finally {
      setCarregandoConquistas(false);
    }
  };

  const carregarPerfil = async () => {
    if (!userPerfilId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Carregar dados do perfil
      const perfilData = await perfilService.obterPorId(userPerfilId);
      setPerfilResumo(perfilData);
      
      // Carregar avatar e atributos
      let avatar: AvatarResumo | null = null;
      let atributos: AtributosCalculados | null = null;
      try {
        avatar = await avatarService.obterPorPerfilId(userPerfilId);
        if (avatar) {
          atributos = await avatarService.obterAtributos(avatar.id);
        }
      } catch (error) {
        console.error('Erro ao carregar avatar:', error);
      }

      // Contar total de frequências (idas à academia)
      let totalTreinos = 0;
      try {
        const frequencias = await frequenciaService.listarPorPerfil(userPerfilId);
        totalTreinos = frequencias.length;
      } catch (error) {
        console.error('Erro ao carregar frequências:', error);
      }

      // Montar dados do perfil com informações reais
      const dadosPerfil: PerfilData = {
        id: perfilData.id,
        username: perfilData.username,
        nivel: avatar?.nivel || 1,
        titulo: 'Lobo', // TODO: Implementar sistema de títulos
        totalTreinos: totalTreinos,
        xpTotal: avatar?.experiencia || 0,
        atributos: {
          forca: atributos?.forca || avatar?.forca || 0,
          resistencia: atributos?.resistencia || 0,
          velocidade: avatar?.nivel ? Math.round(avatar.nivel * 2) : 0, // Calculado baseado no nível
          agilidade: atributos?.agilidade || 0,
          flexibilidade: avatar?.nivel ? Math.round(avatar.nivel * 1.5) : 0, // Calculado baseado no nível
        },
        conquistasSelecionadas: perfilData.conquistasSelecionadas 
          ? perfilData.conquistasSelecionadas.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
          : [],
      };
      setPerfil(dadosPerfil);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModalEditar = () => {
    if (perfilResumo) {
      setEditandoUsername(perfilResumo.username);
      setEditandoFoto(perfilResumo.foto);
      // Carregar conquistas selecionadas
      const conquistasIds = perfilResumo.conquistasSelecionadas 
        ? perfilResumo.conquistasSelecionadas.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        : [];
      setEditandoConquistas(conquistasIds);
      setErroEditar(null);
      setMensagemSucesso(null);
      setModalEditarAberto(true);
    }
  };

  const handleSalvarEdicao = async () => {
    if (!userPerfilId || !perfilResumo) return;

    if (!editandoUsername.trim()) {
      setErroEditar('O nome de usuário é obrigatório');
      return;
    }

    setSalvando(true);
    setErroEditar(null);

    try {
      // Converter array de IDs para string separada por vírgula
      const conquistasSelecionadasStr = editandoConquistas.length > 0 
        ? editandoConquistas.join(',') 
        : null;

      const perfilAtualizado = await perfilService.atualizar(userPerfilId, {
        username: editandoUsername.trim(),
        foto: editandoFoto,
        conquistasSelecionadas: conquistasSelecionadasStr,
      });

      setPerfilResumo(perfilAtualizado);
      if (perfil) {
        const conquistasIds = perfilAtualizado.conquistasSelecionadas 
          ? perfilAtualizado.conquistasSelecionadas.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
          : [];
        setPerfil({ ...perfil, username: perfilAtualizado.username, conquistasSelecionadas: conquistasIds });
      }
      
      // Atualizar localStorage se necessário
      const userDataAtualizado = { ...userData, username: perfilAtualizado.username };
      localStorage.setItem('user', JSON.stringify(userDataAtualizado));

      setMensagemSucesso('Perfil atualizado com sucesso!');
      setTimeout(() => {
        setModalEditarAberto(false);
        setMensagemSucesso(null);
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      // Verificar se é um erro de validação do backend
      if (error.response?.data?.mensagem) {
        setErroEditar(error.response.data.mensagem);
      } else {
        setErroEditar(error.message || 'Erro ao atualizar perfil. Tente novamente.');
      }
    } finally {
      setSalvando(false);
    }
  };

  const handleSelecionarFoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setErroEditar('Por favor, selecione uma imagem válida');
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErroEditar('A imagem deve ter no máximo 5MB');
        return;
      }

      // Comprimir e converter para base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Criar canvas para redimensionar e comprimir
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          let width = img.width;
          let height = img.height;

          // Redimensionar mantendo proporção
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = (height * MAX_WIDTH) / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = (width * MAX_HEIGHT) / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Desenhar imagem redimensionada no canvas
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            
            // Converter para base64 com compressão (qualidade 0.8)
            const base64String = canvas.toDataURL('image/jpeg', 0.8);
            setEditandoFoto(base64String);
            setErroEditar(null);
          } else {
            setErroEditar('Erro ao processar a imagem');
          }
        };
        img.onerror = () => {
          setErroEditar('Erro ao carregar a imagem');
        };
        img.src = reader.result as string;
      };
      reader.onerror = () => {
        setErroEditar('Erro ao ler a imagem');
      };
      reader.readAsDataURL(file);
    }
  };

  const getIconeConquista = (icone: string) => {
    switch (icone) {
      case 'sword':
        return <Sword className="h-5 w-5" />;
      case 'flame':
        return <Flame className="h-5 w-5" />;
      case 'flex':
        return <Activity className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return null;
  }

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
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {userData.username || userEmail || 'Usuário'}
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
          {/* Header do Perfil */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={perfilResumo?.foto || ''} alt={perfil.username} />
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {perfil.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold">{perfil.username}</h1>
                      <span className="text-lg text-muted-foreground">
                        Nível {perfil.nivel}
                      </span>
                      <span className="text-lg text-muted-foreground">·</span>
                      <span className="text-lg text-muted-foreground">{perfil.titulo}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {perfil.conquistasSelecionadas.length > 0 ? (
                        perfil.conquistasSelecionadas.map(conquistaId => {
                          const conquista = conquistasDisponiveis.find(c => c.id === conquistaId);
                          if (!conquista) return null;
                          return (
                            <Badge key={conquistaId} variant="secondary" className="flex items-center gap-1 pr-1">
                              {conquista.nome}
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const novasConquistas = perfil.conquistasSelecionadas.filter(id => id !== conquistaId);
                                  try {
                                    const conquistasStr = novasConquistas.length > 0 ? novasConquistas.join(',') : null;
                                    const perfilAtualizado = await perfilService.atualizar(userPerfilId, {
                                      conquistasSelecionadas: conquistasStr,
                                    });
                                    setPerfilResumo(perfilAtualizado);
                                    if (perfil) {
                                      setPerfil({
                                        ...perfil,
                                        conquistasSelecionadas: novasConquistas,
                                      });
                                    }
                                  } catch (error: any) {
                                    console.error('Erro ao remover conquista:', error);
                                  }
                                }}
                                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                                title="Remover conquista"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          );
                        })
                      ) : null}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleAbrirModalEditar}>
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Treinos</p>
                    <p className="text-3xl font-bold">{perfil.totalTreinos}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Dumbbell className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">XP Total</p>
                    <p className="text-3xl font-bold">{perfil.xpTotal}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Barra de Progresso para Próximo Nível */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Progresso para o Nível {perfil.nivel + 1}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {perfil.xpTotal} / 100 XP
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {Math.min(Math.round((perfil.xpTotal / 100) * 100), 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.max(0, 100 - perfil.xpTotal)} XP restantes
                    </p>
                  </div>
                </div>
                <Progress 
                  value={Math.min((perfil.xpTotal / 100) * 100, 100)} 
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>

          {/* Abas de Navegação */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setAbaAtiva('estatisticas')}
              className={`px-4 py-2 font-medium transition-colors ${
                abaAtiva === 'estatisticas'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Estatísticas
            </button>
            <button
              onClick={() => setAbaAtiva('avatar')}
              className={`px-4 py-2 font-medium transition-colors ${
                abaAtiva === 'avatar'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Avatar
            </button>
          </div>

          {/* Conteúdo da Aba Estatísticas */}
          {abaAtiva === 'estatisticas' && (
            <Card>
              <CardHeader>
                <CardTitle>Atributos Físicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Força</span>
                    <span className="text-muted-foreground">{perfil.atributos.forca}</span>
                  </div>
                  <Progress value={perfil.atributos.forca} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Resistência</span>
                    <span className="text-muted-foreground">{perfil.atributos.resistencia}</span>
                  </div>
                  <Progress value={perfil.atributos.resistencia} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Velocidade</span>
                    <span className="text-muted-foreground">{perfil.atributos.velocidade}</span>
                  </div>
                  <Progress value={perfil.atributos.velocidade} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Agilidade</span>
                    <span className="text-muted-foreground">{perfil.atributos.agilidade}</span>
                  </div>
                  <Progress value={perfil.atributos.agilidade} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Flexibilidade</span>
                    <span className="text-muted-foreground">{perfil.atributos.flexibilidade}</span>
                  </div>
                  <Progress value={perfil.atributos.flexibilidade} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conteúdo da Aba Avatar */}
          {abaAtiva === 'avatar' && (
            <Card>
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
                <CardDescription>Personalize seu avatar</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidade de avatar em desenvolvimento...</p>
              </CardContent>
            </Card>
          )}

          {/* Conquistas Recentes */}
          {conquistasRecent.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Conquistas Recentes
                </CardTitle>
                <CardDescription>
                  Suas últimas conquistas conquistadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {conquistasRecent.map((conquista) => {
                    const icone = getIconePorNome(conquista.nome);
                    const isSelected = perfil.conquistasSelecionadas.includes(conquista.id);
                    
                    return (
                      <div
                        key={conquista.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              {getIconeConquista(icone)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate">{conquista.nome}</h4>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {conquista.descricao}
                              </p>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t">
                            <Badge variant="secondary" className="text-xs">
                              Exibida no perfil
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {conquistasRecent.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Você ainda não conquistou nenhuma conquista.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog de Editar Perfil */}
      <Dialog open={modalEditarAberto} onOpenChange={setModalEditarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Foto */}
            <div className="space-y-2">
              <Label htmlFor="foto">Foto de Perfil</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={editandoFoto || ''} alt={editandoUsername} />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {editandoUsername.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={handleSelecionarFoto}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                type="text"
                value={editandoUsername}
                onChange={(e) => {
                  setEditandoUsername(e.target.value);
                  setErroEditar(null);
                }}
                placeholder="Digite seu nome de usuário"
                maxLength={50}
              />
            </div>

            {/* Conquistas Selecionadas */}
            <div className="space-y-2">
              <Label>Conquistas para Exibir (máximo 3)</Label>
              {carregandoConquistas ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Carregando conquistas...</span>
                </div>
              ) : conquistasDisponiveis.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground border rounded-md">
                  Nenhuma conquista disponível no momento.
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {conquistasDisponiveis.map((conquista) => {
                      const isSelected = editandoConquistas.includes(conquista.id);
                      const canSelect = isSelected || editandoConquistas.length < 3;
                      const icone = getIconePorNome(conquista.nome);
                      
                      return (
                        <div
                          key={conquista.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer"
                          onClick={() => {
                            if (isSelected) {
                              setEditandoConquistas(editandoConquistas.filter(id => id !== conquista.id));
                            } else if (canSelect) {
                              setEditandoConquistas([...editandoConquistas, conquista.id]);
                            }
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={!canSelect && !isSelected}
                            onCheckedChange={(checked) => {
                              if (checked && canSelect) {
                                setEditandoConquistas([...editandoConquistas, conquista.id]);
                              } else if (!checked) {
                                setEditandoConquistas(editandoConquistas.filter(id => id !== conquista.id));
                              }
                            }}
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {getIconeConquista(icone)}
                            </div>
                            <span className="text-sm font-medium">{conquista.nome}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {editandoConquistas.length}/3 conquistas selecionadas
                  </p>
                </>
              )}
            </div>

            {/* Mensagens de erro e sucesso */}
            {erroEditar && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
                {erroEditar}
              </div>
            )}

            {mensagemSucesso && (
              <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm">
                {mensagemSucesso}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setModalEditarAberto(false);
                  setErroEditar(null);
                  setMensagemSucesso(null);
                }}
                disabled={salvando}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSalvarEdicao}
                disabled={salvando || !editandoUsername.trim()}
              >
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
