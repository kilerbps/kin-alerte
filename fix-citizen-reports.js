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

async function createCitizenReports() {
  console.log('🔍 Création de signalements pour le citoyen (version corrigée)')
  console.log('=' .repeat(60))

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

  // Test 2: Récupération des communes et types de problèmes
  console.log('\n📋 Test 2: Récupération des données de référence')
  
  const { data: communes, error: communesError } = await supabase
    .from('communes')
    .select('id, name')
    .limit(5)

  const { data: problemTypes, error: problemTypesError } = await supabase
    .from('problem_types')
    .select('id, name')
    .limit(5)

  if (communesError || problemTypesError) {
    console.error('❌ Erreur récupération données:', communesError || problemTypesError)
    return
  }

  console.log('✅ Communes récupérées:', communes.length)
  console.log('✅ Types de problèmes récupérés:', problemTypes.length)

  // Test 3: Création de signalements pour le citoyen (structure corrigée)
  console.log('\n📝 Test 3: Création de signalements pour le citoyen')
  
  const citizenReports = [
    {
      description: "L'éclairage public ne fonctionne plus depuis 3 jours dans ma rue, c'est très dangereux la nuit.",
      status: 'pending',
      priority: 'high',
      commune_id: communes[0].id,
      problem_type_id: problemTypes[0].id,
      user_id: authData.user.id,
      is_anonymous: false,
      address: "Rue de la Paix, " + communes[0].name
    },
    {
      description: "Grand trou dans la route qui peut endommager les véhicules et causer des accidents.",
      status: 'in_progress',
      priority: 'critical',
      commune_id: communes[1].id,
      problem_type_id: problemTypes[1].id,
      user_id: authData.user.id,
      is_anonymous: false,
      address: "Avenue du Commerce, " + communes[1].name
    },
    {
      description: "Les poubelles publiques débordent et les déchets se répandent dans la rue.",
      status: 'resolved',
      priority: 'medium',
      commune_id: communes[2].id,
      problem_type_id: problemTypes[2].id,
      user_id: authData.user.id,
      is_anonymous: false,
      address: "Boulevard Central, " + communes[2].name
    },
    {
      description: "Panneau de signalisation arraché à l'intersection, difficile de savoir qui a la priorité.",
      status: 'rejected',
      priority: 'low',
      commune_id: communes[0].id,
      problem_type_id: problemTypes[3].id,
      user_id: authData.user.id,
      is_anonymous: false,
      address: "Place de l'Indépendance, " + communes[0].name
    }
  ]

  for (const report of citizenReports) {
    console.log(`\n📝 Création du signalement: ${report.description.substring(0, 50)}...`)
    
    const { data: newReport, error: createError } = await supabase
      .from('reports')
      .insert([report])
      .select()
      .single()

    if (createError) {
      console.error('❌ Erreur création signalement:', createError)
    } else {
      console.log('✅ Signalement créé avec succès!')
      console.log('ID:', newReport.id)
      console.log('Statut:', newReport.status)
    }
  }

  // Test 4: Vérification des signalements créés
  console.log('\n📊 Test 4: Vérification des signalements créés')
  
  const { data: userReports, error: userReportsError } = await supabase
    .from('reports')
    .select(`
      *,
      commune:communes(name),
      problem_type:problem_types(name)
    `)
    .eq('user_id', authData.user.id)
    .order('created_at', { ascending: false })

  if (userReportsError) {
    console.error('❌ Erreur récupération signalements:', userReportsError)
  } else {
    console.log('✅ Signalements du citoyen récupérés:')
    console.log('Nombre total:', userReports?.length || 0)
    
    if (userReports && userReports.length > 0) {
      userReports.forEach((report, index) => {
        console.log(`${index + 1}. ${report.description.substring(0, 50)}...`)
        console.log(`   Statut: ${report.status}`)
        console.log(`   Priorité: ${report.priority}`)
        console.log(`   Commune: ${report.commune?.name || 'Inconnue'}`)
        console.log(`   Type: ${report.problem_type?.name || 'Inconnu'}`)
        console.log('')
      })
    }
  }

  // Test 5: Déconnexion
  console.log('\n🚪 Test 5: Déconnexion')
  const { error: signOutError } = await supabase.auth.signOut()

  if (signOutError) {
    console.error('❌ Erreur déconnexion:', signOutError)
  } else {
    console.log('✅ Déconnexion réussie')
  }

  console.log('\n🎯 Test terminé!')
  console.log('\n💡 Maintenant vous pouvez tester le dashboard citoyen avec des données réelles!')
}

createCitizenReports().catch(console.error) 