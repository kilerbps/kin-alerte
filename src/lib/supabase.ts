import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Améliorer la persistance de session
    persistSession: true,
    storageKey: 'kinshasa-alerte-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Augmenter la durée de session
    debug: false
  },
  // Configuration générale
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Types pour la base de données
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone: string | null
          role: 'citizen' | 'admin' | 'bourgmestre'
          commune_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          role?: 'citizen' | 'admin' | 'bourgmestre'
          commune_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          role?: 'citizen' | 'admin' | 'bourgmestre'
          commune_id?: string | null
          created_at?: string
        }
      }
      communes: {
        Row: {
          id: string
          name: string
          coordinates: string | null
          population: number | null
          bourgmestre_id: string | null
        }
        Insert: {
          id?: string
          name: string
          coordinates?: string | null
          population?: number | null
          bourgmestre_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          coordinates?: string | null
          population?: number | null
          bourgmestre_id?: string | null
        }
      }
      problem_types: {
        Row: {
          id: string
          name: string
          description: string | null
          priority_level: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          priority_level?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          priority_level?: number
        }
      }
      reports: {
        Row: {
          id: string
          report_id: string
          problem_type_id: string
          commune_id: string
          user_id: string | null
          description: string
          address: string
          coordinates: string | null
          priority: 'low' | 'medium' | 'high'
          status: 'pending' | 'in-progress' | 'resolved' | 'rejected'
          is_anonymous: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_id: string
          problem_type_id: string
          commune_id: string
          user_id?: string | null
          description: string
          address: string
          coordinates?: string | null
          priority?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'in-progress' | 'resolved' | 'rejected'
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          problem_type_id?: string
          commune_id?: string
          user_id?: string | null
          description?: string
          address?: string
          coordinates?: string | null
          priority?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'in-progress' | 'resolved' | 'rejected'
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      report_images: {
        Row: {
          id: string
          report_id: string
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          image_url?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          report_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          report_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          report_id?: string
          content?: string
          created_at?: string
        }
      }
      weekly_reports: {
        Row: {
          id: string
          commune_id: string
          week_start: string
          week_end: string
          total_reports: number
          resolved_reports: number
          report_data: any
          generated_at: string
        }
        Insert: {
          id?: string
          commune_id: string
          week_start: string
          week_end: string
          total_reports?: number
          resolved_reports?: number
          report_data?: any
          generated_at?: string
        }
        Update: {
          id?: string
          commune_id?: string
          week_start?: string
          week_end?: string
          total_reports?: number
          resolved_reports?: number
          report_data?: any
          generated_at?: string
        }
      }
    }
  }
}

// Types utilitaires
export type User = Database['public']['Tables']['users']['Row']
export type Commune = Database['public']['Tables']['communes']['Row']
export type ProblemType = Database['public']['Tables']['problem_types']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type ReportImage = Database['public']['Tables']['report_images']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type WeeklyReport = Database['public']['Tables']['weekly_reports']['Row'] 