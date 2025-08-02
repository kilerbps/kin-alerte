import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrb3JkbnlpdGd2cnRpb3V3ZGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODc2MCwiZXhwIjoyMDY5Mjk0NzYwfQ.Yn3Bye8lMlqAuRsh0entx73CnRnT3a3aTYYYZdzxsfU'

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL manquant dans .env')
  process.exit(1)
}

// Créer le client Supabase avec la clé de service
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanUsersTable() {
  try {
    console.log('🧹 Nettoyage de la table users...')
    
    // Supprimer tous les utilisateurs existants
    const { error } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Supprimer tous
    
    if (error) {
      console.error('❌ Erreur nettoyage:', error.message)
      return false
    }
    
    console.log('✅ Table users nettoyée')
    return true
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error.message)
    return false
  }
}

async function recreateUsersFromAuth() {
  try {
    console.log('🔄 Recréation des utilisateurs depuis l\'auth...')
    
    // Récupérer tous les utilisateurs d'authentification
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Erreur récupération utilisateurs auth:', authError.message)
      return false
    }
    
    console.log(`📊 ${authUsers.users.length} utilisateurs d'authentification trouvés`)
    
    // Recréer chaque utilisateur
    for (const authUser of authUsers.users) {
      console.log(`\n👤 Recréation de ${authUser.email}...`)
      
      // Récupérer les métadonnées
      const full_name = authUser.user_metadata?.full_name || authUser.email
      const role = authUser.user_metadata?.role || 'citizen'
      
      // Récupérer l'ID de la commune si c'est un bourgmestre
      let commune_id = null
      if (role === 'bourgmestre') {
        const { data: commune } = await supabase
          .from('communes')
          .select('id')
          .eq('name', 'Gombe')
          .single()
        
        if (commune) {
          commune_id = commune.id
        }
      }
      
      // Créer le profil utilisateur
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email,
          full_name: full_name,
          role: role,
          commune_id: commune_id
        })
      
      if (error) {
        console.error(`❌ Erreur création ${authUser.email}:`, error.message)
      } else {
        console.log(`✅ ${authUser.email} créé (rôle: ${role})`)
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ Erreur recréation:', error.message)
    return false
  }
}

async function testAuthConnection() {
  try {
    console.log('🔍 Test de connexion auth...')
    
    // Tester la connexion à l'authentification
    const { data, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('❌ Erreur connexion auth:', error.message)
      return false
    }
    
    console.log(`✅ Connexion auth réussie (${data.users.length} utilisateurs)`)
    return true
  } catch (error) {
    console.error('❌ Erreur test auth:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Correction de la table users')
  console.log('=' .repeat(50))
  
  // Tester la connexion auth
  const authConnected = await testAuthConnection()
  
  if (!authConnected) {
    console.log('❌ Impossible de se connecter à l\'authentification')
    return
  }
  
  // Nettoyer la table users
  const cleaned = await cleanUsersTable()
  
  if (!cleaned) {
    console.log('❌ Impossible de nettoyer la table users')
    return
  }
  
  // Recréer les utilisateurs
  const recreated = await recreateUsersFromAuth()
  
  if (!recreated) {
    console.log('❌ Impossible de recréer les utilisateurs')
    return
  }
  
  console.log('\n🎉 Correction terminée !')
  
  console.log('\n📋 Comptes disponibles :')
  console.log('👨‍💼 Admin: admin@kinshasa-alerte.rdc / admin123456')
  console.log('🏛️  Bourgmestre: bourgmestre.gombe@kinshasa-alerte.rdc / bourg123456')
  console.log('👤 Citoyen: citoyen@kinshasa-alerte.rdc / citoyen123456')
  
  console.log('\n🔐 Test de connexion :')
  console.log('1. Allez sur http://localhost:8080/auth')
  console.log('2. Utilisez les emails et mots de passe ci-dessus')
  console.log('3. La connexion devrait maintenant fonctionner correctement')
  
  console.log('\n🎯 Test des rôles :')
  console.log('- Admin: Accès à /admin')
  console.log('- Bourgmestre: Accès à /bourgmestre')
  console.log('- Citoyen: Accès à /signaler')
}

main().catch(console.error) 