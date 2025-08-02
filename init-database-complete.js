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

// Données des communes de Kinshasa
const COMMUNES_DATA = [
  { name: "Bandalungwa", population: 120000, coordinates: "-4.4419,15.2663" },
  { name: "Barumbu", population: 95000, coordinates: "-4.4419,15.2663" },
  { name: "Bumbu", population: 180000, coordinates: "-4.4419,15.2663" },
  { name: "Gombe", population: 250000, coordinates: "-4.4419,15.2663" },
  { name: "Kalamu", population: 200000, coordinates: "-4.4419,15.2663" },
  { name: "Kasa-Vubu", population: 150000, coordinates: "-4.4419,15.2663" },
  { name: "Kimbanseke", population: 300000, coordinates: "-4.4419,15.2663" },
  { name: "Kinshasa", population: 220000, coordinates: "-4.4419,15.2663" },
  { name: "Kintambo", population: 110000, coordinates: "-4.4419,15.2663" },
  { name: "Kisenso", population: 160000, coordinates: "-4.4419,15.2663" },
  { name: "Lemba", population: 140000, coordinates: "-4.4419,15.2663" },
  { name: "Limete", population: 170000, coordinates: "-4.4419,15.2663" },
  { name: "Lingwala", population: 130000, coordinates: "-4.4419,15.2663" },
  { name: "Makala", population: 190000, coordinates: "-4.4419,15.2663" },
  { name: "Maluku", population: 80000, coordinates: "-4.4419,15.2663" },
  { name: "Masina", population: 280000, coordinates: "-4.4419,15.2663" },
  { name: "Matete", population: 210000, coordinates: "-4.4419,15.2663" },
  { name: "Mont-Ngafula", population: 90000, coordinates: "-4.4419,15.2663" },
  { name: "Ndjili", population: 240000, coordinates: "-4.4419,15.2663" },
  { name: "Ngaba", population: 120000, coordinates: "-4.4419,15.2663" },
  { name: "Ngaliema", population: 260000, coordinates: "-4.4419,15.2663" },
  { name: "Ngiri-Ngiri", population: 100000, coordinates: "-4.4419,15.2663" },
  { name: "N'sele", population: 70000, coordinates: "-4.4419,15.2663" },
  { name: "Selembao", population: 85000, coordinates: "-4.4419,15.2663" }
]

// Types de problèmes réels
const PROBLEM_TYPES_DATA = [
  { name: "Ordures ménagères", description: "Accumulation d'ordures, poubelles pleines, décharges sauvages", priority_level: 3 },
  { name: "Éclairage public", description: "Lampadaires défectueux, zones sombres, pannes d'éclairage", priority_level: 2 },
  { name: "Voirie dégradée", description: "Nids-de-poule, routes endommagées, trottoirs cassés", priority_level: 3 },
  { name: "Inondations", description: "Eaux stagnantes, débordements, drainage défaillant", priority_level: 3 },
  { name: "Approvisionnement en eau", description: "Coupures d'eau, fuites, pression insuffisante", priority_level: 3 },
  { name: "Pannes électriques", description: "Coupures de courant, transformateurs défectueux", priority_level: 2 },
  { name: "Insécurité", description: "Vols, agressions, zones dangereuses", priority_level: 3 },
  { name: "Infrastructures publiques", description: "Écoles, hôpitaux, bâtiments publics dégradés", priority_level: 2 },
  { name: "Espaces verts", description: "Parks négligés, arbres malades, espaces publics", priority_level: 1 },
  { name: "Services publics", description: "Transports, postes, services administratifs", priority_level: 2 },
  { name: "Transport", description: "Problèmes de transport public, routes bloquées", priority_level: 2 },
  { name: "Autre", description: "Autres problèmes non catégorisés", priority_level: 1 }
]

