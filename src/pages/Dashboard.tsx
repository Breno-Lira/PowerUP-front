import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">PowerUP</h1>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo, {user.username || user.email}!</CardTitle>
            <CardDescription>
              Seu painel de controle do PowerUP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Esta é a página inicial do dashboard. Aqui você poderá ver suas estatísticas,
              treinos, metas e muito mais!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



