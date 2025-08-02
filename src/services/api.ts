import { supabase } from '@/lib/supabase'
import { Commune, ProblemType } from '@/lib/supabase'

// Données réelles des communes de Kinshasa
export const COMMUNES_DATA = [
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
export const PROBLEM_TYPES_DATA = [
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

// Service pour les communes
export const communeService = {
  // Récupérer toutes les communes
  async getAll(): Promise<Commune[]> {
    try {
      const { data, error } = await supabase
        .from('communes')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching communes:', error)
        throw error
      }
      return data || []
    } catch (error) {
      console.error('Error fetching communes:', error)
      throw error
    }
  },

  // Récupérer une commune par ID
  async getById(id: string): Promise<Commune | null> {
    try {
      const { data, error } = await supabase
        .from('communes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching commune:', error)
      return null
    }
  },

  // Initialiser les communes dans la base de données
  async initialize(): Promise<void> {
    try {
      // Vérifier si les communes existent déjà
      const { data: existingCommunes } = await supabase
        .from('communes')
        .select('name')

      if (existingCommunes && existingCommunes.length > 0) {
        console.log('Communes already initialized')
        return
      }

      // Insérer les communes
      const { error } = await supabase
        .from('communes')
        .insert(COMMUNES_DATA)

      if (error) throw error
      console.log('Communes initialized successfully')
    } catch (error) {
      console.error('Error initializing communes:', error)
    }
  }
}

// Service pour les types de problèmes
export const problemTypeService = {
  // Récupérer tous les types de problèmes
  async getAll(): Promise<ProblemType[]> {
    try {
      const { data, error } = await supabase
        .from('problem_types')
        .select('*')
        .order('priority_level', { ascending: false })

      if (error) {
        console.error('Error fetching problem types:', error)
        throw error
      }
      return data || []
    } catch (error) {
      console.error('Error fetching problem types:', error)
      throw error
    }
  },

  // Récupérer un type de problème par ID
  async getById(id: string): Promise<ProblemType | null> {
    try {
      const { data, error } = await supabase
        .from('problem_types')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching problem type:', error)
      return null
    }
  },

  // Initialiser les types de problèmes dans la base de données
  async initialize(): Promise<void> {
    try {
      // Vérifier si les types existent déjà
      const { data: existingTypes } = await supabase
        .from('problem_types')
        .select('name')

      if (existingTypes && existingTypes.length > 0) {
        console.log('Problem types already initialized')
        return
      }

      // Insérer les types de problèmes
      const { error } = await supabase
        .from('problem_types')
        .insert(PROBLEM_TYPES_DATA)

      if (error) throw error
      console.log('Problem types initialized successfully')
    } catch (error) {
      console.error('Error initializing problem types:', error)
    }
  }
}

// Service pour les commentaires
export const commentService = {
  // Créer un nouveau commentaire
  async create(commentData: {
    user_id: string
    report_id: string
    content: string
  }) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([commentData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Récupérer les commentaires d'un signalement
  async getByReportId(reportId: string) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(full_name, email, role)
        `)
        .eq('report_id', reportId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error }
    }
  }
}

// Service pour les rapports hebdomadaires
export const weeklyReportService = {
  // Créer un rapport hebdomadaire
  async create(reportData: {
    commune_id: string
    week_start: string
    week_end: string
    total_reports: number
    resolved_reports: number
    report_data: any
  }) {
    try {
      const { data, error } = await supabase
        .from('weekly_reports')
        .insert([reportData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Récupérer les rapports d'une commune
  async getByCommune(communeId: string, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('weekly_reports')
        .select('*')
        .eq('commune_id', communeId)
        .order('week_start', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error }
    }
  },

  // Générer automatiquement un rapport hebdomadaire
  async generateWeeklyReport(communeId: string, weekStart: string, weekEnd: string) {
    try {
      // Récupérer les signalements de la semaine
      const { data: reports } = await supabase
        .from('reports')
        .select('status')
        .eq('commune_id', communeId)
        .gte('created_at', weekStart)
        .lte('created_at', weekEnd)

      const totalReports = reports?.length || 0
      const resolvedReports = reports?.filter(r => r.status === 'resolved').length || 0

      // Créer le rapport
      const reportData = {
        commune_id: communeId,
        week_start: weekStart,
        week_end: weekEnd,
        total_reports: totalReports,
        resolved_reports: resolvedReports,
        report_data: {
          reports_by_status: {
            pending: reports?.filter(r => r.status === 'pending').length || 0,
            in_progress: reports?.filter(r => r.status === 'in-progress').length || 0,
            resolved: resolvedReports,
            rejected: reports?.filter(r => r.status === 'rejected').length || 0,
          }
        }
      }

      return await this.create(reportData)
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Fonction d'initialisation générale
export const initializeDatabase = async () => {
  try {
    console.log('Initializing database...')
    await communeService.initialize()
    await problemTypeService.initialize()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
  }
} 