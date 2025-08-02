import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, AlertTriangle, CheckCircle } from 'lucide-react';

interface SessionInfo {
  isActive: boolean;
  expiresAt: Date | null;
  timeRemaining: string;
  lastActivity: Date;
  refreshCount: number;
}

export const SessionMonitor = () => {
  const { user, session, isAuthenticated } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({
    isActive: false,
    expiresAt: null,
    timeRemaining: '',
    lastActivity: new Date(),
    refreshCount: 0
  });
  const [showMonitor, setShowMonitor] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const updateSessionInfo = () => {
      if (session) {
        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        
        setSessionInfo({
          isActive: timeRemaining > 0,
          expiresAt,
          timeRemaining: timeRemaining > 0 
            ? `${Math.floor(timeRemaining / 60000)}m ${Math.floor((timeRemaining % 60000) / 1000)}s`
            : 'Expirée',
          lastActivity: now,
          refreshCount: sessionInfo.refreshCount
        });
      }
    };

    // Mise à jour initiale
    updateSessionInfo();

    // Mise à jour toutes les 30 secondes
    const interval = setInterval(updateSessionInfo, 30000);

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔍 SessionMonitor: Événement détecté:', event);
      
      if (event === 'TOKEN_REFRESHED') {
        setSessionInfo(prev => ({
          ...prev,
          refreshCount: prev.refreshCount + 1,
          lastActivity: new Date()
        }));
      }
      
      updateSessionInfo();
    });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [session, isAuthenticated]);

  // Afficher le moniteur seulement si l'utilisateur appuie sur Ctrl+Shift+S
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        setShowMonitor(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!showMonitor || !isAuthenticated) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Moniteur de Session
          </CardTitle>
          <CardDescription className="text-xs">
            Ctrl+Shift+S pour masquer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Statut de la session */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Statut:</span>
            <Badge variant={sessionInfo.isActive ? "default" : "destructive"}>
              {sessionInfo.isActive ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Expirée
                </>
              )}
            </Badge>
          </div>

          {/* Temps restant */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Expire dans:</span>
            <span className={`text-sm ${sessionInfo.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {sessionInfo.timeRemaining}
            </span>
          </div>

          {/* Date d'expiration */}
          {sessionInfo.expiresAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expire le:</span>
              <span className="text-xs text-gray-600">
                {sessionInfo.expiresAt.toLocaleString('fr-FR')}
              </span>
            </div>
          )}

          {/* Dernière activité */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Dernière activité:</span>
            <span className="text-xs text-gray-600">
              {sessionInfo.lastActivity.toLocaleTimeString('fr-FR')}
            </span>
          </div>

          {/* Nombre de refresh */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Refreshs:</span>
            <span className="text-xs text-blue-600 font-mono">
              {sessionInfo.refreshCount}
            </span>
          </div>

          {/* Informations utilisateur */}
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{user?.full_name}</span>
            </div>
            <div className="text-xs text-gray-500 ml-6">
              {user?.email} • {user?.role}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 