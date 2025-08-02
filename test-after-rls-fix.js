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

async function testAfterRLSFix() {
  console.log('🔍 Test après correction des politiques RLS')
  console.log('=' .repeat(50))
  
  // Test 1: Lecture sans authentification (devrait échouer)
  console.log('\n❌ Test 1: Lecture sans authentification')
  
  const { data: usersNotAuth, error: usersNotAuthError } = await supabase
    .from('users')
    .select('*')
    .limit(1)
  
  if (usersNotAuthError) {
    console.log('✅ Erreur attendue (accès refusé):', usersNotAuthError.message)
  } else {
    console.log('❌ Problème: Lecture réussie sans authentification')
    console.log('Données:', usersNotAuth)
  }
  
  // Test 2: Connexion citoyen
  console.log('\n👤 Test 2: Connexion citoyen')
  
  const { data: citizenAuth, error: citizenAuthError } = await supabase.auth.signInWithPassword({
    email: 'citoyen@kinshasa-alerte.rdc',
    password: 'citoyen123456'
  })
  
  if (citizenAuthError) {
    console.error('❌ Erreur connexion citoyen:', citizenAuthError)
    return
  }
  
  console.log('✅ Connexion citoyen réussie')
  
  // Test 3: Lecture profil citoyen (devrait réussir)
  console.log('\n📋 Test 3: Lecture profil citoyen')
  
  const { data: citizenProfile, error: citizenProfileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', citizenAuth.user.id)
    .single()
  
  if (citizenProfileError) {
    console.error('❌ Erreur lecture profil citoyen:', citizenProfileError)
  } else {
    console.log('✅ Lecture profil citoyen réussie')
    console.log('Profil:', citizenProfile)
  }
  
  // Test 4: Lecture tous les utilisateurs (devrait échouer pour citoyen)
  console.log('\n📋 Test 4: Lecture tous les utilisateurs (citoyen)')
  
  const { data: allUsersCitizen, error: allUsersCitizenError } = await supabase
    .from('users')
    .select('*')
  
  if (allUsersCitizenError) {
    console.log('✅ Erreur attendue (citoyen ne peut pas voir tous les utilisateurs):', allUsersCitizenError.message)
  } else {
    console.log('❌ Problème: Citoyen peut voir tous les utilisateurs')
    console.log('Nombre d\'utilisateurs:', allUsersCitizen.length)
  }
  
  // Déconnexion citoyen
  await supabase.auth.signOut()
  console.log('✅ Déconnexion citoyen')
  
  // Test 5: Connexion admin
  console.log('\n👨‍💼 Test 5: Connexion admin')
  
  const { data: adminAuth, error: adminAuthError } = await supabase.auth.signInWithPassword({
    email: 'admin@kinshasa-alerte.rdc',
    password: 'admin123456'
  })
  
  if (adminAuthError) {
    console.error('❌ Erreur connexion admin:', adminAuthError)
    return
  }
  
  console.log('✅ Connexion admin réussie')
  
  // Test 6: Lecture tous les utilisateurs (devrait réussir pour admin)
  console.log('\n📋 Test 6: Lecture tous les utilisateurs (admin)')
  
  const { data: allUsersAdmin, error: allUsersAdminError } = await supabase
    .from('users')
    .select('*')
  
  if (allUsersAdminError) {
    console.error('❌ Erreur lecture tous users (admin):', allUsersAdminError)
  } else {
    console.log('✅ Lecture tous users réussie (admin)')
    console.log('Nombre d\'utilisateurs:', allUsersAdmin.length)
    allUsersAdmin.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`)
    })
  }
  
  // Déconnexion admin
  await supabase.auth.signOut()
  console.log('✅ Déconnexion admin')
  
  console.log('\n🎯 Tests terminés!')
}

testAfterRLSFix().catch(console.error) 