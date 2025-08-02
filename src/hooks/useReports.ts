import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Report, ReportImage } from '@/lib/supabase'

export interface ReportWithDetails extends Report {
  problem_type: {
    name: string
    description: string | null
  }
  commune: {
    name: string
  }
  user: {
    full_name: string | null
    email: string | null
  } | null
  images: ReportImage[]
  _count: {
    images: number
  }
}

export interface CreateReportData {
  problem_type_id: string
  commune_id: string
  description: string
  address: string
  coordinates?: string
  priority: 'low' | 'medium' | 'high'
  is_anonymous: boolean
  user_id?: string
  images?: File[]
}

export function useReports() {
  const [reports, setReports] = useState<ReportWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Générer un ID unique pour le signalement
  const generateReportId = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 3).toUpperCase()
    return `RPT-${timestamp}-${random}`
  }

  // Créer un nouveau signalement
  const createReport = async (reportData: CreateReportData) => {
    setLoading(true)
    setError(null)

    try {
      const reportId = generateReportId()

      // Créer le signalement
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert([
          {
            report_id: reportId,
            problem_type_id: reportData.problem_type_id,
            commune_id: reportData.commune_id,
            user_id: reportData.user_id || null,
            description: reportData.description,
            address: reportData.address,
            coordinates: reportData.coordinates,
            priority: reportData.priority,
            status: 'pending',
            is_anonymous: reportData.is_anonymous,
          },
        ])
        .select()
        .single()

      if (reportError) throw reportError

      // Upload des images si présentes
      if (reportData.images && reportData.images.length > 0) {
        const imageUrls = await uploadImages(reportData.images, report.id)
        
        // Sauvegarder les URLs des images
        if (imageUrls.length > 0) {
          const { error: imageError } = await supabase
            .from('report_images')
            .insert(
              imageUrls.map(url => ({
                report_id: report.id,
                image_url: url,
              }))
            )

          if (imageError) {
            console.error('Error saving image URLs:', imageError)
          }
        }
      }

      return { data: report, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du signalement'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Upload des images vers Supabase Storage
  const uploadImages = async (files: File[], reportId: string): Promise<string[]> => {
    const urls: string[] = []

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${reportId}/${Date.now()}.${fileExt}`

        const { data, error } = await supabase.storage
          .from('report-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (error) {
          console.error('Error uploading image:', error)
          continue
        }

        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from('report-images')
          .getPublicUrl(fileName)

        if (urlData.publicUrl) {
          urls.push(urlData.publicUrl)
        }
      } catch (err) {
        console.error('Error uploading image:', err)
      }
    }

    return urls
  }

  // Récupérer tous les signalements
  const fetchReports = async (filters?: {
    status?: string
    commune_id?: string
    problem_type_id?: string
    limit?: number
  }) => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('reports')
        .select(`
          *,
          problem_type:problem_types(name, description),
          commune:communes(name),
          user:users(full_name, email),
          images:report_images(*),
          _count:report_images(count)
        `)
        .order('created_at', { ascending: false })

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters?.commune_id) {
        query = query.eq('commune_id', filters.commune_id)
      }

      if (filters?.problem_type_id) {
        query = query.eq('problem_type_id', filters.problem_type_id)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error

      setReports(data || [])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des signalements'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Mettre à jour le statut d'un signalement
  const updateReportStatus = async (reportId: string, status: Report['status']) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select()
        .single()

      if (error) throw error

      // Mettre à jour la liste locale
      setReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, status, updated_at: new Date().toISOString() }
            : report
        )
      )

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      return { data: null, error: errorMessage }
    }
  }

  // Récupérer les statistiques
  const getStats = async (commune_id?: string) => {
    try {
      let query = supabase
        .from('reports')
        .select('status')

      if (commune_id) {
        query = query.eq('commune_id', commune_id)
      }

      const { data, error } = await query

      if (error) throw error

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(r => r.status === 'pending').length || 0,
        inProgress: data?.filter(r => r.status === 'in-progress').length || 0,
        resolved: data?.filter(r => r.status === 'resolved').length || 0,
        rejected: data?.filter(r => r.status === 'rejected').length || 0,
      }

      return { data: stats, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques'
      return { data: null, error: errorMessage }
    }
  }

  // Récupérer un signalement par ID
  const getReportById = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          problem_type:problem_types(name, description),
          commune:communes(name),
          user:users(full_name, email),
          images:report_images(*)
        `)
        .eq('id', reportId)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du signalement'
      return { data: null, error: errorMessage }
    }
  }

  return {
    reports,
    loading,
    error,
    createReport,
    fetchReports,
    updateReportStatus,
    getStats,
    getReportById,
  }
} 