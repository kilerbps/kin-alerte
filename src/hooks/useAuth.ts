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
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ useAuth-simple: Erreur récupération session initiale:', error)
          setLoading(false)
          return
        }

        console.log('🔍 useAuth-simple: Session initiale:', !!session)
        setSession(session)
        
        if (session?.user) {
          console.log('🔍 useAuth-simple: Utilisateur trouvé, récupération profil...')
          await fetchUserProfile(session.user.id)
        } else {
          console.log('🔍 useAuth-simple: Aucune session, loading = false')
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ useAuth-simple: Erreur initialisation:', error)
        setLoading(false)
      }
    }

    initializeAuth()

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 useAuth-simple: Événement auth state change:', event, !!session)
      
      // Gérer les différents événements
      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
          setSession(session)
          if (session?.user) {
            console.log('🔍 useAuth-simple: Nouvelle session, récupération profil...')
            await fetchUserProfile(session.user.id)
          }
          break
          
        case 'SIGNED_OUT':
          console.log('🔍 useAuth-simple: Déconnexion détectée')
          setSession(null)
          setUser(null)
          setLoading(false)
          break
          
        case 'USER_UPDATED':
          setSession(session)
          if (session?.user) {
            await fetchUserProfile(session.user.id)
          }
          break
          
        default:
          setSession(session)
          if (session?.user) {
            await fetchUserProfile(session.user.id)
          } else {
            setUser(null)
            setLoading(false)
          }
      }
    })

    // Refresh automatique du token toutes les 30 minutes
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.log('🔄 useAuth-simple: Refresh automatique du token')
          await supabase.auth.refreshSession()
        }
      } catch (error) {
        console.error('❌ useAuth-simple: Erreur refresh automatique:', error)
      }
    }, 30 * 60 * 1000) // 30 minutes

    return () => {
      subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    console.log('🔍 fetchUserProfile-simple: Début pour userId:', userId)
    
    // Éviter les appels multiples pour le même utilisateur
    if (user && user.id === userId) {
      console.log('🔍 fetchUserProfile-simple: Utilisateur déjà chargé, skip')
      return;
    }
    
    try {
      // Ajouter un timeout pour éviter le blocage infini
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000) // 5 secondes au lieu de 10
      })
      
      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

      if (error) {
        console.error('❌ fetchUserProfile-simple: Erreur récupération profil:', error)
        
        // Si l'utilisateur n'existe pas, essayer de le créer
        if (error.code === 'PGRST116') {
          console.log('🔄 Tentative de création du profil utilisateur...')
          
          // Récupérer les informations de la session
          const { data: { session } } = await supabase.auth.getSession()
          const userEmail = session?.user?.email || 'unknown@email.com'
          const userMetadata = session?.user?.user_metadata || {}
          
          // Vérifier si l'email existe déjà
          const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('email')
            .eq('email', userEmail)
          
          let finalEmail = userEmail
          if (!checkError && existingUsers && existingUsers.length > 0) {
            // Email existe déjà, créer un email unique
            const timestamp = Date.now()
            finalEmail = `${userEmail.split('@')[0]}_${timestamp}@${userEmail.split('@')[1]}`
            console.log(`⚠️  Email ${userEmail} existe déjà, utilisation: ${finalEmail}`)
          }
          
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: finalEmail,
              full_name: userMetadata.full_name || 'Utilisateur',
              role: 'citizen',
              commune_id: userMetadata.commune_id || null,
              phone: userMetadata.phone || null
            })
            .select()
            .single()
          
          if (createError) {
            console.error('❌ fetchUserProfile-simple: Erreur création profil:', createError)
            // Ne pas déconnecter, juste afficher l'erreur
          } else {
            console.log('✅ fetchUserProfile-simple: Profil créé avec succès:', newUser)
            setUser(newUser)
          }
        } else {
          console.error('❌ fetchUserProfile-simple: Erreur non gérée:', error)
        }
      } else {
        console.log('✅ fetchUserProfile-simple: Profil récupéré avec succès:', data)
        setUser(data)
      }
    } catch (error) {
      console.error('❌ fetchUserProfile-simple: Erreur générale:', error)
      // Ne pas déconnecter automatiquement en cas d'erreur
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
    console.log('🔍 signOut-simple: Début déconnexion')
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ signOut-simple: Erreur déconnexion:', error)
        throw error
      }
      console.log('✅ signOut-simple: Déconnexion réussie')
    } catch (error) {
      console.error('❌ signOut-simple: Erreur générale:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: {
    full_name: string
    phone?: string
    commune_id?: string
  }) => {
    console.log('🔍 signUp-simple: Début inscription pour email:', email)
    try {
      // URL de redirection pour la confirmation d'email
      const redirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || 
                         `${window.location.origin}/auth?confirm=true`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            phone: userData.phone,
            commune_id: userData.commune_id,
          },
          emailRedirectTo: redirectUrl
        }
      })

      if (error) {
        console.error('❌ signUp-simple: Erreur inscription:', error)
        throw error
      }

      console.log('✅ signUp-simple: Inscription réussie, data:', data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ signUp-simple: Erreur générale:', error)
      return { data: null, error }
    }
  }

  const resetPassword = async (email: string) => {
    console.log('🔍 resetPassword-simple: Début réinitialisation pour email:', email)
    try {
      // Utiliser l'URL de production si disponible, sinon l'origine actuelle
      const redirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || 
                         import.meta.env.VITE_RESET_PASSWORD_URL || 
                         `${window.location.origin}/auth?reset=true`;
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      })

      if (error) {
        console.error('❌ resetPassword-simple: Erreur réinitialisation:', error)
        throw error
      }

      console.log('✅ resetPassword-simple: Email de réinitialisation envoyé')
      return { data, error: null }
    } catch (error) {
      console.error('❌ resetPassword-simple: Erreur générale:', error)
      return { data: null, error }
    }
  }

  const updatePassword = async (newPassword: string) => {
    console.log('🔍 updatePassword-simple: Début mise à jour mot de passe')
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('❌ updatePassword-simple: Erreur mise à jour:', error)
        throw error
      }

      console.log('✅ updatePassword-simple: Mot de passe mis à jour')
      return { data, error: null }
    } catch (error) {
      console.error('❌ updatePassword-simple: Erreur générale:', error)
      return { data: null, error }
    }
  }

  console.log('🔍 useAuth-simple: État actuel - user:', !!user, 'loading:', loading, 'isAuthenticated:', !!user)

  return {
    user, session, loading, signIn, signOut, signUp, resetPassword, updatePassword,
    isAuthenticated: !!user, isAdmin: user?.role === 'admin',
    isBourgmestre: user?.role === 'bourgmestre', isCitizen: user?.role === 'citizen',
  }
} 