// Données de test pour les signalements
const SAMPLE_REPORTS = [
  {
    problem_type_name: "Ordures ménagères",
    commune_name: "Gombe",
    description: "Accumulation d'ordures importantes à l'intersection Avenue Kasa-Vubu et Boulevard du 30 Juin",
    address: "Avenue Kasa-Vubu, Gombe",
    priority: "high",
    status: "pending",
    is_anonymous: true
  },
  {
    problem_type_name: "Éclairage public",
    commune_name: "Kalamu",
    description: "Lampadaires éteints depuis 3 jours sur la Route de Matadi",
    address: "Route de Matadi, Kalamu",
    priority: "medium",
    status: "in-progress",
    is_anonymous: false
  },
  {
    problem_type_name: "Voirie dégradée",
    commune_name: "Ngaliema",
    description: "Nids-de-poule dangereux sur l'Avenue de la Justice",
    address: "Avenue de la Justice, Ngaliema",
    priority: "high",
    status: "resolved",
    is_anonymous: true
  },
  {
    problem_type_name: "Inondations",
    commune_name: "Masina",
    description: "Eaux stagnantes après la pluie dans le quartier Masina 1",
    address: "Quartier Masina 1, Masina",
    priority: "high",
    status: "pending",
    is_anonymous: false
  },
  {
    problem_type_name: "Approvisionnement en eau",
    commune_name: "Limete",
    description: "Coupure d'eau depuis 2 jours dans le quartier Limete 1",
    address: "Quartier Limete 1, Limete",
    priority: "high",
    status: "in-progress",
    is_anonymous: true
  }
]

async function testConnection() {
  console.log('🔍 Test de connexion à Supabase...')
  
  try {
    const { data, error } = await supabase.from('communes').select('count').limit(1)
    
    if (error) {
      console.log('⚠️  Tables pas encore créées, c\'est normal pour la première fois')
      return false
    }
    
    console.log('✅ Connexion réussie !')
    return true
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message)
    return false
  }
}

async function initializeCommunes() {
  console.log('🏘️  Initialisation des communes...')
  
  try {
    // Vérifier si les communes existent déjà
    const { data: existingCommunes } = await supabase
      .from('communes')
      .select('name')

    if (existingCommunes && existingCommunes.length > 0) {
      console.log('✅ Communes déjà initialisées')
      return existingCommunes
    }

    // Insérer les communes
    const { data, error } = await supabase
      .from('communes')
      .insert(COMMUNES_DATA)
      .select()

    if (error) {
      console.error('❌ Erreur lors de l\'insertion des communes:', error)
      return []
    }

    console.log(`✅ ${COMMUNES_DATA.length} communes insérées avec succès`)
    return data
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des communes:', error)
    return []
  }
}

async function initializeProblemTypes() {
  console.log('🚨 Initialisation des types de problèmes...')
  
  try {
    // Vérifier si les types existent déjà
    const { data: existingTypes } = await supabase
      .from('problem_types')
      .select('name')

    if (existingTypes && existingTypes.length > 0) {
      console.log('✅ Types de problèmes déjà initialisés')
      return existingTypes
    }

    // Insérer les types de problèmes
    const { data, error } = await supabase
      .from('problem_types')
      .insert(PROBLEM_TYPES_DATA)
      .select()

    if (error) {
      console.error('❌ Erreur lors de l\'insertion des types de problèmes:', error)
      return []
    }

    console.log(`✅ ${PROBLEM_TYPES_DATA.length} types de problèmes insérés avec succès`)
    return data
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des types de problèmes:', error)
    return []
  }
}

