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

async function testRLSPolicies() {
  console.log('🔍 Test des politiques RLS')
  console.log('=' .repeat(40))
  
  // Test 1: Connexion
  console.log('\n👤 Test 1: Connexion')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@kinshasa-alerte.rdc',
    password: 'admin123456'
  })
  
  if (authError) {
    console.error('❌ Erreur connexion:', authError)
    return
  }
  
  console.log('✅ Connexion réussie')
  console.log('User ID:', authData.user.id)
  
  // Test 2: Lecture de la table users avec l'utilisateur connecté
  console.log('\n📋 Test 2: Lecture table users (connecté)')
  
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
  
  if (usersError) {
    console.error('❌ Erreur lecture users:', usersError)
    console.error('Code:', usersError.code)
    console.error('Message:', usersError.message)
    console.error('Details:', usersError.details)
    console.error('Hint:', usersError.hint)
  } else {
    console.log('✅ Lecture users réussie')
    console.log('Données:', users)
  }
  
  // Test 3: Lecture avec .single()
  console.log('\n📋 Test 3: Lecture avec .single()')
  
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single()
  
  if (userError) {
    console.error('❌ Erreur lecture user single:', userError)
    console.error('Code:', userError.code)
    console.error('Message:', userError.message)
    console.error('Details:', userError.details)
    console.error('Hint:', userError.hint)
  } else {
    console.log('✅ Lecture user single réussie')
    console.log('User:', user)
  }
  
  // Test 4: Lecture de tous les utilisateurs
  console.log('\n📋 Test 4: Lecture tous les utilisateurs')
  
  const { data: allUsers, error: allUsersError } = await supabase
    .from('users')
    .select('*')
  
  if (allUsersError) {
    console.error('❌ Erreur lecture tous users:', allUsersError)
  } else {
    console.log('✅ Lecture tous users réussie')
    console.log('Nombre d\'utilisateurs:', allUsers.length)
  }
  
  // Test 5: Déconnexion
  console.log('\n🚪 Test 5: Déconnexion')
  await supabase.auth.signOut()
  console.log('✅ Déconnexion réussie')
  
  // Test 6: Lecture sans être connecté
  console.log('\n📋 Test 6: Lecture sans connexion')
  
  const { data: usersNotAuth, error: usersNotAuthError } = await supabase
    .from('users')
    .select('*')
    .limit(1)
  
  if (usersNotAuthError) {
    console.error('❌ Erreur lecture sans auth:', usersNotAuthError)
  } else {
    console.log('✅ Lecture sans auth réussie (peut-être un problème)')
    console.log('Données:', usersNotAuth)
  }
}

async function checkPolicies() {
  console.log('\n🔐 Vérification des politiques RLS')
  console.log('=' .repeat(40))
  
  // Connexion avec la clé de service pour vérifier les politiques
  const supabaseService = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrb3JkbnlpdGd2cnRpb3V3ZGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODc2MCwiZXhwIjoyMDY5Mjk0NzYwfQ.Yn3Bye8lMlqAuRsh0entx73CnRnT3a3aTYYYZdzxsfU')
  
  // Vérifier les politiques sur la table users
  const { data: policies, error: policiesError } = await supabaseService
    .from('information_schema.policies')
    .select('*')
    .eq('table_name', 'users')
  
  if (policiesError) {
    console.error('❌ Erreur lecture politiques:', policiesError)
  } else {
    console.log('📋 Politiques sur la table users:')
    policies.forEach(policy => {
      console.log(`  - ${policy.policy_name}: ${policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'} ${policy.operation}`)
    })
  }
}

async function main() {
  console.log('🚀 Test complet des politiques RLS')
  console.log('=' .repeat(50))
  
  await testRLSPolicies()
  await checkPolicies()
  
  console.log('\n🎯 Tests terminés!')
}

main().catch(console.error) 