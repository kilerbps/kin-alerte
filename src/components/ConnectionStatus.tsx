import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface ConnectionStatus {
  supabase: 'connected' | 'disconnected' | 'checking';
  auth: 'authenticated' | 'unauthenticated' | 'checking';
  user: 'loaded' | 'loading' | 'error';
  database: 'accessible' | 'inaccessible' | 'checking';
}

export const ConnectionStatus = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [status, setStatus] = useState<ConnectionStatus>({
    supabase: 'checking',
    auth: 'checking',
    user: 'loading',
    database: 'checking'
  });
  const [showDetails, setShowDetails] = useState(false);

  const checkConnection = async () => {
    console.log('🔍 ConnectionStatus: Vérification de la connexion...');
    
    // Vérifier la connexion Supabase
    try {
      const { data, error } = await supabase.from('reports').select('count').limit(1);
      setStatus(prev => ({
        ...prev,
        supabase: error ? 'disconnected' : 'connected',
        database: error ? 'inaccessible' : 'accessible'
      }));
      console.log('🔍 ConnectionStatus: Test Supabase:', error ? '❌' : '✅', error?.message || 'OK');
    } catch (error) {
      console.error('❌ ConnectionStatus: Erreur test Supabase:', error);
      setStatus(prev => ({
        ...prev,
        supabase: 'disconnected',
        database: 'inaccessible'
      }));
    }

    // Vérifier l'authentification
    const { data: { session } } = await supabase.auth.getSession();
    setStatus(prev => ({
      ...prev,
      auth: session ? 'authenticated' : 'unauthenticated'
    }));

    // Vérifier l'utilisateur
    setStatus(prev => ({
      ...prev,
      user: user ? 'loaded' : (loading ? 'loading' : 'error')
    }));
  };

  useEffect(() => {
    checkConnection();
  }, [user, isAuthenticated, loading]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'authenticated':
      case 'loaded':
      case 'accessible':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'checking':
      case 'loading':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'authenticated':
      case 'loaded':
      case 'accessible':
        return <Badge variant="default" className="bg-green-100 text-green-800">OK</Badge>;
      case 'checking':
      case 'loading':
        return <Badge variant="secondary">Vérification...</Badge>;
      default:
        return <Badge variant="destructive">Erreur</Badge>;
    }
  };

  if (!showDetails) {
    const hasErrors = Object.values(status).some(s => s === 'disconnected' || s === 'inaccessible' || s === 'error');
    
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(true)}
          className={`flex items-center gap-2 ${hasErrors ? 'border-red-500 text-red-600' : 'border-green-500 text-green-600'}`}
        >
          {hasErrors ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          Connexion
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            État de la Connexion
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </CardTitle>
          <CardDescription className="text-xs">
            Diagnostic de la connectivité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Supabase</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.supabase)}
              {getStatusBadge(status.supabase)}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Authentification</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.auth)}
              {getStatusBadge(status.auth)}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Utilisateur</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.user)}
              {getStatusBadge(status.user)}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Base de données</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.database)}
              {getStatusBadge(status.database)}
            </div>
          </div>

          {user && (
            <div className="pt-2 border-t">
              <div className="text-xs text-gray-600">
                <div>ID: {user.id}</div>
                <div>Rôle: {user.role || 'Non défini'}</div>
                <div>Email: {user.email || 'Non défini'}</div>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recharger
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}; 