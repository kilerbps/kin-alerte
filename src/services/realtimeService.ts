import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface RealtimeReport {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  commune_id: string;
  problem_type_id: string;
  created_at: string;
  commune?: {
    name: string;
  };
  problem_type?: {
    name: string;
  };
}

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: RealtimeReport;
  old: RealtimeReport;
}

export class RealtimeService {
  private static subscriptions: Map<string, any> = new Map();

  static subscribeToReports(callback: (payload: RealtimePayload) => void, filters?: {
    commune_id?: string;
    status?: string;
    userRole?: string;
    user_id?: string; // Ajout du filtre par utilisateur
  }) {
    console.log('🔔 RealtimeService: Abonnement aux signalements');

    const subscription = supabase
      .channel('reports_changes')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'reports'
        },
        (payload: RealtimePayload) => {
          console.log('🔔 RealtimeService: Nouveau signalement reçu:', payload);
          
          // Filtrer selon les permissions de l'utilisateur
          if (filters) {
            if (filters.commune_id && payload.new?.commune_id !== filters.commune_id) {
              return; // Ignorer si pas dans la même commune
            }
            if (filters.status && payload.new?.status !== filters.status) {
              return; // Ignorer si pas le bon statut
            }
            if (filters.user_id && payload.new?.user_id !== filters.user_id && payload.old?.user_id !== filters.user_id) {
              return; // Ignorer si pas le bon utilisateur
            }
          }

          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('🔔 RealtimeService: Statut de l\'abonnement:', status);
      });

    this.subscriptions.set('reports', subscription);
    return subscription;
  }

  static subscribeToComments(callback: (payload: any) => void, reportId?: string) {
    console.log('🔔 RealtimeService: Abonnement aux commentaires');

    const subscription = supabase
      .channel('comments_changes')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: reportId ? `report_id=eq.${reportId}` : undefined
        },
        (payload) => {
          console.log('🔔 RealtimeService: Nouveau commentaire reçu:', payload);
          callback(payload);
        }
      )
      .subscribe();

    this.subscriptions.set('comments', subscription);
    return subscription;
  }

  static subscribeToStatusChanges(callback: (payload: any) => void, reportId?: string) {
    console.log('🔔 RealtimeService: Abonnement aux changements de statut');

    const subscription = supabase
      .channel('status_changes')
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reports',
          filter: reportId ? `id=eq.${reportId}` : undefined
        },
        (payload) => {
          console.log('🔔 RealtimeService: Changement de statut reçu:', payload);
          callback(payload);
        }
      )
      .subscribe();

    this.subscriptions.set('status_changes', subscription);
    return subscription;
  }

  static unsubscribe(channel: string) {
    const subscription = this.subscriptions.get(channel);
    if (subscription) {
      console.log(`🔔 RealtimeService: Désabonnement de ${channel}`);
      supabase.removeChannel(subscription);
      this.subscriptions.delete(channel);
    }
  }

  static unsubscribeAll() {
    console.log('🔔 RealtimeService: Désabonnement de tous les canaux');
    this.subscriptions.forEach((subscription, channel) => {
      supabase.removeChannel(subscription);
    });
    this.subscriptions.clear();
  }

  static sendNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    // Utiliser le système de toast existant
    const { toast } = useToast();
    
    toast({
      title,
      description: message,
      variant: type === 'error' ? 'destructive' : 'default'
    });
  }

  static async sendPushNotification(userId: string, title: string, message: string) {
    try {
      // Ici vous pourriez intégrer un service de push notifications
      // Pour l'instant, on utilise les toasts
      console.log(`🔔 Push notification pour ${userId}: ${title} - ${message}`);
      
      // Exemple avec une table de notifications
      const { error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: userId,
            title,
            message,
            type: 'push',
            read: false
          }
        ]);

      if (error) {
        console.error('Erreur envoi notification:', error);
      }
    } catch (error) {
      console.error('Erreur push notification:', error);
    }
  }
}

// Hook React pour utiliser les notifications temps réel
export const useRealtimeNotifications = (filters?: {
  commune_id?: string;
  status?: string;
  userRole?: string;
}) => {
  const { toast } = useToast();

  const subscribeToReports = (callback?: (payload: RealtimePayload) => void) => {
    return RealtimeService.subscribeToReports((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      let title = '';
      let message = '';

      switch (eventType) {
        case 'INSERT':
          title = 'Nouveau signalement';
          message = `Nouveau signalement: ${newRecord.title}`;
          break;
        case 'UPDATE':
          if (newRecord.status !== oldRecord.status) {
            title = 'Statut mis à jour';
            message = `Le signalement "${newRecord.title}" est maintenant ${newRecord.status}`;
          }
          break;
        case 'DELETE':
          title = 'Signalement supprimé';
          message = `Le signalement "${oldRecord.title}" a été supprimé`;
          break;
      }

      if (title && message) {
        toast({
          title,
          description: message,
          variant: eventType === 'INSERT' ? 'default' : 'default'
        });
      }

      if (callback) {
        callback(payload);
      }
    }, filters);
  };

  const subscribeToComments = (callback?: (payload: any) => void, reportId?: string) => {
    return RealtimeService.subscribeToComments((payload) => {
      const { eventType, new: newRecord } = payload;

      if (eventType === 'INSERT') {
        toast({
          title: 'Nouveau commentaire',
          description: `Nouveau commentaire sur le signalement`,
          variant: 'default'
        });
      }

      if (callback) {
        callback(payload);
      }
    }, reportId);
  };

  return {
    subscribeToReports,
    subscribeToComments,
    unsubscribe: RealtimeService.unsubscribe,
    unsubscribeAll: RealtimeService.unsubscribeAll
  };
}; 