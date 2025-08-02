import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  FileText,
  MapPin,
  Users,
  Calendar,
  Eye,
  MessageSquare,
  Bell,
  Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

interface Report {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  commune_id: string;
  problem_type_id: string;
  created_at: string;
  user_id: string;
  address?: string;
  commune?: {
    name: string;
  };
  problem_type?: {
    name: string;
  };
  images?: {
    id: string;
    image_url: string;
  }[];
}

const CitizenDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log('🔍 CitizenDashboard: useEffect - user:', user?.id, 'loading:', loading);
    
    if (user?.id) {
      console.log('✅ CitizenDashboard: Utilisateur connecté, démarrage des opérations');
      fetchMyReports();
      const cleanup = setupRealtimeSubscription();
      
      // Ajouter un intervalle de rafraîchissement pour s'assurer de la synchronisation
      const refreshInterval = setInterval(() => {
        console.log('🔄 CitizenDashboard: Rafraîchissement automatique des données');
        fetchMyReports();
      }, 30000); // Rafraîchir toutes les 30 secondes

      return () => {
        console.log('🧹 CitizenDashboard: Nettoyage des abonnements');
        cleanup();
        clearInterval(refreshInterval);
      };
    } else {
      console.log('⚠️ CitizenDashboard: Utilisateur non connecté, nettoyage des données');
      setReports([]);
      setFilteredReports([]);
    }
  }, [user?.id]);

  useEffect(() => {
    filterReports();
  }, [reports, statusFilter, searchTerm]);

  const setupRealtimeSubscription = () => {
    console.log('🔔 CitizenDashboard: Configuration de la synchronisation temps réel');
    
    const subscription = supabase
      .channel('reports_changes')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'reports'
        },
        (payload: any) => {
          console.log('🔔 CitizenDashboard: Événement reçu:', payload.eventType, payload);
          
          // Vérifier si c'est un signalement de l'utilisateur connecté
          if (payload.new?.user_id === user?.id || payload.old?.user_id === user?.id) {
            console.log('🔔 CitizenDashboard: Changement détecté sur un signalement personnel');
            
            const { eventType, new: newRecord, old: oldRecord } = payload;
            
            switch (eventType) {
              case 'INSERT':
                // Nouveau signalement
                console.log('🔔 CitizenDashboard: Nouveau signalement personnel reçu');
                fetchMyReports();
                break;
                
              case 'UPDATE':
                // Mise à jour de statut
                console.log('🔔 CitizenDashboard: Mise à jour de signalement personnel');
                setReports(prev => 
                  prev.map(report => 
                    report.id === newRecord.id 
                      ? { ...report, ...newRecord }
                      : report
                  )
                );
                
                // Notification personnalisée selon l'action
                if (newRecord.status !== oldRecord.status) {
                  let message = '';
                  switch (newRecord.status) {
                    case 'in-progress':
                      message = `Votre signalement a été approuvé et est en cours de traitement.`;
                      break;
                    case 'resolved':
                      message = `Votre signalement a été résolu avec succès !`;
                      break;
                    case 'rejected':
                      message = `Votre signalement n'a pas été approuvé par les autorités.`;
                      break;
                  }
                  
                  toast({
                    title: "Mise à jour de votre signalement",
                    description: message,
                    variant: newRecord.status === 'rejected' ? 'destructive' : 'default'
                  });
                }
                break;
                
              case 'DELETE':
                // Suppression de signalement
                console.log('🔔 CitizenDashboard: Suppression de signalement personnel');
                setReports(prev => prev.filter(report => report.id !== oldRecord.id));
                
                toast({
                  title: "Signalement supprimé",
                  description: `Votre signalement a été supprimé.`,
                  variant: 'default'
                });
                break;
            }
          } else {
            console.log('🔔 CitizenDashboard: Événement ignoré (pas pour cet utilisateur)');
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 CitizenDashboard: Statut de l\'abonnement:', status);
      });

    // Retourner une fonction de nettoyage
    return () => {
      console.log('🔔 CitizenDashboard: Nettoyage de la synchronisation temps réel');
      subscription.unsubscribe();
    };
  };

  const deleteMyReport = async (reportId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce signalement ? Cette action est irréversible et supprimera le signalement pour tous les utilisateurs.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', user?.id); // Sécurité : vérifier que c'est bien le signalement de l'utilisateur

      if (error) {
        console.error('Erreur suppression signalement:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le signalement",
          variant: "destructive"
        });
        return;
      }

      // Mise à jour locale immédiate
      setReports(prev => prev.filter(report => report.id !== reportId));

      toast({
        title: "Signalement supprimé",
        description: "Votre signalement a été supprimé avec succès",
      });

    } catch (error) {
      console.error('Erreur suppression:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    }
  };

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      
      // Vérifier que l'utilisateur est connecté
      if (!user?.id) {
        console.log('⚠️ CitizenDashboard: Utilisateur non connecté ou ID manquant');
        setReports([]);
        return;
      }
      
      console.log('🔍 CitizenDashboard: Récupération des signalements pour user:', user.id);
      
      // Vérifier la connexion Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('❌ CitizenDashboard: Erreur session Supabase:', sessionError);
        throw new Error('Erreur de connexion à la base de données');
      }
      
      if (!session) {
        console.log('⚠️ CitizenDashboard: Aucune session active');
        setReports([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          commune:communes(name),
          problem_type:problem_types(name),
          images:report_images(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ CitizenDashboard: Erreur récupération signalements:', error);
        
        // Gérer les erreurs spécifiques
        if (error.code === 'PGRST116') {
          throw new Error('Erreur de connexion à la base de données. Vérifiez votre connexion internet.');
        } else if (error.code === '42501') {
          throw new Error('Accès refusé. Vérifiez vos permissions.');
        } else {
          throw new Error(`Erreur de récupération: ${error.message}`);
        }
      }

      console.log('✅ CitizenDashboard: Signalements récupérés:', data?.length || 0);
      setReports(data || []);
      
    } catch (error) {
      console.error('❌ CitizenDashboard: Erreur lors du chargement des signalements:', error);
      
      // Message d'erreur plus informatif
      let errorMessage = "Impossible de charger vos signalements";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur de chargement",
        description: errorMessage,
        variant: "destructive"
      });
      
      // En cas d'erreur, vider la liste
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.address && report.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredReports(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'in-progress': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">En attente</Badge>;
      case 'in-progress': return <Badge variant="default">En cours</Badge>;
      case 'resolved': return <Badge variant="default" className="bg-green-100 text-green-800">Résolu</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejeté</Badge>;
      default: return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low': return <Badge variant="outline" className="bg-green-50 text-green-700">Faible</Badge>;
      case 'medium': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Moyenne</Badge>;
      case 'high': return <Badge variant="outline" className="bg-orange-50 text-orange-700">Élevée</Badge>;
      case 'critical': return <Badge variant="outline" className="bg-red-50 text-red-700">Critique</Badge>;
      default: return <Badge variant="outline">Inconnue</Badge>;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending': return "Votre signalement est en attente d'examen par les autorités.";
      case 'in-progress': return "Votre signalement a été approuvé et est en cours de traitement.";
      case 'resolved': return "Votre signalement a été résolu avec succès !";
      case 'rejected': return "Votre signalement n'a pas été approuvé par les autorités.";
      default: return "Statut inconnu.";
    }
  };

  const getReportTitle = (description: string) => {
    // Extraire un titre court de la description
    const words = description.split(' ');
    if (words.length <= 8) return description;
    return words.slice(0, 8).join(' ') + '...';
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Mon Tableau de Bord
          </h1>
          <p className="text-white/80">
            Suivez l'état de vos signalements en temps réel
          </p>
          <p className="text-sm text-white/60 mt-2">
            Utilisateur: {user?.full_name} (ID: {user?.id})
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="shadow-glow border-white/20 bg-white/95 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="shadow-glow border-white/20 bg-white/95 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="shadow-glow border-white/20 bg-white/95 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <AlertTriangle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="shadow-glow border-white/20 bg-white/95 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Résolus</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            </CardContent>
          </Card>

          <Card className="shadow-glow border-white/20 bg-white/95 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card className="mb-8 shadow-glow border-white/20 bg-white/95 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Actions Rapides
            </CardTitle>
            <CardDescription>
              Gérez vos signalements et restez informé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link to="/signaler">
                <Button className="flex items-center gap-2 shadow-glow">
                  <AlertTriangle className="h-4 w-4" />
                  Nouveau Signalement
                </Button>
              </Link>
              
              <Button variant="outline" className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border-white/20">
                <MessageSquare className="h-4 w-4" />
                Contacter le Support
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border-white/20">
                <Eye className="h-4 w-4" />
                Voir les Statistiques
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Rechercher dans vos signalements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm bg-white/95 backdrop-blur-md border-white/20"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/95 backdrop-blur-md"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in-progress">En cours</option>
            <option value="resolved">Résolu</option>
            <option value="rejected">Rejeté</option>
          </select>
        </div>

        {/* Liste des Signalements */}
        <Card className="shadow-glow border-white/20 bg-white/95 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Mes Signalements ({filteredReports.length})</CardTitle>
            <CardDescription>
              Suivi en temps réel de vos signalements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {reports.length === 0 
                    ? "Vous n'avez pas encore de signalements. Commencez par en créer un !"
                    : "Aucun signalement ne correspond à vos filtres."
                  }
                </p>
                {reports.length === 0 && (
                  <Link to="/signaler">
                    <Button className="shadow-glow">
                      Créer mon premier signalement
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="border border-white/20 rounded-lg p-6 hover:bg-white/10 transition-colors bg-white/50 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          {getStatusIcon(report.status)}
                          <h3 className="font-semibold text-lg">{getReportTitle(report.description)}</h3>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{report.description}</p>
                        
                        {/* Affichage des images */}
                        {report.images && report.images.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Images ({report.images.length})</p>
                            <div className="flex gap-2 overflow-x-auto">
                              {report.images.map((image, index) => (
                                <img
                                  key={image.id}
                                  src={image.image_url}
                                  alt={`Image ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border border-white/20"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          {report.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {report.address}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {report.commune?.name || 'Commune inconnue'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {report.problem_type?.name || 'Type inconnu'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(report.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        
                        <div className="flex gap-2 mb-3">
                          {getStatusBadge(report.status)}
                          {getPriorityBadge(report.priority)}
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            {getStatusMessage(report.status)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Bouton de suppression */}
                      <div className="ml-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMyReport(report.id)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CitizenDashboard; 