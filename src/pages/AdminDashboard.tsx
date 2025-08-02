import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Download,
  TrendingUp,
  MapPin,
  Users,
  FileText,
  Globe,
  Trash2,
  Check,
  X,
  Edit
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ReportsChart } from "@/components/charts/ReportsChart";
import { PDFService } from "@/services/pdfService";
import { useRealtimeNotifications } from "@/services/realtimeService";
import { supabase } from "@/lib/supabase";

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  commune_id: string;
  problem_type_id: string;
  created_at: string;
  user_id: string;
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [communeFilter, setCommuneFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [communes, setCommunes] = useState<{ id: string; name: string }[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Notifications temps réel
  const { subscribeToReports } = useRealtimeNotifications({
    userRole: 'admin'
  });

  useEffect(() => {
    fetchReports();
    fetchCommunes();
    
    // Abonnement aux notifications temps réel
    const subscription = subscribeToReports((payload) => {
      console.log('🔔 AdminDashboard: Changement détecté:', payload.eventType);
      
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          // Nouveau signalement
          console.log('🔔 AdminDashboard: Nouveau signalement reçu');
          fetchReports(); // Recharger pour avoir toutes les données
          break;
          
        case 'UPDATE':
          // Mise à jour de statut
          console.log('🔔 AdminDashboard: Mise à jour de signalement');
          setReports(prev => 
            prev.map(report => 
              report.id === newRecord.id 
                ? { ...report, ...newRecord }
                : report
            )
          );
          break;
          
        case 'DELETE':
          // Suppression de signalement
          console.log('🔔 AdminDashboard: Suppression de signalement');
          setReports(prev => prev.filter(report => report.id !== oldRecord.id));
          break;
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, statusFilter, priorityFilter, communeFilter, searchTerm]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          commune:communes(name),
          problem_type:problem_types(name),
          images:report_images(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les signalements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunes = async () => {
    try {
      const { data, error } = await supabase
        .from('communes')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCommunes(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des communes:', error);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(report => report.priority === priorityFilter);
    }

    if (communeFilter !== "all") {
      filtered = filtered.filter(report => report.commune_id === communeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.commune?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const updateReportStatus = async (reportId: string, newStatus: 'in-progress' | 'resolved' | 'rejected') => {
    try {
      setActionLoading(reportId);
      
      // Mettre à jour dans Supabase
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      // Mettre à jour les données locales immédiatement
      setReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, status: newStatus, updated_at: new Date().toISOString() }
            : report
        )
      );

      // Message de succès personnalisé
      let successMessage = '';
      switch (newStatus) {
        case 'in-progress':
          successMessage = 'Signalement approuvé et mis en cours de traitement';
          break;
        case 'resolved':
          successMessage = 'Signalement marqué comme résolu';
          break;
        case 'rejected':
          successMessage = 'Signalement rejeté (restera visible pour le citoyen)';
          break;
      }

      toast({
        title: "Succès",
        description: successMessage,
      });

    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce signalement ? Cette action est irréversible et supprimera le signalement pour tous les utilisateurs.')) {
      return;
    }

    try {
      setActionLoading(reportId);
      
      // Supprimer de Supabase
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      // Mettre à jour les données locales immédiatement
      setReports(prev => prev.filter(report => report.id !== reportId));

      toast({
        title: "Succès",
        description: "Signalement supprimé définitivement",
      });

    } catch (error) {
      console.error('Erreur suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le signalement",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
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

  const generatePDFReport = async () => {
    try {
      await PDFService.generateDashboardReport(
        filteredReports,
        'admin'
      );
      
      toast({
        title: "Rapport généré",
        description: "Le rapport PDF a été téléchargé avec succès",
      });
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport PDF",
        variant: "destructive"
      });
    }
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
    critical: reports.filter(r => r.priority === 'critical').length,
    communes: new Set(reports.map(r => r.commune_id)).size,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Administrateur
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble de tous les signalements de Kinshasa
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <AlertTriangle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Résolus</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critiques</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Communes</CardTitle>
              <Globe className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.communes}</div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques Globales</CardTitle>
              <CardDescription>
                Vue d'ensemble des signalements par statut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsChart
                reports={reports}
                type="pie"
                chartType="by_status"
                title="Signalements par Statut"
                height={300}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signalements par Commune</CardTitle>
              <CardDescription>
                Répartition par commune
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsChart
                reports={reports}
                type="bar"
                chartType="by_commune"
                title="Signalements par Commune"
                height={300}
              />
            </CardContent>
          </Card>
        </div>

        {/* Évolution temporelle */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Évolution des Signalements</CardTitle>
            <CardDescription>
              Tendances mensuelles des signalements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportsChart
              reports={reports}
              type="line"
              chartType="by_month"
              title="Évolution Mensuelle"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Filtres et Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un signalement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="in-progress">En cours</SelectItem>
              <SelectItem value="resolved">Résolu</SelectItem>
              <SelectItem value="rejected">Rejeté</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les priorités</SelectItem>
              <SelectItem value="low">Faible</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="high">Élevée</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
            </SelectContent>
          </Select>

          <Select value={communeFilter} onValueChange={setCommuneFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Commune" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les communes</SelectItem>
              {communes.map((commune) => (
                <SelectItem key={commune.id} value={commune.id}>
                  {commune.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={generatePDFReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Générer PDF
          </Button>
        </div>

        {/* Liste des Signalements */}
        <Card>
          <CardHeader>
            <CardTitle>Signalements ({filteredReports.length})</CardTitle>
            <CardDescription>
              Liste de tous les signalements de Kinshasa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun signalement trouvé
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(report.status)}
                          <h3 className="font-semibold text-lg">{report.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-3">{report.description}</p>
                        
                        {/* Affichage des images */}
                        {report.images && report.images.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-500 mb-2">Images ({report.images.length})</p>
                            <div className="flex gap-2 overflow-x-auto">
                              {report.images.map((image, index) => (
                                <img
                                  key={image.id}
                                  src={image.image_url}
                                  alt={`Image ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {report.commune?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {report.problem_type?.name}
                          </span>
                          <span>
                            {new Date(report.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(report.status)}
                        {getPriorityBadge(report.priority)}
                        
                        {/* Actions d'administration */}
                        <div className="flex gap-2 mt-2">
                          {report.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateReportStatus(report.id, 'in-progress')}
                                disabled={actionLoading === report.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateReportStatus(report.id, 'rejected')}
                                disabled={actionLoading === report.id}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {report.status === 'in-progress' && (
                            <Button
                              size="sm"
                              onClick={() => updateReportStatus(report.id, 'resolved')}
                              disabled={actionLoading === report.id}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteReport(report.id)}
                            disabled={actionLoading === report.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

export default AdminDashboard;