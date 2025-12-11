import { useState, useEffect } from 'react';
import { Menu, Plus, Pencil, Trash2, User, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { feedbackService, perfilService, ClassificacaoFeedback, PerfilResumo } from '@/services/api';
import { UserInfoHeader } from '@/components/UserInfoHeader';

interface Feedback {
  id: number;
  frequencia: number;
  classificacao: ClassificacaoFeedback;
  feedback: string;
  email: string;
  data: string;
}

export function Feedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [feedbackEditando, setFeedbackEditando] = useState<Feedback | null>(null);
  const [novaClassificacao, setNovaClassificacao] = useState<ClassificacaoFeedback>('Bom');
  const [novaDescricao, setNovaDescricao] = useState('');

  // Obter dados do usuário logado
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = userData?.email;
  const [perfilUsuario, setPerfilUsuario] = useState<PerfilResumo | null>(null);

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

  useEffect(() => {
    // Carregar perfil para obter foto
    if (userData?.perfilId) {
      perfilService.obterPorId(userData.perfilId)
        .then(setPerfilUsuario)
        .catch(console.error);
    }
    
    carregarFeedbacks();
  }, [userData?.perfilId]);

  const carregarFeedbacks = async () => {
    if (!userEmail) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const dados = await feedbackService.listarPorUsuario(userEmail);
      setFeedbacks(dados);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar feedbacks');
      console.error('Erro ao carregar feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dataString;
    }
  };

  const getSensacaoLabel = (sensacao: ClassificacaoFeedback) => {
    const labels: Record<ClassificacaoFeedback, string> = {
      Excelente: 'Excelente',
      Cansado: 'Cansado',
      ComDor: 'Com dor',
      Bom: 'Bom',
    };
    return labels[sensacao] || sensacao;
  };

  const getSensacaoVariant = (sensacao: ClassificacaoFeedback) => {
    const variants: Record<ClassificacaoFeedback, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      Excelente: 'default',
      Cansado: 'secondary',
      ComDor: 'destructive',
      Bom: 'default',
    };
    return variants[sensacao] || 'default';
  };

  const handleNovoFeedback = () => {
    setFeedbackEditando(null);
    setNovaClassificacao('Bom');
    setNovaDescricao('');
    setShowDialog(true);
  };

  const handleEditar = (feedback: Feedback) => {
    setFeedbackEditando(feedback);
    setNovaClassificacao(feedback.classificacao);
    setNovaDescricao(feedback.feedback);
    setShowDialog(true);
  };

  const handleSalvar = async () => {
    if (!userEmail) {
      setError('Usuário não autenticado');
      return;
    }

    if (!novaDescricao.trim()) {
      setError('A descrição é obrigatória');
      return;
    }

    try {
      setError('');
      if (feedbackEditando) {
        // Modificar feedback existente
        await feedbackService.modificar(feedbackEditando.id, {
          classificacao: novaClassificacao,
          descricao: novaDescricao,
        });
      } else {
        // Criar novo feedback
        await feedbackService.criar({
          frequenciaId: 1, // Valor padrão, será gerado automaticamente pelo backend
          email: userEmail,
          classificacao: novaClassificacao,
          descricao: novaDescricao,
        });
      }
      setShowDialog(false);
      await carregarFeedbacks();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar feedback');
      console.error('Erro ao salvar feedback:', err);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este feedback?')) {
      return;
    }

    try {
      setError('');
      await feedbackService.excluir(id);
      await carregarFeedbacks();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir feedback');
      console.error('Erro ao excluir feedback:', err);
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
          <div className="ml-auto hidden sm:block">
            <UserInfoHeader variant="inline" />
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header da Página */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Feedback de treino</h1>
          <p className="text-muted-foreground">Registre sua sensação pós-treino!</p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Botão Novo Feedback */}
        <Button className="w-full" size="lg" onClick={handleNovoFeedback}>
          <Plus className="h-5 w-5 mr-2" />
          Novo Feedback
        </Button>

        {/* Histórico de Feedbacks */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Histórico de Feedbacks</h2>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum feedback registrado ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <Card key={feedback.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={getSensacaoVariant(feedback.classificacao)}>
                            {getSensacaoLabel(feedback.classificacao)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatarData(feedback.data)}
                        </p>
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
                          onClick={() => handleEditar(feedback)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{feedback.feedback}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog para Criar/Editar Feedback */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {feedbackEditando ? 'Editar Feedback' : 'Novo Feedback'}
            </DialogTitle>
            <DialogDescription>
              {feedbackEditando
                ? 'Atualize as informações do seu feedback de treino.'
                : 'Registre sua sensação após o treino.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="classificacao">Sensação</Label>
              <select
                id="classificacao"
                value={novaClassificacao}
                onChange={(e) => setNovaClassificacao(e.target.value as ClassificacaoFeedback)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="Excelente">Excelente</option>
                <option value="Bom">Bom</option>
                <option value="Cansado">Cansado</option>
                <option value="ComDor">Com dor</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva como foi seu treino..."
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
