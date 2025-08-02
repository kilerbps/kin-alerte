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
    console.log('🔍 useAuth: Initialisation du hook')
    
    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 useAuth: Session initiale récupérée:', !!session)
      setSession(session)
      if (session?.user) {
        console.log('🔍 useAuth: Utilisateur trouvé dans session, récupération du profil...')
        fetchUserProfile(session.user.id)
      } else {
        console.log('🔍 useAuth: Aucune session, loading = false')
        setLoading(false)
      }
    })

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 useAuth: Événement auth state change:', event, !!session)
      setSession(session)
      if (session?.user) {
        console.log('🔍 useAuth: Nouvelle session, récupération du profil...')
        await fetchUserProfile(session.user.id)
      } else {
        console.log('🔍 useAuth: Session supprimée, reset user')
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    console.log('🔍 fetchUserProfile: Début pour userId:', userId)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ fetchUserProfile: Erreur récupération profil:', error)
        setUser(null)
      } else {
        console.log('✅ fetchUserProfile: Profil récupéré avec succès:', data)
        setUser(data)
      }
    } catch (error) {
      console.error('❌ fetchUserProfile: Erreur générale:', error)
      setUser(null)
    } finally {
      console.log('🔍 fetchUserProfile: Fin, loading = false')
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<AuthUser>) => {
    console.log('🔍 signUp: Début pour email:', email)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            phone: userData.phone,
            role: userData.role || 'citizen',
            commune_id: userData.commune_id,
          },
        },
      })

      if (error) throw error

      // Créer le profil utilisateur dans la table users
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: userData.full_name,
              phone: userData.phone,
              role: userData.role || 'citizen',
              commune_id: userData.commune_id,
            },
          ])

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔍 signIn: Début pour email:', email)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ signIn: Erreur de connexion:', error)
        throw error
      }

      console.log('✅ signIn: Connexion réussie, data:', data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ signIn: Erreur générale:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    console.log('🔍 signOut: Début')
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setSession(null)
      console.log('✅ signOut: Déconnexion réussie')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) return { error: 'No user logged in' }

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setUser(data)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Logs pour le debugging
  console.log('🔍 useAuth: État actuel - user:', !!user, 'loading:', loading, 'isAuthenticated:', !!user)

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isBourgmestre: user?.role === 'bourgmestre',
    isCitizen: user?.role === 'citizen',
  }
} 