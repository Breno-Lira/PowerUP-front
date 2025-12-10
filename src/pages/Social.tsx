import { useState, useEffect } from 'react';
import { Menu, TrendingUp, Copy, Check, User, Loader2, UserPlus, X } from 'lucide-react';
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
import { usuarioService, UsuarioResumo } from '@/services/api';

interface Grupo {
  id: number;
  nome: string;
  posicao: number;
}

export function Social() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState<'amizades' | 'rival'>('amizades');
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [amigos, setAmigos] = useState<UsuarioResumo[]>([]);
  const [carregandoAmigos, setCarregandoAmigos] = useState(false);
  const [erroAmigos, setErroAmigos] = useState<string | null>(null);
  const [codigoAmizadeInput, setCodigoAmizadeInput] = useState('');
  const [adicionandoAmigo, setAdicionandoAmigo] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erroAdicionar, setErroAdicionar] = useState<string | null>(null);
  
  // Obter email do usuário logado
  const userEmail = JSON.parse(localStorage.getItem('user') || '{}')?.email;
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const codigoAmizade = userData.amizadeId ? String(userData.amizadeId) : 'N/A'; // Código de amizade do usuário atual

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

  // Função para recarregar a lista de amigos
  const recarregarAmigos = () => {
    if (userEmail) {
      setCarregandoAmigos(true);
      setErroAmigos(null);
      usuarioService
        .listarAmigos(userEmail)
        .then((amigosLista) => {
          // Filtrar o próprio usuário da lista de amigos
          setAmigos(amigosLista.filter(amigo => amigo.usuarioEmail !== userEmail));
          setCarregandoAmigos(false);
        })
        .catch((error) => {
          console.error('Erro ao buscar amigos:', error);
          setErroAmigos('Erro ao carregar amizades. Tente novamente.');
          setCarregandoAmigos(false);
        });
    }
  };

  // Buscar amigos quando a aba de amizades estiver ativa
  useEffect(() => {
    if (abaAtiva === 'amizades' && userEmail) {
      recarregarAmigos();
    }
  }, [abaAtiva, userEmail]);

  // Função para adicionar amigo por código
  const handleAdicionarAmigo = async () => {
    if (!codigoAmizadeInput.trim()) {
      setErroAdicionar('Por favor, insira um código de amizade');
      return;
    }

    const codigo = parseInt(codigoAmizadeInput.trim());
    if (isNaN(codigo)) {
      setErroAdicionar('Código de amizade inválido. Deve ser um número.');
      return;
    }

    setAdicionandoAmigo(true);
    setErroAdicionar(null);
    setMensagemSucesso(null);

    try {
      const resultado = await usuarioService.adicionarAmigoPorCodigo(userEmail, codigo);
      setMensagemSucesso(resultado || 'Amigo adicionado com sucesso!');
      setCodigoAmizadeInput('');
      // Recarregar a lista de amigos
      setTimeout(() => {
        recarregarAmigos();
        setMensagemSucesso(null);
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao adicionar amigo:', error);
      const mensagemErro = error.response?.data || error.message || 'Erro ao adicionar amigo. Tente novamente.';
      setErroAdicionar(mensagemErro);
    } finally {
      setAdicionandoAmigo(false);
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

          {/* Seção Amizades - Mostrar quando aba ativa for 'amizades' */}
          {abaAtiva === 'amizades' && (
            <>
              {/* Card para adicionar amigo */}
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Amigo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Digite o código de amizade"
                        value={codigoAmizadeInput}
                        onChange={(e) => {
                          setCodigoAmizadeInput(e.target.value);
                          setErroAdicionar(null);
                          setMensagemSucesso(null);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAdicionarAmigo();
                          }
                        }}
                        className="flex-1"
                        disabled={adicionandoAmigo}
                      />
                      <Button
                        onClick={handleAdicionarAmigo}
                        disabled={adicionandoAmigo || !codigoAmizadeInput.trim()}
                        className="gap-2"
                      >
                        {adicionandoAmigo ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Adicionando...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            Adicionar
                          </>
                        )}
                      </Button>
                    </div>
                    {mensagemSucesso && (
                      <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm flex items-center justify-between">
                        <span>{mensagemSucesso}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setMensagemSucesso(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {erroAdicionar && (
                      <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between">
                        <span>{erroAdicionar}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setErroAdicionar(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Card com lista de amigos */}
              <Card>
                <CardHeader>
                  <CardTitle>Minhas Amizades</CardTitle>
                </CardHeader>
                <CardContent>
                {carregandoAmigos ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Carregando amizades...</span>
                  </div>
                ) : erroAmigos ? (
                  <div className="text-center py-8 text-destructive">
                    <p>{erroAmigos}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setCarregandoAmigos(true);
                        setErroAmigos(null);
                        usuarioService
                          .listarAmigos(userEmail)
                          .then((amigosLista) => {
                            setAmigos(amigosLista.filter(amigo => amigo.usuarioEmail !== userEmail));
                            setCarregandoAmigos(false);
                          })
                          .catch((error) => {
                            console.error('Erro ao buscar amigos:', error);
                            setErroAmigos('Erro ao carregar amizades. Tente novamente.');
                            setCarregandoAmigos(false);
                          });
                      }}
                    >
                      Tentar novamente
                    </Button>
                  </div>
                ) : amigos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Você ainda não tem amizades.</p>
                    <p className="text-sm mt-2">Use seu código de amizade para adicionar amigos!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {amigos.map((amigo) => (
                      <div
                        key={amigo.usuarioEmail}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{amigo.nome}</p>
                          <p className="text-sm text-muted-foreground">{amigo.usuarioEmail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
          )}

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

