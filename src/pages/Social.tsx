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
import { usuarioService, UsuarioResumo, dueloService, perfilService, DueloResumo, AtributosCalculados } from '@/services/api';
import { Sword, UserMinus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [duelando, setDuelando] = useState<string | null>(null); // email do amigo sendo desafiado
  const [removendoAmizade, setRemovendoAmizade] = useState<string | null>(null); // email do amigo sendo removido
  const [resultadoDuelo, setResultadoDuelo] = useState<{
    duelo: DueloResumo;
    atributosDesafiante: AtributosCalculados;
    atributosDesafiado: AtributosCalculados;
    nomeDesafiante: string;
    nomeDesafiado: string;
  } | null>(null);
  
  // Obter email do usuário logado
  const userEmail = JSON.parse(localStorage.getItem('user') || '{}')?.email;
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userPerfilId = userData.perfilId;
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
  const handleDuelar = async (amigo: UsuarioResumo) => {
    if (!userPerfilId) {
      setErroAdicionar('Perfil não encontrado. Faça login novamente.');
      return;
    }

    setDuelando(amigo.usuarioEmail);
    setErroAdicionar(null);

    try {
      // Buscar perfil do amigo pelo email
      let perfilAmigo: any;
      try {
        perfilAmigo = await perfilService.obterPorEmail(amigo.usuarioEmail);
      } catch (perfilError: any) {
        console.error('Erro ao buscar perfil do amigo:', perfilError);
        setErroAdicionar(perfilError.message || 'Não foi possível encontrar o perfil do amigo. Verifique se o amigo tem um perfil cadastrado.');
        return;
      }
      
      if (!perfilAmigo || !perfilAmigo.id) {
        setErroAdicionar('Perfil do amigo não encontrado.');
        return;
      }
      
      // Realizar duelo (userPerfilId é o desafiante, perfilAmigo.id é o desafiado)
      const duelo = await dueloService.realizarDuelo(userPerfilId, perfilAmigo.id);
      
      // No backend, avatar1 é sempre o desafiante e avatar2 é sempre o desafiado
      // Buscar atributos de ambos os avatares
      const atributosDesafiante = await dueloService.obterAtributosAvatar(duelo.avatar1Id);
      const atributosDesafiado = await dueloService.obterAtributosAvatar(duelo.avatar2Id);
      
      setResultadoDuelo({
        duelo,
        atributosDesafiante,
        atributosDesafiado,
        nomeDesafiante: userData.username || userEmail?.split('@')[0] || 'Você',
        nomeDesafiado: amigo.nome,
      });
    } catch (error: any) {
      console.error('Erro ao realizar duelo:', error);
      let errorMessage = 'Erro ao realizar duelo. Tente novamente.';
      
      if (error.response) {
        // Erro da API
        if (error.response.data) {
          // Se a resposta é um objeto com message
          if (typeof error.response.data === 'object' && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === 'string') {
            // Se a resposta é uma string
            errorMessage = error.response.data;
          } else {
            errorMessage = error.response.data?.message || error.message || errorMessage;
          }
        } else {
          errorMessage = error.message || errorMessage;
        }
      } else if (error.message) {
        // Erro de rede ou outro erro
        errorMessage = error.message;
      }
      
      setErroAdicionar(errorMessage);
    } finally {
      setDuelando(null);
    }
  };

  const handleRemoverAmizade = async (amigo: UsuarioResumo) => {
    if (!userEmail) {
      setErroAdicionar('Usuário não autenticado.');
      return;
    }

    // Confirmar antes de remover
    if (!confirm(`Tem certeza que deseja remover ${amigo.nome} da sua lista de amigos?`)) {
      return;
    }

    setRemovendoAmizade(amigo.usuarioEmail);
    setErroAdicionar(null);

    try {
      await usuarioService.removerAmizade(userEmail, amigo.usuarioEmail);
      setMensagemSucesso(`${amigo.nome} foi removido da sua lista de amigos.`);
      // Recarregar lista de amigos
      recarregarAmigos();
    } catch (error: any) {
      console.error('Erro ao remover amizade:', error);
      let errorMessage = 'Erro ao remover amizade. Tente novamente.';
      
      if (error.response) {
        if (error.response.data) {
          if (typeof error.response.data === 'object' && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErroAdicionar(errorMessage);
    } finally {
      setRemovendoAmizade(null);
      setTimeout(() => {
        setMensagemSucesso(null);
        setErroAdicionar(null);
      }, 3000);
    }
  };

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
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuelar(amigo)}
                            disabled={duelando === amigo.usuarioEmail || removendoAmizade === amigo.usuarioEmail || !userPerfilId}
                            className="gap-2"
                          >
                            {duelando === amigo.usuarioEmail ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Duelando...
                              </>
                            ) : (
                              <>
                                <Sword className="h-4 w-4" />
                                Duelar
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoverAmizade(amigo)}
                            disabled={duelando === amigo.usuarioEmail || removendoAmizade === amigo.usuarioEmail}
                            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {removendoAmizade === amigo.usuarioEmail ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Removendo...
                              </>
                            ) : (
                              <>
                                <UserMinus className="h-4 w-4" />
                                Remover
                              </>
                            )}
                          </Button>
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

      {/* Dialog de Resultado do Duelo */}
      <Dialog open={resultadoDuelo !== null} onOpenChange={(open) => !open && setResultadoDuelo(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Resultado do Duelo</DialogTitle>
          </DialogHeader>
          {resultadoDuelo && (
            <div className="space-y-6 mt-4">
              {/* Resultado */}
              <div className="text-center">
                {resultadoDuelo.duelo.resultado === 'VITORIA_DESAFIANTE(A1)' ? (
                  <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4">
                    <p className="text-2xl font-bold text-green-800">🎉 Vitória!</p>
                    <p className="text-green-700 mt-2">Você venceu o duelo contra {resultadoDuelo.nomeDesafiado}!</p>
                  </div>
                ) : resultadoDuelo.duelo.resultado === 'VITORIA_DESAFIADO(A2)' ? (
                  <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4">
                    <p className="text-2xl font-bold text-red-800">💔 Derrota</p>
                    <p className="text-red-700 mt-2">Você foi derrotado por {resultadoDuelo.nomeDesafiado}.</p>
                  </div>
                ) : (
                  <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4">
                    <p className="text-2xl font-bold text-yellow-800">🤝 Empate</p>
                    <p className="text-yellow-700 mt-2">O duelo terminou em empate!</p>
                  </div>
                )}
              </div>

              {/* Comparação de Atributos */}
              <div className="grid grid-cols-2 gap-4">
                {/* Desafiante */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-bold text-lg mb-3 text-center">{resultadoDuelo.nomeDesafiante}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Força:</span>
                      <span className="font-semibold">{resultadoDuelo.atributosDesafiante.forca}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resistência:</span>
                      <span className="font-semibold">{resultadoDuelo.atributosDesafiante.resistencia}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Agilidade:</span>
                      <span className="font-semibold">{resultadoDuelo.atributosDesafiante.agilidade}</span>
                    </div>
                  </div>
                </div>

                {/* Desafiado */}
                <div className="border rounded-lg p-4 bg-purple-50">
                  <h3 className="font-bold text-lg mb-3 text-center">{resultadoDuelo.nomeDesafiado}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Força:</span>
                      <span className="font-semibold">{resultadoDuelo.atributosDesafiado.forca}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resistência:</span>
                      <span className="font-semibold">{resultadoDuelo.atributosDesafiado.resistencia}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Agilidade:</span>
                      <span className="font-semibold">{resultadoDuelo.atributosDesafiado.agilidade}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparação Visual */}
              <div className="space-y-4">
                <h4 className="font-semibold text-center">Comparação de Atributos</h4>
                
                {/* Força */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Força</span>
                    <span className="text-muted-foreground">{resultadoDuelo.atributosDesafiante.forca} vs {resultadoDuelo.atributosDesafiado.forca}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 bg-blue-200 rounded h-6 flex items-center justify-end pr-2" style={{ width: `${(resultadoDuelo.atributosDesafiante.forca / Math.max(resultadoDuelo.atributosDesafiante.forca, resultadoDuelo.atributosDesafiado.forca, 1)) * 100}%` }}>
                      {resultadoDuelo.atributosDesafiante.forca > resultadoDuelo.atributosDesafiado.forca && <span className="text-xs font-bold text-blue-800">✓</span>}
                    </div>
                    <div className="flex-1 bg-purple-200 rounded h-6 flex items-center justify-start pl-2" style={{ width: `${(resultadoDuelo.atributosDesafiado.forca / Math.max(resultadoDuelo.atributosDesafiante.forca, resultadoDuelo.atributosDesafiado.forca, 1)) * 100}%` }}>
                      {resultadoDuelo.atributosDesafiado.forca > resultadoDuelo.atributosDesafiante.forca && <span className="text-xs font-bold text-purple-800">✓</span>}
                    </div>
                  </div>
                </div>

                {/* Resistência */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Resistência</span>
                    <span className="text-muted-foreground">{resultadoDuelo.atributosDesafiante.resistencia} vs {resultadoDuelo.atributosDesafiado.resistencia}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 bg-blue-200 rounded h-6 flex items-center justify-end pr-2" style={{ width: `${(resultadoDuelo.atributosDesafiante.resistencia / Math.max(resultadoDuelo.atributosDesafiante.resistencia, resultadoDuelo.atributosDesafiado.resistencia, 1)) * 100}%` }}>
                      {resultadoDuelo.atributosDesafiante.resistencia > resultadoDuelo.atributosDesafiado.resistencia && <span className="text-xs font-bold text-blue-800">✓</span>}
                    </div>
                    <div className="flex-1 bg-purple-200 rounded h-6 flex items-center justify-start pl-2" style={{ width: `${(resultadoDuelo.atributosDesafiado.resistencia / Math.max(resultadoDuelo.atributosDesafiante.resistencia, resultadoDuelo.atributosDesafiado.resistencia, 1)) * 100}%` }}>
                      {resultadoDuelo.atributosDesafiado.resistencia > resultadoDuelo.atributosDesafiante.resistencia && <span className="text-xs font-bold text-purple-800">✓</span>}
                    </div>
                  </div>
                </div>

                {/* Agilidade */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Agilidade</span>
                    <span className="text-muted-foreground">{resultadoDuelo.atributosDesafiante.agilidade} vs {resultadoDuelo.atributosDesafiado.agilidade}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 bg-blue-200 rounded h-6 flex items-center justify-end pr-2" style={{ width: `${(resultadoDuelo.atributosDesafiante.agilidade / Math.max(resultadoDuelo.atributosDesafiante.agilidade, resultadoDuelo.atributosDesafiado.agilidade, 1)) * 100}%` }}>
                      {resultadoDuelo.atributosDesafiante.agilidade > resultadoDuelo.atributosDesafiado.agilidade && <span className="text-xs font-bold text-blue-800">✓</span>}
                    </div>
                    <div className="flex-1 bg-purple-200 rounded h-6 flex items-center justify-start pl-2" style={{ width: `${(resultadoDuelo.atributosDesafiado.agilidade / Math.max(resultadoDuelo.atributosDesafiante.agilidade, resultadoDuelo.atributosDesafiado.agilidade, 1)) * 100}%` }}>
                      {resultadoDuelo.atributosDesafiado.agilidade > resultadoDuelo.atributosDesafiante.agilidade && <span className="text-xs font-bold text-purple-800">✓</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setResultadoDuelo(null)}>Fechar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

