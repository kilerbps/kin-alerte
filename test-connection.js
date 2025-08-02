import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Test de connexion Supabase...')
console.log('URL:', supabaseUrl)
console.log('Clé anonyme:', supabaseAnonKey ? '✅ Présente' : '❌ Manquante')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('\n📡 Test de connexion à la base de données...')
    
    // Test simple de connexion
    const { data, error } = await supabase
      .from('communes')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('⚠️  Erreur de connexion:', error.message)
      console.log('💡 Cela peut être normal si la base de données n\'est pas encore créée')
      return false
    }
    
    console.log('✅ Connexion réussie !')
    return true
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message)
    return false
  }
}

async function testAuth() {
  try {
    console.log('\n🔐 Test de l\'authentification...')
    
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('⚠️  Erreur d\'authentification:', error.message)
      return false
    }
    
    console.log('✅ Authentification configurée correctement')
    return true
    
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Diagnostic de connexion Supabase')
  console.log('=' .repeat(50))
  
  const dbConnected = await testConnection()
  const authWorking = await testAuth()
  
  console.log('\n📋 Résumé:')
  console.log(`Base de données: ${dbConnected ? '✅ Connectée' : '❌ Non connectée'}`)
  console.log(`Authentification: ${authWorking ? '✅ Fonctionnelle' : '❌ Problème'}`)
  
  if (!dbConnected) {
    console.log('\n🔧 Solutions:')
    console.log('1. Vérifiez que votre projet Supabase est actif')
    console.log('2. Exécutez le script SQL dans l\'éditeur SQL de Supabase')
    console.log('3. Vérifiez que les variables d\'environnement sont correctes')
    console.log('4. Relancez ce test après avoir créé la base de données')
  }
  
  if (!authWorking) {
    console.log('\n🔧 Solutions pour l\'authentification:')
    console.log('1. Vérifiez la configuration Auth dans Supabase')
    console.log('2. Assurez-vous que les URLs de redirection sont configurées')
  }
}

main().catch(console.error) 