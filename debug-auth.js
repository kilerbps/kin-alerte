import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugAuthFlow() {
  console.log('🔍 Diagnostic du flux d\'authentification')
  console.log('=' .repeat(50))
  
  // Test 1: Connexion avec mauvais mot de passe
  console.log('\n❌ Test 1: Mauvais mot de passe')
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'citoyen@kinshasa-alerte.rdc',
      password: 'mauvais_mot_de_passe'
    })
    
    if (error) {
      console.log('✅ Erreur attendue:', error.message)
    } else {
      console.log('❌ Problème: Connexion réussie avec mauvais mot de passe')
    }
  } catch (error) {
    console.log('✅ Erreur capturée:', error.message)
  }
  
  // Test 2: Connexion avec bon mot de passe
  console.log('\n✅ Test 2: Bon mot de passe')
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
    
    // Test 3: Récupération du profil utilisateur
    console.log('\n📋 Test 3: Récupération du profil')
    
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Erreur récupération profil:', profileError.message)
      console.error('Code d\'erreur:', profileError.code)
      console.error('Détails:', profileError.details)
      console.error('Hint:', profileError.hint)
    } else {
      console.log('✅ Profil récupéré:')
      console.log('  - Nom:', profile.full_name)
      console.log('  - Rôle:', profile.role)
      console.log('  - Commune ID:', profile.commune_id)
    }
    
    // Test 4: Vérification de la session
    console.log('\n🔐 Test 4: Vérification de la session')
    
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Session active:', !!session)
    if (session) {
      console.log('User ID dans session:', session.user.id)
    }
    
    // Test 5: Déconnexion
    console.log('\n🚪 Test 5: Déconnexion')
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

async function testAllUsers() {
  console.log('\n🔄 Test de tous les utilisateurs')
  console.log('=' .repeat(40))
  
  const users = [
    { email: 'admin@kinshasa-alerte.rdc', password: 'admin123456', role: 'admin' },
    { email: 'bourgmestre.gombe@kinshasa-alerte.rdc', password: 'bourg123456', role: 'bourgmestre' },
    { email: 'citoyen@kinshasa-alerte.rdc', password: 'citoyen123456', role: 'citizen' }
  ]
  
  for (const user of users) {
    console.log(`\n👤 Test de ${user.email} (${user.role})`)
    
    try {
      // Connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })
      
      if (error) {
        console.error(`❌ Erreur connexion:`, error.message)
        continue
      }
      
      console.log(`✅ Connexion réussie`)
      
      // Récupération profil
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      if (profileError) {
        console.error(`❌ Erreur profil:`, profileError.message)
        console.error(`Code:`, profileError.code)
      } else {
        console.log(`✅ Profil OK: ${profile.full_name} (${profile.role})`)
      }
      
      // Déconnexion
      await supabase.auth.signOut()
      console.log(`✅ Déconnexion réussie`)
      
    } catch (error) {
      console.error(`❌ Erreur générale:`, error.message)
    }
  }
}

async function checkDatabaseConnection() {
  console.log('\n🗄️ Test de connexion à la base de données')
  console.log('=' .repeat(40))
  
  try {
    // Test simple de lecture
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Erreur connexion DB:', error.message)
      console.error('Code:', error.code)
      console.error('Détails:', error.details)
    } else {
      console.log('✅ Connexion DB OK')
    }
    
    // Vérifier la structure de la table users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .limit(3)
    
    if (usersError) {
      console.error('❌ Erreur lecture users:', usersError.message)
    } else {
      console.log('✅ Table users accessible')
      console.log('Utilisateurs trouvés:', users.length)
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erreur générale DB:', error.message)
  }
}

async function main() {
  console.log('🚀 Diagnostic complet de l\'authentification')
  console.log('=' .repeat(60))
  
  await checkDatabaseConnection()
  await debugAuthFlow()
  await testAllUsers()
  
  console.log('\n🎯 Diagnostic terminé!')
  console.log('\n📋 Prochaines étapes:')
  console.log('1. Vérifiez les erreurs dans la console du navigateur')
  console.log('2. Vérifiez les logs de Supabase')
  console.log('3. Testez la connexion dans l\'application')
}

main().catch(console.error) 