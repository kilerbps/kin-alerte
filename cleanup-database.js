import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrb3JkbnlpdGd2cnRpb3V3ZGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODc2MCwiZXhwIjoyMDY5Mjk0NzYwfQ.Yn3Bye8lMlqAuRsh0entx73CnRnT3a3aTYYYZdzxsfU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupDatabase() {
  console.log('🧹 Nettoyage de la base de données')
  console.log('=' .repeat(40))
  
  try {
    // 1. Lister tous les utilisateurs
    console.log('\n📋 Liste des utilisateurs actuels:')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
    
    if (usersError) {
      console.error('❌ Erreur lecture users:', usersError)
      return
    }
    
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ID: ${user.id}`)
    })
    
    // 2. Supprimer l'utilisateur inattendu
    const unexpectedUser = users.find(u => u.email === 'kilemma633@gmail.com')
    
    if (unexpectedUser) {
      console.log('\n🗑️ Suppression de l\'utilisateur inattendu...')
      
      // Supprimer d'abord de Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(unexpectedUser.id)
      
      if (authError) {
        console.error('❌ Erreur suppression auth:', authError)
      } else {
        console.log('✅ Utilisateur supprimé de Supabase Auth')
      }
      
      // Supprimer de la table users
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', unexpectedUser.id)
      
      if (dbError) {
        console.error('❌ Erreur suppression DB:', dbError)
      } else {
        console.log('✅ Utilisateur supprimé de la table users')
      }
    } else {
      console.log('\n✅ Aucun utilisateur inattendu trouvé')
    }
    
    // 3. Vérifier les utilisateurs restants
    console.log('\n📋 Utilisateurs après nettoyage:')
    const { data: remainingUsers, error: remainingError } = await supabase
      .from('users')
      .select('*')
    
    if (remainingError) {
      console.error('❌ Erreur lecture users restants:', remainingError)
      return
    }
    
    remainingUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`)
    })
    
    console.log('\n✅ Nettoyage terminé!')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

cleanupDatabase().catch(console.error) 