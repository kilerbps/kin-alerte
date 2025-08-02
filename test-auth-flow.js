import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

// Créer le client Supabase avec la clé anonyme (comme dans l'app)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuthFlow() {
  console.log('🔍 Test du flux d\'authentification')
  console.log('=' .repeat(50))
  
  // Test 1: Connexion avec le compte citoyen
  console.log('\n👤 Test 1: Connexion citoyen')
  console.log('Email: citoyen@kinshasa-alerte.rdc')
  console.log('Mot de passe: citoyen123456')
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'citoyen@kinshasa-alerte.rdc',
      password: 'citoyen123456'
    })
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message)
      return
    }
    
    console.log('✅ Connexion réussie!')
    console.log('User ID:', data.user.id)
    console.log('Email:', data.user.email)
    console.log('Session:', !!data.session)
    
    // Test 2: Récupération du profil utilisateur
    console.log('\n📋 Test 2: Récupération du profil')
    
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Erreur récupération profil:', profileError.message)
    } else {
      console.log('✅ Profil récupéré:')
      console.log('  - Nom:', profile.full_name)
      console.log('  - Rôle:', profile.role)
      console.log('  - Commune ID:', profile.commune_id)
    }
    
    // Test 3: Vérification des permissions
    console.log('\n🔐 Test 3: Vérification des permissions')
    
    const isAdmin = profile?.role === 'admin'
    const isBourgmestre = profile?.role === 'bourgmestre'
    const isCitizen = profile?.role === 'citizen'
    
    console.log('  - Admin:', isAdmin)
    console.log('  - Bourgmestre:', isBourgmestre)
    console.log('  - Citoyen:', isCitizen)
    
    // Test 4: Déconnexion
    console.log('\n🚪 Test 4: Déconnexion')
    
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.error('❌ Erreur déconnexion:', signOutError.message)
    } else {
      console.log('✅ Déconnexion réussie')
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

async function testAllAccounts() {
  console.log('\n🔄 Test de tous les comptes')
  console.log('=' .repeat(30))
  
  const accounts = [
    {
      email: 'admin@kinshasa-alerte.rdc',
      password: 'admin123456',
      role: 'admin'
    },
    {
      email: 'bourgmestre.gombe@kinshasa-alerte.rdc',
      password: 'bourg123456',
      role: 'bourgmestre'
    },
    {
      email: 'citoyen@kinshasa-alerte.rdc',
      password: 'citoyen123456',
      role: 'citizen'
    }
  ]
  
  for (const account of accounts) {
    console.log(`\n👤 Test de ${account.email} (${account.role})`)
    
    try {
      // Connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      })
      
      if (error) {
        console.error(`❌ Erreur connexion ${account.email}:`, error.message)
        continue
      }
      
      console.log(`✅ Connexion réussie pour ${account.email}`)
      
      // Récupération profil
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      if (profileError) {
        console.error(`❌ Erreur profil ${account.email}:`, profileError.message)
      } else {
        console.log(`✅ Profil OK: ${profile.full_name} (${profile.role})`)
      }
      
      // Déconnexion
      await supabase.auth.signOut()
      console.log(`✅ Déconnexion réussie pour ${account.email}`)
      
    } catch (error) {
      console.error(`❌ Erreur générale pour ${account.email}:`, error.message)
    }
  }
}

async function analyzeAuthLogic() {
  console.log('\n🧠 Analyse de la logique d\'authentification')
  console.log('=' .repeat(50))
  
  console.log('\n📋 Flux de connexion:')
  console.log('1. Utilisateur entre email + mot de passe')
  console.log('2. signInWithPassword() appelé avec Supabase')
  console.log('3. Si succès, session créée automatiquement')
  console.log('4. onAuthStateChange() déclenché')
  console.log('5. fetchUserProfile() récupère les données utilisateur')
  console.log('6. User state mis à jour avec le profil complet')
  console.log('7. Navigation conditionnelle selon le rôle')
  
  console.log('\n🎯 Redirection après connexion:')
  console.log('- Tous les utilisateurs → navigate("/") (page d\'accueil)')
  console.log('- Pas de redirection automatique vers les dashboards')
  console.log('- L\'utilisateur doit cliquer sur les liens dans la navigation')
  
  console.log('\n🔗 Liens disponibles selon le rôle:')
  console.log('👨‍💼 Admin:')
  console.log('  - Dashboard Admin (/admin)')
  console.log('  - Toutes les pages publiques')
  
  console.log('🏛️  Bourgmestre:')
  console.log('  - Dashboard Bourgmestre (/bourgmestre)')
  console.log('  - Toutes les pages publiques')
  
  console.log('👤 Citoyen:')
  console.log('  - Formulaire de signalement (/signaler)')
  console.log('  - Toutes les pages publiques')
  console.log('  - PAS d\'accès aux dashboards admin/bourgmestre')
  
  console.log('\n⚠️  Points d\'attention:')
  console.log('- La redirection se fait vers "/" (page d\'accueil)')
  console.log('- Pas de redirection automatique vers les dashboards')
  console.log('- L\'utilisateur doit utiliser la navigation pour accéder aux dashboards')
  console.log('- Les dashboards sont protégés par ProtectedRoute')
}

async function main() {
  console.log('🚀 Test complet de l\'authentification Kinshasa-Alerte')
  console.log('=' .repeat(60))
  
  // Analyser la logique
  await analyzeAuthLogic()
  
  // Tester le flux d'authentification
  await testAuthFlow()
  
  // Tester tous les comptes
  await testAllAccounts()
  
  console.log('\n🎉 Tests terminés!')
  console.log('\n📋 Résumé:')
  console.log('- Après connexion → Page d\'accueil (/)')
  console.log('- Utilisez la navigation pour accéder aux dashboards')
  console.log('- Les rôles déterminent les liens disponibles')
}

main().catch(console.error) 