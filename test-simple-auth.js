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

async function testSimpleAuth() {
  console.log('🔍 Test simple d\'authentification (sans RLS)')
  console.log('=' .repeat(50))
  
  // Test 1: Connexion citoyen
  console.log('\n👤 Test 1: Connexion citoyen')
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'citoyen@kinshasa-alerte.rdc',
    password: 'citoyen123456'
  })
  
  if (authError) {
    console.error('❌ Erreur connexion:', authError)
    return
  }
  
  console.log('✅ Connexion réussie!')
  console.log('User ID:', authData.user.id)
  console.log('Email:', authData.user.email)
  
  // Test 2: Lecture du profil utilisateur
  console.log('\n📋 Test 2: Lecture du profil')
  
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single()
  
  if (profileError) {
    console.error('❌ Erreur lecture profil:', profileError)
    console.error('Code:', profileError.code)
    console.error('Message:', profileError.message)
  } else {
    console.log('✅ Profil récupéré avec succès!')
    console.log('Nom:', profile.full_name)
    console.log('Rôle:', profile.role)
    console.log('Email:', profile.email)
  }
  
  // Test 3: Déconnexion
  console.log('\n🚪 Test 3: Déconnexion')
  const { error: signOutError } = await supabase.auth.signOut()
  
  if (signOutError) {
    console.error('❌ Erreur déconnexion:', signOutError)
  } else {
    console.log('✅ Déconnexion réussie')
  }
  
  console.log('\n🎯 Test terminé!')
}

testSimpleAuth().catch(console.error) 