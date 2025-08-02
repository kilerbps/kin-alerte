import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'admin' | 'bourgmestre' | 'citizen'
  fallbackPath?: string
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  fallbackPath = '/auth' 
}: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated, isAdmin, isBourgmestre } = useAuth()

  console.log('🔍 ProtectedRoute: État - loading:', loading, 'user:', !!user, 'isAuthenticated:', isAuthenticated, 'requiredRole:', requiredRole)

  // Afficher un loader pendant le chargement
  if (loading) {
    console.log('🔍 ProtectedRoute: Affichage du loader')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />
  }

  // Vérifier les rôles si spécifiés
  if (requiredRole) {
    const hasRequiredRole = 
      requiredRole === 'admin' ? isAdmin :
      requiredRole === 'bourgmestre' ? isBourgmestre :
      true // citizen ou pas de rôle requis

    if (!hasRequiredRole) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}

// Composants spécialisés pour chaque rôle
export const AdminRoute = ({ children, fallbackPath }: Omit<ProtectedRouteProps, 'requiredRole'>) => (
  <ProtectedRoute requiredRole="admin" fallbackPath={fallbackPath}>
    {children}
  </ProtectedRoute>
)

export const BourgmestreRoute = ({ children, fallbackPath }: Omit<ProtectedRouteProps, 'requiredRole'>) => (
  <ProtectedRoute requiredRole="bourgmestre" fallbackPath={fallbackPath}>
    {children}
  </ProtectedRoute>
)

export const AuthRoute = ({ children, fallbackPath }: Omit<ProtectedRouteProps, 'requiredRole'>) => (
  <ProtectedRoute requiredRole="citizen" fallbackPath={fallbackPath}>
    {children}
  </ProtectedRoute>
) 