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

async function testCitizenDashboard() {
  console.log('🔍 Test du Dashboard Citoyen')
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

  // Test 2: Récupération du profil utilisateur
  console.log('\n📋 Test 2: Récupération du profil utilisateur')
  
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  if (profileError) {
    console.error('❌ Erreur récupération profil:', profileError)
  } else {
    console.log('✅ Profil récupéré avec succès!')
    console.log('Nom:', profile.full_name)
    console.log('Rôle:', profile.role)
    console.log('Email:', profile.email)
  }

  // Test 3: Récupération des signalements du citoyen
  console.log('\n📝 Test 3: Récupération des signalements du citoyen')
  
  const { data: reports, error: reportsError } = await supabase
    .from('reports')
    .select(`
      *,
      commune:communes(name),
      problem_type:problem_types(name)
    `)
    .eq('user_id', authData.user.id)
    .order('created_at', { ascending: false })

  if (reportsError) {
    console.error('❌ Erreur récupération signalements:', reportsError)
    console.error('Code:', reportsError.code)
    console.error('Message:', reportsError.message)
  } else {
    console.log('✅ Signalements récupérés avec succès!')
    console.log('Nombre de signalements:', reports?.length || 0)
    
    if (reports && reports.length > 0) {
      console.log('\n📊 Détail des signalements:')
      reports.forEach((report, index) => {
        console.log(`${index + 1}. ${report.title}`)
        console.log(`   Statut: ${report.status}`)
        console.log(`   Priorité: ${report.priority}`)
        console.log(`   Commune: ${report.commune?.name || 'Inconnue'}`)
        console.log(`   Type: ${report.problem_type?.name || 'Inconnu'}`)
        console.log(`   Date: ${new Date(report.created_at).toLocaleDateString('fr-FR')}`)
        console.log('')
      })
    } else {
      console.log('ℹ️ Aucun signalement trouvé pour ce citoyen')
    }
  }

  // Test 4: Vérification de la structure de la table reports
  console.log('\n🔍 Test 4: Vérification de la structure de la table reports')
  
  const { data: allReports, error: allReportsError } = await supabase
    .from('reports')
    .select('*')
    .limit(5)

  if (allReportsError) {
    console.error('❌ Erreur récupération tous les signalements:', allReportsError)
  } else {
    console.log('✅ Structure de la table reports:')
    if (allReports && allReports.length > 0) {
      const sampleReport = allReports[0]
      console.log('Colonnes disponibles:', Object.keys(sampleReport))
      console.log('Exemple de signalement:', sampleReport)
    }
  }

  // Test 5: Vérification des utilisateurs
  console.log('\n👥 Test 5: Vérification des utilisateurs')
  
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, full_name, email, role')
    .limit(10)

  if (usersError) {
    console.error('❌ Erreur récupération utilisateurs:', usersError)
  } else {
    console.log('✅ Utilisateurs récupérés:')
    users?.forEach(user => {
      console.log(`- ${user.full_name} (${user.email}) - ${user.role}`)
    })
  }

  // Test 6: Déconnexion
  console.log('\n🚪 Test 6: Déconnexion')
  const { error: signOutError } = await supabase.auth.signOut()

  if (signOutError) {
    console.error('❌ Erreur déconnexion:', signOutError)
  } else {
    console.log('✅ Déconnexion réussie')
  }

  console.log('\n🎯 Test terminé!')
}

testCitizenDashboard().catch(console.error) 