import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  role: 'citizen' | 'admin' | 'bourgmestre'
  commune_id: string | null
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔍 useAuth-simple: Initialisation')
    
    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 useAuth-simple: Session initiale:', !!session)
      setSession(session)
      if (session?.user) {
        console.log('🔍 useAuth-simple: Utilisateur trouvé, récupération profil...')
        fetchUserProfile(session.user.id)
      } else {
        console.log('🔍 useAuth-simple: Aucune session, loading = false')
        setLoading(false)
      }
    })

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 useAuth-simple: Événement auth state change:', event, !!session)
      setSession(session)
      if (session?.user) {
        console.log('🔍 useAuth-simple: Nouvelle session, récupération profil...')
        await fetchUserProfile(session.user.id)
      } else {
        console.log('🔍 useAuth-simple: Session supprimée, reset user')
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    console.log('🔍 fetchUserProfile-simple: Début pour userId:', userId)
    
    try {
      // Ajouter un timeout pour éviter le blocage infini
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 10000) // 10 secondes
      })
      
      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

      if (error) {
        console.error('❌ fetchUserProfile-simple: Erreur récupération profil:', error)
        setUser(null)
      } else {
        console.log('✅ fetchUserProfile-simple: Profil récupéré avec succès:', data)
        setUser(data)
      }
    } catch (error) {
      console.error('❌ fetchUserProfile-simple: Erreur générale:', error)
      setUser(null)
    } finally {
      console.log('🔍 fetchUserProfile-simple: Fin, loading = false')
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔍 signIn-simple: Début pour email:', email)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ signIn-simple: Erreur de connexion:', error)
        throw error
      }

      console.log('✅ signIn-simple: Connexion réussie, data:', data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ signIn-simple: Erreur générale:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    console.log('🔍 signOut-simple: Début')
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setSession(null)
      console.log('✅ signOut-simple: Déconnexion réussie')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Logs pour le debugging
  console.log('🔍 useAuth-simple: État actuel - user:', !!user, 'loading:', loading, 'isAuthenticated:', !!user)

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isBourgmestre: user?.role === 'bourgmestre',
    isCitizen: user?.role === 'citizen',
  }
} 