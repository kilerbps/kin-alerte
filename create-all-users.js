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

// Comptes à créer
const ACCOUNTS_TO_CREATE = [
  {
    email: 'admin@kinshasa-alerte.rdc',
    password: 'admin123456',
    full_name: 'Administrateur Principal',
    role: 'admin'
  },
  {
    email: 'bourgmestre.gombe@kinshasa-alerte.rdc',
    password: 'bourg123456',
    full_name: 'Bourgmestre de Gombe',
    role: 'bourgmestre',
    commune_name: 'Gombe'
  },
  {
    email: 'citoyen@kinshasa-alerte.rdc',
    password: 'citoyen123456',
    full_name: 'Citoyen Test',
    role: 'citizen'
  }
]

async function createUserAccount(account) {
  try {
    console.log(`👤 Création du compte ${account.email}...`)
    
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(u => u.email === account.email)
    
    if (existingUser) {
      console.log(`⚠️  L'utilisateur ${account.email} existe déjà`)
      return existingUser
    }
    
    // Créer l'utilisateur dans l'authentification
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        full_name: account.full_name,
        role: account.role
      }
    })

    if (authError) {
      console.error(`❌ Erreur création auth pour ${account.email}:`, authError.message)
      return null
    }

    console.log(`✅ Compte auth créé pour ${account.email}`)
    return authData.user
  } catch (error) {
    console.error(`❌ Erreur création auth pour ${account.email}:`, error.message)
    return null
  }
}

async function createUserProfile(authUser, account) {
  try {
    // Récupérer l'ID de la commune si nécessaire
    let commune_id = null
    if (account.commune_name) {
      const { data: commune } = await supabase
        .from('communes')
        .select('id')
        .eq('name', account.commune_name)
        .single()
      
      if (commune) {
        commune_id = commune.id
        console.log(`🏘️  Commune ${account.commune_name} trouvée (ID: ${commune.id})`)
      }
    }

    // Créer le profil utilisateur dans la table users
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: account.email,
        full_name: account.full_name,
        role: account.role,
        commune_id: commune_id
      })

    if (error) {
      console.error(`❌ Erreur création profil pour ${account.email}:`, error.message)
      return false
    }

    console.log(`✅ Profil créé pour ${account.email} (rôle: ${account.role})`)
    return true
  } catch (error) {
    console.error(`❌ Erreur création profil pour ${account.email}:`, error.message)
    return false
  }
}

async function listExistingUsers() {
  try {
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    console.log(`\n📊 Utilisateurs d'authentification existants (${authUsers.users.length}):`)
    authUsers.users.forEach(user => {
      const role = user.user_metadata?.role || 'citizen'
      console.log(`  - ${user.email} (${role})`)
    })
  } catch (error) {
    console.error('❌ Erreur liste utilisateurs:', error.message)
  }
}

async function main() {
  console.log('🚀 Création de tous les comptes d\'authentification')
  console.log('=' .repeat(60))
  
  // Lister les utilisateurs existants
  await listExistingUsers()
  
  console.log('\n🔄 Création des nouveaux comptes...')
  
  for (const account of ACCOUNTS_TO_CREATE) {
    console.log(`\n📧 Traitement de ${account.email}...`)
    
    // Créer le compte d'authentification
    const authUser = await createUserAccount(account)
    
    if (authUser) {
      // Créer le profil utilisateur
      await createUserProfile(authUser, account)
    }
  }
  
  console.log('\n🎉 Création terminée !')
  
  // Lister tous les utilisateurs après création
  await listExistingUsers()
  
  console.log('\n📋 Comptes de test disponibles :')
  console.log('👨‍💼 Admin: admin@kinshasa-alerte.rdc / admin123456')
  console.log('🏛️  Bourgmestre: bourgmestre.gombe@kinshasa-alerte.rdc / bourg123456')
  console.log('👤 Citoyen: citoyen@kinshasa-alerte.rdc / citoyen123456')
  
  console.log('\n🔐 Instructions de test :')
  console.log('1. Allez sur http://localhost:8080/auth')
  console.log('2. Utilisez les emails et mots de passe ci-dessus')
  console.log('3. Testez la connexion pour chaque compte')
  
  console.log('\n🎯 Test des rôles :')
  console.log('- Admin: Accès à /admin')
  console.log('- Bourgmestre: Accès à /bourgmestre')
  console.log('- Citoyen: Accès à /signaler')
}

main().catch(console.error) 