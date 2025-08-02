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

async function updateExistingUsers() {
  try {
    console.log('🔄 Mise à jour des utilisateurs existants...')
    
    // Récupérer tous les utilisateurs d'authentification
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Erreur récupération utilisateurs auth:', authError.message)
      return
    }
    
    console.log(`📊 ${authUsers.users.length} utilisateurs d'authentification trouvés`)
    
    // Mettre à jour chaque utilisateur
    for (const authUser of authUsers.users) {
      console.log(`\n👤 Mise à jour de ${authUser.email}...`)
      
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
      
      // Mettre à jour ou créer le profil utilisateur
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          full_name: full_name,
          role: role,
          commune_id: commune_id
        }, {
          onConflict: 'id'
        })
      
      if (error) {
        console.error(`❌ Erreur mise à jour ${authUser.email}:`, error.message)
      } else {
        console.log(`✅ ${authUser.email} mis à jour (rôle: ${role})`)
      }
    }
    
    console.log('\n🎉 Mise à jour terminée !')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

async function testConnection() {
  try {
    console.log('🔍 Test de connexion...')
    
    // Tester la connexion à la base de données
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Erreur connexion base de données:', error.message)
      return false
    }
    
    console.log('✅ Connexion réussie')
    return true
  } catch (error) {
    console.error('❌ Erreur test connexion:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Mise à jour des utilisateurs existants')
  console.log('=' .repeat(50))
  
  // Tester la connexion
  const isConnected = await testConnection()
  
  if (!isConnected) {
    console.log('❌ Impossible de se connecter à la base de données')
    return
  }
  
  // Mettre à jour les utilisateurs
  await updateExistingUsers()
  
  console.log('\n📋 Résumé des comptes disponibles :')
  console.log('👨‍💼 Admin: admin@kinshasa-alerte.rdc / admin123456')
  console.log('🏛️  Bourgmestre: bourgmestre.gombe@kinshasa-alerte.rdc / bourg123456')
  console.log('👤 Citoyen: citoyen@kinshasa-alerte.rdc / citoyen123456')
  
  console.log('\n🔐 Test de connexion :')
  console.log('1. Allez sur http://localhost:8080/auth')
  console.log('2. Utilisez les emails et mots de passe ci-dessus')
  console.log('3. La connexion devrait maintenant fonctionner')
}

main().catch(console.error) 