async function createSampleReports(communes, problemTypes) {
  console.log('📝 Création de signalements de test...')
  
  try {
    const reports = []
    
    for (const sampleReport of SAMPLE_REPORTS) {
      // Trouver la commune et le type de problème
      const commune = communes.find(c => c.name === sampleReport.commune_name)
      const problemType = problemTypes.find(pt => pt.name === sampleReport.problem_type_name)
      
      if (commune && problemType) {
        reports.push({
          problem_type_id: problemType.id,
          commune_id: commune.id,
          description: sampleReport.description,
          address: sampleReport.address,
          priority: sampleReport.priority,
          status: sampleReport.status,
          is_anonymous: sampleReport.is_anonymous
        })
      }
    }
    
    if (reports.length > 0) {
      const { data, error } = await supabase
        .from('reports')
        .insert(reports)
        .select()

      if (error) {
        console.error('❌ Erreur lors de l\'insertion des signalements:', error)
        return
      }

      console.log(`✅ ${reports.length} signalements de test créés avec succès`)
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création des signalements de test:', error)
  }
}

async function createTestUsers() {
  console.log('👥 Création des utilisateurs de test...')
  
  try {
    // Vérifier si les utilisateurs de test existent déjà
    const { data: existingUsers } = await supabase
      .from('users')
      .select('email')
      .in('email', ['admin@kinshasa-alerte.rdc', 'bourgmestre.gombe@kinshasa-alerte.rdc'])

    if (existingUsers && existingUsers.length > 0) {
      console.log('✅ Utilisateurs de test déjà créés')
      return
    }

    // Récupérer l'ID de la commune de Gombe
    const { data: gombeCommune } = await supabase
      .from('communes')
      .select('id')
      .eq('name', 'Gombe')
      .single()

    // Créer les utilisateurs de test
    const testUsers = [
      {
        email: 'admin@kinshasa-alerte.rdc',
        full_name: 'Administrateur Principal',
        role: 'admin'
      },
      {
        email: 'bourgmestre.gombe@kinshasa-alerte.rdc',
        full_name: 'Bourgmestre de Gombe',
        role: 'bourgmestre',
        commune_id: gombeCommune?.id
      }
    ]

    const { data, error } = await supabase
      .from('users')
      .insert(testUsers)

    if (error) {
      console.error('❌ Erreur lors de la création des utilisateurs de test:', error)
      return
    }

    console.log('✅ Utilisateurs de test créés avec succès')
    console.log('📧 Emails de test:')
    console.log('   - admin@kinshasa-alerte.rdc (Admin)')
    console.log('   - bourgmestre.gombe@kinshasa-alerte.rdc (Bourgmestre)')
  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs de test:', error)
  }
}

async function main() {
  console.log('🚀 Initialisation complète de la base de données Kinshasa-Alerte')
  console.log('=' .repeat(60))
  
  // Test de connexion
  const isConnected = await testConnection()
  
  if (!isConnected) {
    console.log('\n📋 Veuillez d\'abord exécuter le script SQL dans Supabase:')
    console.log('1. Allez dans votre dashboard Supabase')
    console.log('2. Ouvrez l\'éditeur SQL')
    console.log('3. Copiez et exécutez le contenu de database-schema.sql')
    console.log('4. Relancez ce script')
    return
  }
  
  // Initialiser les données
  const communes = await initializeCommunes()
  const problemTypes = await initializeProblemTypes()
  
  // Créer des signalements de test
  if (communes.length > 0 && problemTypes.length > 0) {
    await createSampleReports(communes, problemTypes)
  }
  
  // Créer les utilisateurs de test
  await createTestUsers()
  
  console.log('\n🎉 Initialisation terminée !')
  console.log('\n📊 Données créées:')
  console.log(`   - ${communes.length} communes`)
  console.log(`   - ${problemTypes.length} types de problèmes`)
  console.log(`   - ${SAMPLE_REPORTS.length} signalements de test`)
  console.log('   - 2 utilisateurs de test')
  
  console.log('\n📋 Prochaines étapes:')
  console.log('1. Lancez l\'application: npm run dev')
  console.log('2. Testez l\'authentification avec les comptes de test')
  console.log('3. Vérifiez que les données sont bien chargées')
  console.log('4. Testez le formulaire de signalement')
}

main().catch(console.error) 