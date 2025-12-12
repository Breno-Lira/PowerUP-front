import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { avatarService, AvatarResumo, perfilService, PerfilResumo } from '@/services/api';

interface UserInfoHeaderProps {
  className?: string;
  variant?: 'inline' | 'card';
}

// Cabeçalho reutilizável com info do usuário logado (nome, email, nível e XP)
export function UserInfoHeader({ className = '', variant = 'inline' }: UserInfoHeaderProps) {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const perfilId = userData?.perfilId;
  const userEmail = userData?.email;

  const [perfil, setPerfil] = useState<PerfilResumo | null>(null);
  const [avatar, setAvatar] = useState<AvatarResumo | null>(null);

  useEffect(() => {
    if (!perfilId || !userEmail) return;

    const carregar = async () => {
      try {
        const [perfilResp, avatarResp] = await Promise.all([
          perfilService.obterPorId(perfilId),
          avatarService.obterPorPerfilId(perfilId),
        ]);
        setPerfil(perfilResp);
        setAvatar(avatarResp);
      } catch (error) {
        console.error('Erro ao carregar info do usuário:', error);
      }
    };

    carregar();
  }, [perfilId, userEmail]);

  if (!perfilId || !userEmail) return null;

  const xpTotal = avatar ? (avatar.experiencia ?? 0) : 0;

  const baseClasses =
    variant === 'card'
      ? 'flex items-center justify-between gap-4 bg-background border rounded-lg px-4 py-3'
      : 'flex items-center gap-3';

  return (
    <div className={`${baseClasses} ${className}`}>
      <Avatar className="h-10 w-10">
        <AvatarImage src={perfil?.foto || undefined} alt={perfil?.username || 'Usuário'} />
        <AvatarFallback className="bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </AvatarFallback>
      </Avatar>
      <div className="leading-tight">
        <p className="font-semibold text-sm truncate">{perfil?.username || userData.username || 'Usuário'}</p>
        <p className="text-xs text-muted-foreground truncate">{userEmail || 'email@exemplo.com'}</p>
        <p className="text-xs text-muted-foreground flex gap-2">
          <span>Nível {avatar?.nivel ?? 1}</span>
          <span>·</span>
          <span>{xpTotal.toLocaleString('pt-BR')} XP</span>
        </p>
      </div>
    </div>
  );
}

