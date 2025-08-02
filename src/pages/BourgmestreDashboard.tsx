import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  FileText
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ReportsChart } from "@/components/charts/ReportsChart";
import { PDFService } from "@/services/pdfService";
import { useRealtimeNotifications } from "@/services/realtimeService";
import { supabase } from "@/lib/supabase";

interface Report {
  id: string;
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
  images?: {
    id: string;
    image_url: string;
  }[];
}

const BourgmestreDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChartType, setSelectedChartType] = useState<'by_status' | 'by_priority' | 'by_problem_type' | 'by_month'>('by_status');
  const [communeName, setCommuneName] = useState<string>("");

  // Notifications temps réel
  const { subscribeToReports } = useRealtimeNotifications({
    commune_id: user?.commune_id,
    userRole: 'bourgmestre'
  });

  useEffect(() => {
    if (user?.commune_id) {
      fetchCommuneName();
      fetchReports();
    }
    
    // Abonnement aux notifications temps réel
    const subscription = subscribeToReports((payload) => {
      if (payload.eventType === 'INSERT') {
        fetchReports(); // Recharger les données
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [user?.commune_id]);

  useEffect(() => {
    filterReports();
  }, [reports, statusFilter, priorityFilter, searchTerm]);

  const fetchCommuneName = async () => {
    if (!user?.commune_id) return;
    
    try {
      const { data, error } = await supabase
        .from('communes')
        .select('name')
        .eq('id', user.commune_id)
        .single();

      if (!error && data) {
        setCommuneName(data.name);
      }
    } catch (error) {
      console.error('Erreur récupération nom commune:', error);
    }
  };

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
        .eq('commune_id', user?.commune_id)
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

  const filterReports = () => {
    let filtered = reports;

    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(report => report.priority === priorityFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getReportTitle = (description: string) => {
    const words = description.split(' ');
    if (words.length <= 8) return description;
    return words.slice(0, 8).join(' ') + '...';
  };

  const generatePDFReport = async () => {
    try {
      await PDFService.generateDashboardReport(
        filteredReports,
        'bourgmestre',
        communeName
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
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Dashboard Bourgmestre
          </h1>
          <p className="text-white/80">
            Commune: {communeName || 'Non assignée'}
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
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

          <Card className="shadow-glow border-white/20 bg-white/95 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critiques</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-glow border-white/20 bg-white/95 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Statistiques des Signalements</CardTitle>
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

          <Card className="shadow-glow border-white/20 bg-white/95 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Types de Problèmes</CardTitle>
              <CardDescription>
                Répartition par type de problème
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsChart
                reports={reports}
                type="bar"
                chartType="by_problem_type"
                title="Signalements par Type"
                height={300}
              />
            </CardContent>
          </Card>
        </div>

        {/* Évolution temporelle */}
        <Card className="mb-8 shadow-glow border-white/20 bg-white/95 backdrop-blur-md">
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
              className="max-w-sm bg-white/95 backdrop-blur-md border-white/20"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white/95 backdrop-blur-md border-white/20">
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
            <SelectTrigger className="w-[180px] bg-white/95 backdrop-blur-md border-white/20">
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

          <Button onClick={generatePDFReport} className="flex items-center gap-2 shadow-glow">
            <Download className="h-4 w-4" />
            Générer PDF
          </Button>
        </div>

        {/* Liste des Signalements */}
        <Card className="shadow-glow border-white/20 bg-white/95 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Signalements ({filteredReports.length})</CardTitle>
            <CardDescription>
              Liste des signalements de votre commune
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
                    className="border border-white/20 rounded-lg p-4 hover:bg-white/10 transition-colors bg-white/50 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(report.status)}
                          <h3 className="font-semibold text-lg">{getReportTitle(report.description)}</h3>
                        </div>
                        <p className="text-gray-700 mb-3">{report.description}</p>
                        
                        {/* Affichage des images */}
                        {report.images && report.images.length > 0 && (
                          <div className="mb-3">
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
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
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

export default BourgmestreDashboard;