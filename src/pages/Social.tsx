import { useState, useEffect } from 'react';
import { Menu, TrendingUp, Copy, Check, User, Loader2, UserPlus, X, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { UserInfoHeader } from '@/components/UserInfoHeader';
import { usuarioService, UsuarioResumo, dueloService, perfilService, DueloResumo, AtributosCalculados, equipeService, EquipeResumo, CriarEquipeRequest, rivalidadeService, RivalidadeResumo, ComparacaoRivalidade, frequenciaService, planoTreinoService } from '@/services/api';
import { Sword, UserMinus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Interface removida - usando EquipeResumo do serviço

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

  // Estados para equipes
  const [equipes, setEquipes] = useState<EquipeResumo[]>([]);
  const [carregandoEquipes, setCarregandoEquipes] = useState(false);
  const [erroEquipes, setErroEquipes] = useState<string | null>(null);
  const [modalCriarEquipeAberto, setModalCriarEquipeAberto] = useState(false);
  const [criandoEquipe, setCriandoEquipe] = useState(false);
  const [nomeNovaEquipe, setNomeNovaEquipe] = useState('');
  const [descricaoNovaEquipe, setDescricaoNovaEquipe] = useState('');
  const [erroCriarEquipe, setErroCriarEquipe] = useState<string | null>(null);

  // Estados para rivalidade
  const [rivalidades, setRivalidades] = useState<RivalidadeResumo[]>([]);
  const [carregandoRivalidades, setCarregandoRivalidades] = useState(false);
  const [rivalidadeAtiva, setRivalidadeAtiva] = useState<RivalidadeResumo | null>(null);
  const [comparacao, setComparacao] = useState<ComparacaoRivalidade | null>(null);
  const [carregandoComparacao, setCarregandoComparacao] = useState(false);
  const [modalEnviarConvite, setModalEnviarConvite] = useState(false);
  const [amigoSelecionado, setAmigoSelecionado] = useState<UsuarioResumo | null>(null);
  const [enviandoConvite, setEnviandoConvite] = useState(false);
  const [erroRivalidade, setErroRivalidade] = useState<string | null>(null);
  const [perfisAmigos, setPerfisAmigos] = useState<Map<string, number>>(new Map());

  // Estados para desempenho/frequência
  const [frequenciaSemanal, setFrequenciaSemanal] = useState(0);
  const [metaSemanal, setMetaSemanal] = useState(0);
  const [carregandoDesempenho, setCarregandoDesempenho] = useState(false);
  const [perfilUsuario, setPerfilUsuario] = useState<PerfilResumo | null>(null);

  // Obter email do usuário logado
  const userEmail = JSON.parse(localStorage.getItem('user') || '{}')?.email;
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userPerfilId = userData.perfilId;
  const codigoAmizade = userData.amizadeId ? String(userData.amizadeId) : 'N/A'; // Código de amizade do usuário atual

  // Constantes de recompensa de duelo
  const recompensaMoedas = 25;
  const recompensaXp = 5;

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

  // Função para carregar equipes do usuário
  const carregarEquipes = async () => {
    if (!userEmail) return;

    setCarregandoEquipes(true);
    setErroEquipes(null);

    try {
      const equipesLista = await equipeService.listarPorUsuario(userEmail);
      setEquipes(equipesLista);
    } catch (error: any) {
      console.error('Erro ao carregar equipes:', error);
      setErroEquipes('Erro ao carregar equipes. Tente novamente.');
    } finally {
      setCarregandoEquipes(false);
    }
  };

  // Função para criar equipe
  const handleCriarEquipe = async () => {
    if (!nomeNovaEquipe.trim()) {
      setErroCriarEquipe('Por favor, insira um nome para a equipe.');
      return;
    }

    if (!userEmail) {
      setErroCriarEquipe('Usuário não autenticado.');
      return;
    }

    setCriandoEquipe(true);
    setErroCriarEquipe(null);

    try {
      await equipeService.criarEquipe({
        nome: nomeNovaEquipe.trim(),
        usuarioAdmEmail: userEmail,
        descricao: descricaoNovaEquipe.trim() || undefined,
      });

      setNomeNovaEquipe('');
      setDescricaoNovaEquipe('');
      setModalCriarEquipeAberto(false);
      setMensagemSucesso('Equipe criada com sucesso!');

      // Recarregar lista de equipes
      await carregarEquipes();

      setTimeout(() => setMensagemSucesso(null), 3000);
    } catch (error: any) {
      console.error('Erro ao criar equipe:', error);
      const mensagemErro = error.response?.data || error.message || 'Erro ao criar equipe. Tente novamente.';
      setErroCriarEquipe(mensagemErro);
    } finally {
      setCriandoEquipe(false);
    }
  };

  // Buscar amigos quando a aba de amizades estiver ativa
  useEffect(() => {
    if (abaAtiva === 'amizades' && userEmail) {
      recarregarAmigos();
    }
  }, [abaAtiva, userEmail]);

  // Carregar equipes quando o componente montar
  useEffect(() => {
    if (userEmail) {
      carregarEquipes();
    }
  }, [userEmail]);

  // Carregar rivalidades quando a aba rival estiver ativa
  useEffect(() => {
    if (abaAtiva === 'rival' && userPerfilId) {
      carregarRivalidades();
    }
  }, [abaAtiva, userPerfilId]);

  // Carregar perfis dos amigos quando a lista de amigos mudar
  useEffect(() => {
    const carregarPerfisAmigos = async () => {
      if (amigos.length === 0) {
        setPerfisAmigos(new Map());
        return;
      }

      const novoMapa = new Map<string, number>();
      for (const amigo of amigos) {
        try {
          const perfil = await perfilService.obterPorEmail(amigo.usuarioEmail);
          if (perfil && perfil.id) {
            novoMapa.set(amigo.usuarioEmail, perfil.id);
          }
        } catch (error) {
          console.error(`Erro ao buscar perfil de ${amigo.usuarioEmail}:`, error);
        }
      }
      setPerfisAmigos(novoMapa);
    };

    if (abaAtiva === 'rival') {
      carregarPerfisAmigos();
    }
  }, [amigos, abaAtiva]);

  // Carregar comparação quando houver rivalidade ativa
  useEffect(() => {
    const carregarComparacao = async () => {
      if (!rivalidadeAtiva || !userPerfilId) {
        setComparacao(null);
        return;
      }

      setCarregandoComparacao(true);
      try {
        const comparacaoData = await rivalidadeService.obterComparacao(rivalidadeAtiva.id, userPerfilId);
        setComparacao(comparacaoData);
      } catch (error: any) {
        console.error('Erro ao carregar comparação:', error);
        setComparacao(null);
      } finally {
        setCarregandoComparacao(false);
      }
    };

    carregarComparacao();
  }, [rivalidadeAtiva, userPerfilId]);

  // Carregar perfil para obter foto
  useEffect(() => {
    if (userPerfilId) {
      perfilService.obterPorId(userPerfilId)
        .then(setPerfilUsuario)
        .catch(console.error);
    }
  }, [userPerfilId]);

  // Carregar desempenho (frequência semanal)
  useEffect(() => {
    const carregarDesempenho = async () => {
      if (!userPerfilId || !userEmail) return;

      setCarregandoDesempenho(true);
      try {
        // Carregar planos de treino ativos
        const planos = await planoTreinoService.listarPorUsuario(userEmail);
        const planosAtivos = planos.filter(p => p.estado === 'Ativo');

        if (planosAtivos.length === 0) {
          setFrequenciaSemanal(0);
          setMetaSemanal(0);
          return;
        }

        // Calcular meta semanal (soma de todos os dias de todos os planos ativos)
        const totalDias = planosAtivos.reduce((sum, p) => sum + p.dias.length, 0);
        setMetaSemanal(totalDias);

        // Calcular frequência semanal de todos os planos ativos
        const frequenciasSemanais = await Promise.all(
          planosAtivos
            .filter(plano => plano.id != null)
            .map(plano =>
              frequenciaService.calcularFrequenciaSemanal(userPerfilId, plano.id!)
                .catch(() => 0)
            )
        );
        const frequenciaTotal = frequenciasSemanais.reduce((sum, freq) => sum + freq, 0);
        setFrequenciaSemanal(frequenciaTotal);
      } catch (error: any) {
        console.error('Erro ao carregar desempenho:', error);
        setFrequenciaSemanal(0);
        setMetaSemanal(0);
      } finally {
        setCarregandoDesempenho(false);
      }
    };

    carregarDesempenho();
  }, [userPerfilId, userEmail]);

  const carregarRivalidades = async () => {
    if (!userPerfilId) return;

    setCarregandoRivalidades(true);
    setErroRivalidade(null);

    try {
      const lista = await rivalidadeService.listarPorPerfil(userPerfilId);
      setRivalidades(lista);

      // Encontrar rivalidade ativa
      const ativa = lista.find(r => r.status === 'ATIVA');
      setRivalidadeAtiva(ativa || null);
    } catch (error: any) {
      console.error('Erro ao carregar rivalidades:', error);
      setErroRivalidade('Erro ao carregar rivalidades. Tente novamente.');
    } finally {
      setCarregandoRivalidades(false);
    }
  };


  const handleEnviarConvite = async (amigo: UsuarioResumo) => {
    if (!userPerfilId) {
      setErroRivalidade('Perfil não encontrado. Faça login novamente.');
      return;
    }

    setAmigoSelecionado(amigo);
    setModalEnviarConvite(true);
  };

  const confirmarEnviarConvite = async () => {
    if (!amigoSelecionado || !userPerfilId) return;

    setEnviandoConvite(true);
    setErroRivalidade(null);

    try {
      // Buscar perfil do amigo
      const perfilAmigo = await perfilService.obterPorEmail(amigoSelecionado.usuarioEmail);

      if (!perfilAmigo || !perfilAmigo.id) {
        setErroRivalidade('Perfil do amigo não encontrado.');
        return;
      }

      // Por enquanto, vamos usar exercicioId = 1 como padrão
      // Isso pode ser melhorado depois para permitir escolher o exercício
      await rivalidadeService.enviarConvite({
        perfil1Id: userPerfilId,
        perfil2Id: perfilAmigo.id,
        exercicioId: 1, // TODO: Permitir escolher exercício
      });

      setModalEnviarConvite(false);
      setAmigoSelecionado(null);
      setMensagemSucesso('Convite de rivalidade enviado com sucesso!');
      setTimeout(() => setMensagemSucesso(null), 3000);

      // Recarregar rivalidades
      await carregarRivalidades();
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      let mensagemErro = 'Erro ao enviar convite. Tente novamente.';

      if (error.response) {
        // Se a resposta tem uma mensagem específica
        if (error.response.data?.mensagem) {
          mensagemErro = error.response.data.mensagem;
        } else if (typeof error.response.data === 'string') {
          mensagemErro = error.response.data;
        } else if (error.response.status === 400) {
          mensagemErro = error.response.data?.mensagem || 'Não foi possível enviar o convite. Verifique se você ou o amigo já possui uma rivalidade ativa.';
        } else if (error.response.status === 500) {
          mensagemErro = 'Erro no servidor. Tente novamente mais tarde.';
        }
      } else if (error.message) {
        mensagemErro = error.message;
      }

      setErroRivalidade(mensagemErro);
    } finally {
      setEnviandoConvite(false);
    }
  };

  const handleAceitarConvite = async (rivalidade: RivalidadeResumo) => {
    if (!userPerfilId) return;

    try {
      await rivalidadeService.aceitar({
        rivalidadeId: rivalidade.id,
        usuarioId: userPerfilId,
      });

      setMensagemSucesso('Rivalidade aceita com sucesso!');
      setTimeout(() => setMensagemSucesso(null), 3000);
      await carregarRivalidades();
    } catch (error: any) {
      console.error('Erro ao aceitar convite:', error);
      let mensagemErro = 'Erro ao aceitar convite. Tente novamente.';

      if (error.response) {
        // Se a resposta tem uma mensagem específica
        if (error.response.data?.mensagem) {
          mensagemErro = error.response.data.mensagem;
        } else if (typeof error.response.data === 'string') {
          mensagemErro = error.response.data;
        } else if (error.response.status === 400) {
          mensagemErro = error.response.data?.mensagem || 'Não foi possível aceitar o convite. Verifique se você já possui uma rivalidade ativa.';
        } else if (error.response.status === 500) {
          mensagemErro = 'Erro no servidor. Tente novamente mais tarde.';
        }
      } else if (error.message) {
        mensagemErro = error.message;
      }

      setErroRivalidade(mensagemErro);
    }
  };

  const handleCancelarConvite = async (rivalidade: RivalidadeResumo) => {
    if (!userPerfilId) return;

    try {
      await rivalidadeService.cancelar({
        rivalidadeId: rivalidade.id,
        usuarioId: userPerfilId,
      });

      setMensagemSucesso('Convite cancelado com sucesso!');
      setTimeout(() => setMensagemSucesso(null), 3000);
      await carregarRivalidades();
    } catch (error: any) {
      console.error('Erro ao cancelar convite:', error);
      let mensagemErro = 'Erro ao cancelar convite. Tente novamente.';

      if (error.response) {
        if (error.response.data?.mensagem) {
          mensagemErro = error.response.data.mensagem;
        } else if (typeof error.response.data === 'string') {
          mensagemErro = error.response.data;
        } else if (error.response.status === 400) {
          mensagemErro = error.response.data?.mensagem || 'Não foi possível cancelar o convite.';
        } else if (error.response.status === 500) {
          mensagemErro = 'Erro no servidor. Tente novamente mais tarde.';
        }
      } else if (error.message) {
        mensagemErro = error.message;
      }

      setErroRivalidade(mensagemErro);
    }
  };

  const handleRecusarConvite = async (rivalidade: RivalidadeResumo) => {
    if (!userPerfilId) return;

    try {
      await rivalidadeService.recusar({
        rivalidadeId: rivalidade.id,
        usuarioId: userPerfilId,
      });

      setMensagemSucesso('Convite recusado.');
      setTimeout(() => setMensagemSucesso(null), 3000);
      await carregarRivalidades();
    } catch (error: any) {
      console.error('Erro ao recusar convite:', error);
      setErroRivalidade(error.response?.data || error.message || 'Erro ao recusar convite.');
    }
  };

  const handleFinalizarRivalidade = async (rivalidade: RivalidadeResumo) => {
    if (!userPerfilId) return;

    if (!confirm('Tem certeza que deseja finalizar esta rivalidade?')) {
      return;
    }

    try {
      await rivalidadeService.finalizar({
        rivalidadeId: rivalidade.id,
        usuarioId: userPerfilId,
      });

      setMensagemSucesso('Rivalidade finalizada com sucesso!');
      setTimeout(() => setMensagemSucesso(null), 3000);
      await carregarRivalidades();
    } catch (error: any) {
      console.error('Erro ao finalizar rivalidade:', error);
      let mensagemErro = 'Erro ao finalizar rivalidade.';
      if (error.response?.data?.mensagem) {
        mensagemErro = error.response.data.mensagem;
      } else if (error.message) {
        mensagemErro = error.message;
      }
      setErroRivalidade(mensagemErro);
    }
  };

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
                      {perfilUsuario?.username || userData.username || userEmail || 'Usuário'}
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
          <div className="ml-auto hidden sm:block">
            <UserInfoHeader variant="inline" />
          </div>
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
            <Button
              variant="default"
              className="flex-1"
              onClick={() => setModalCriarEquipeAberto(true)}
            >
              Criar equipe +
            </Button>
          </div>

          {/* Seção Rival - Mostrar quando aba ativa for 'rival' */}
          {abaAtiva === 'rival' && (
            <>
              {carregandoRivalidades ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Carregando rivalidades...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : erroRivalidade ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8 text-destructive">
                      <p>{erroRivalidade}</p>
                      <Button variant="outline" className="mt-4" onClick={carregarRivalidades}>
                        Tentar novamente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Rivalidade Ativa */}
                  {rivalidadeAtiva && comparacao && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Rivalidade Ativa</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFinalizarRivalidade(rivalidadeAtiva)}
                            className="text-destructive hover:text-destructive"
                          >
                            Finalizar Rivalidade
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {carregandoComparacao ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Comparação de Streak */}
                            <div>
                              <h3 className="font-semibold mb-3">Streak de Dias</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border bg-card">
                                  <div className="flex items-center gap-2 mb-2">
                                    {comparacao.fotoUsuario ? (
                                      <img
                                        src={comparacao.fotoUsuario}
                                        alt="Você"
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-4 w-4 text-primary" />
                                      </div>
                                    )}
                                    <p className="text-sm font-medium">Você</p>
                                  </div>
                                  <p className="text-3xl font-bold text-primary">{comparacao.streakUsuario}</p>
                                  <p className="text-xs text-muted-foreground mt-1">dias consecutivos</p>
                                </div>
                                <div className="p-4 rounded-lg border bg-card">
                                  <div className="flex items-center gap-2 mb-2">
                                    {comparacao.fotoRival ? (
                                      <img
                                        src={comparacao.fotoRival}
                                        alt={comparacao.nomeRival}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                                        <User className="h-4 w-4 text-destructive" />
                                      </div>
                                    )}
                                    <p className="text-sm font-medium">{comparacao.nomeRival}</p>
                                  </div>
                                  <p className="text-3xl font-bold text-destructive">{comparacao.streakRival}</p>
                                  <p className="text-xs text-muted-foreground mt-1">dias consecutivos</p>
                                </div>
                              </div>
                            </div>

                            {/* Comparação de Treinos na Semana */}
                            <div>
                              <h3 className="font-semibold mb-3">Treinos na Semana</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border bg-card">
                                  <div className="flex items-center gap-2 mb-2">
                                    {comparacao.fotoUsuario ? (
                                      <img
                                        src={comparacao.fotoUsuario}
                                        alt="Você"
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-4 w-4 text-primary" />
                                      </div>
                                    )}
                                    <p className="text-sm font-medium">Você</p>
                                  </div>
                                  <p className="text-3xl font-bold text-primary">{comparacao.treinosSemanaUsuario}</p>
                                  <p className="text-xs text-muted-foreground mt-1">treinos</p>
                                </div>
                                <div className="p-4 rounded-lg border bg-card">
                                  <div className="flex items-center gap-2 mb-2">
                                    {comparacao.fotoRival ? (
                                      <img
                                        src={comparacao.fotoRival}
                                        alt={comparacao.nomeRival}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                                        <User className="h-4 w-4 text-destructive" />
                                      </div>
                                    )}
                                    <p className="text-sm font-medium">{comparacao.nomeRival}</p>
                                  </div>
                                  <p className="text-3xl font-bold text-destructive">{comparacao.treinosSemanaRival}</p>
                                  <p className="text-xs text-muted-foreground mt-1">treinos</p>
                                </div>
                              </div>
                            </div>

                            {/* Comparação de Duelos Ganhos */}
                            <div>
                              <h3 className="font-semibold mb-3">Duelos Ganhos</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border bg-card">
                                  <div className="flex items-center gap-2 mb-2">
                                    {comparacao.fotoUsuario ? (
                                      <img
                                        src={comparacao.fotoUsuario}
                                        alt="Você"
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-4 w-4 text-primary" />
                                      </div>
                                    )}
                                    <p className="text-sm font-medium">Você</p>
                                  </div>
                                  <p className="text-3xl font-bold text-primary">{comparacao.duelosGanhosUsuario}</p>
                                  <p className="text-xs text-muted-foreground mt-1">vitórias</p>
                                </div>
                                <div className="p-4 rounded-lg border bg-card">
                                  <div className="flex items-center gap-2 mb-2">
                                    {comparacao.fotoRival ? (
                                      <img
                                        src={comparacao.fotoRival}
                                        alt={comparacao.nomeRival}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                                        <User className="h-4 w-4 text-destructive" />
                                      </div>
                                    )}
                                    <p className="text-sm font-medium">{comparacao.nomeRival}</p>
                                  </div>
                                  <p className="text-3xl font-bold text-destructive">{comparacao.duelosGanhosRival}</p>
                                  <p className="text-xs text-muted-foreground mt-1">vitórias</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Convites Pendentes */}
                  {rivalidades.filter(r => r.status === 'PENDENTE' && r.perfil2 === userPerfilId).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Convites Pendentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {rivalidades
                            .filter(r => r.status === 'PENDENTE' && r.perfil2 === userPerfilId)
                            .map((rivalidade) => (
                              <div
                                key={rivalidade.id}
                                className="flex items-center justify-between p-4 rounded-lg border bg-card"
                              >
                                <div>
                                  <p className="font-medium">Convite de Rivalidade</p>
                                  <p className="text-sm text-muted-foreground">
                                    {rivalidade.nomePerfil1
                                      ? `Você recebeu um convite de rivalidade de ${rivalidade.nomePerfil1}`
                                      : 'Você recebeu um convite de rivalidade'}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAceitarConvite(rivalidade)}
                                  >
                                    Aceitar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRecusarConvite(rivalidade)}
                                  >
                                    Recusar
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Lista de Amigos para Enviar Convite */}
                  {!rivalidadeAtiva && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Enviar Convite de Rivalidade</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {amigos.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>Você precisa ter amigos para enviar convites de rivalidade.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {amigos.map((amigo) => {
                              // Verificar se já existe rivalidade ativa com este amigo
                              // Permitir múltiplos convites pendentes, mas apenas uma rivalidade ativa
                              const perfilAmigoId = perfisAmigos.get(amigo.usuarioEmail);
                              const temRivalidadeAtiva = perfilAmigoId && rivalidades.some(r => {
                                const isParticipante = (r.perfil1 === userPerfilId && r.perfil2 === perfilAmigoId) ||
                                  (r.perfil2 === userPerfilId && r.perfil1 === perfilAmigoId);
                                return isParticipante && r.status === 'ATIVA';
                              });

                              // Verificar se já existe convite pendente enviado por este usuário
                              const convitePendente = perfilAmigoId && rivalidades.find(r => {
                                return r.perfil1 === userPerfilId &&
                                  r.perfil2 === perfilAmigoId &&
                                  r.status === 'PENDENTE';
                              });

                              return (
                                <div
                                  key={amigo.usuarioEmail}
                                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{amigo.nome}</p>
                                      <p className="text-sm text-muted-foreground">{amigo.usuarioEmail}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {convitePendente && (
                                      <span className="text-sm text-muted-foreground">
                                        Convite enviado
                                      </span>
                                    )}
                                    {convitePendente ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleCancelarConvite(convitePendente)}
                                      >
                                        Cancelar
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={() => handleEnviarConvite(amigo)}
                                        disabled={!!temRivalidadeAtiva}
                                      >
                                        {temRivalidadeAtiva ? 'Rivalidade Ativa' : 'Enviar Convite'}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </>
          )}

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
                  {carregandoDesempenho ? (
                    <p className="text-sm text-muted-foreground">Carregando...</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      sequencia semanal : {frequenciaSemanal}/{metaSemanal}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção Minhas Equipes */}
          <Card>
            <CardHeader>
              <CardTitle>Minhas Equipes</CardTitle>
            </CardHeader>
            <CardContent>
              {carregandoEquipes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Carregando equipes...</span>
                </div>
              ) : erroEquipes ? (
                <div className="text-center py-8 text-destructive">
                  <p>{erroEquipes}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={carregarEquipes}
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : equipes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Você ainda não está em nenhuma equipe.</p>
                  <p className="text-sm mt-2">Crie uma equipe ou peça para ser adicionado a uma!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {equipes.map((equipe) => (
                    <button
                      key={equipe.id}
                      onClick={() => navigate(`/equipe/${equipe.id}`)}
                      className="w-full flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <span className="font-medium block">{equipe.nome}</span>
                        {equipe.descricao && (
                          <span className="text-sm text-muted-foreground block mt-1">{equipe.descricao}</span>
                        )}
                        <span className="text-xs text-muted-foreground block mt-1">
                          {equipe.quantidadeMembros} {equipe.quantidadeMembros === 1 ? 'membro' : 'membros'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
                    <div className="flex items-center justify-center gap-4 text-green-600 font-semibold mt-3">
                      <span className="text-lg">+{recompensaMoedas} moedas</span>
                      <span className="text-lg">+{recompensaXp} XP</span>
                    </div>
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

      {/* Dialog de Criar Equipe */}
      <Dialog open={modalCriarEquipeAberto} onOpenChange={setModalCriarEquipeAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Equipe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="nomeEquipe" className="text-sm font-medium">
                Nome da Equipe *
              </label>
              <Input
                id="nomeEquipe"
                type="text"
                placeholder="Digite o nome da equipe"
                value={nomeNovaEquipe}
                onChange={(e) => {
                  setNomeNovaEquipe(e.target.value);
                  setErroCriarEquipe(null);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCriarEquipe();
                  }
                }}
                disabled={criandoEquipe}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="descricaoEquipe" className="text-sm font-medium">
                Descrição (opcional)
              </label>
              <Input
                id="descricaoEquipe"
                type="text"
                placeholder="Digite uma descrição para a equipe"
                value={descricaoNovaEquipe}
                onChange={(e) => {
                  setDescricaoNovaEquipe(e.target.value);
                  setErroCriarEquipe(null);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCriarEquipe();
                  }
                }}
                disabled={criandoEquipe}
                className="mt-1"
              />
            </div>
            {erroCriarEquipe && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between">
                <span>{erroCriarEquipe}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setErroCriarEquipe(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setModalCriarEquipeAberto(false);
                  setNomeNovaEquipe('');
                  setDescricaoNovaEquipe('');
                  setErroCriarEquipe(null);
                }}
                disabled={criandoEquipe}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCriarEquipe}
                disabled={criandoEquipe || !nomeNovaEquipe.trim()}
              >
                {criandoEquipe ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Equipe'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Enviar Convite de Rivalidade */}
      <Dialog
        open={modalEnviarConvite}
        onOpenChange={(open) => {
          setModalEnviarConvite(open);
          if (!open) {
            setErroRivalidade(null);
            setAmigoSelecionado(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Convite de Rivalidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {amigoSelecionado && (
              <div className="p-4 rounded-lg border bg-card">
                <p className="font-medium">{amigoSelecionado.nome}</p>
                <p className="text-sm text-muted-foreground">{amigoSelecionado.usuarioEmail}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Você está prestes a enviar um convite de rivalidade. O seu amigo precisará aceitar para que a rivalidade comece.
            </p>
            {erroRivalidade && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
                {erroRivalidade}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setModalEnviarConvite(false);
                  setAmigoSelecionado(null);
                  setErroRivalidade(null);
                }}
                disabled={enviandoConvite}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarEnviarConvite}
                disabled={enviandoConvite || !amigoSelecionado}
              >
                {enviandoConvite ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Convite'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

