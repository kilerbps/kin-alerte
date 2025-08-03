import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Eye,
  BarChart3,
  Users,
  MapPin
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ReportCard } from "@/components/ui/report-card";
import { ReportDetailsModal } from "@/components/ui/report-details-modal";
import { ReportsChart } from "@/components/charts/ReportsChart";

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  commune_id: string;
  problem_type_id: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  images?: { id: string; image_url: string; }[];
  commune?: {
    name: string;
  };
  problem_type?: {
    name: string;
  };
  user?: {
    full_name: string;
    email: string;
  };
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
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
          user:users(full_name, email),
          images:report_images(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des signalements:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les signalements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', reportId);

      if (error) throw error;

      // Mettre à jour l'état local
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus as any, updated_at: new Date().toISOString() }
          : report
      ));

      toast({
        title: "Succès",
        description: `Statut mis à jour vers "${newStatus}"`,
      });

      // Fermer le modal si ouvert
      setIsDetailsModalOpen(false);
      setSelectedReport(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du signalement",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = (report.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (report.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (report.location?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setIsDetailsModalOpen(true);
  };

  const exportReports = () => {
    const csvContent = [
      ['ID', 'Titre', 'Description', 'Statut', 'Localisation', 'Commune', 'Type de problème', 'Date de création'],
      ...filteredReports.map(report => [
        report.id,
        report.title,
        report.description,
        report.status,
        report.location,
        report.commune?.name || '',
        report.problem_type?.name || '',
        new Date(report.created_at).toLocaleDateString('fr-FR')
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `signalements_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
              <p className="text-gray-600 mt-2">
                Gérez tous les signalements de la plateforme Kinshasa-Alerte
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={fetchReports}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </Button>
              <Button
                onClick={exportReports}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exporter CSV</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs lg:text-sm font-medium">Total</p>
                  <p className="text-xl lg:text-3xl font-bold">{stats.total}</p>
                </div>
                <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xs lg:text-sm font-medium">En attente</p>
                  <p className="text-xl lg:text-3xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs lg:text-sm font-medium">En cours</p>
                  <p className="text-xl lg:text-3xl font-bold">{stats.inProgress}</p>
                </div>
                <Loader2 className="h-6 w-6 lg:h-8 lg:w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs lg:text-sm font-medium">Résolus</p>
                  <p className="text-xl lg:text-3xl font-bold">{stats.resolved}</p>
                </div>
                <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-xs lg:text-sm font-medium">Rejetés</p>
                  <p className="text-xl lg:text-3xl font-bold">{stats.rejected}</p>
                </div>
                <XCircle className="h-6 w-6 lg:h-8 lg:w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {reports.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReportsChart
                reports={reports}
                type="pie"
                chartType="by_status"
                title="Répartition par Statut"
                height={300}
              />
              <ReportsChart
                reports={reports}
                type="bar"
                chartType="by_commune"
                title="Top 10 des Communes"
                height={300}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <ReportsChart
                reports={reports}
                type="bar"
                chartType="by_problem_type"
                title="Types de Problèmes"
                height={300}
              />
              <ReportsChart
                reports={reports}
                type="line"
                chartType="by_month"
                title="Évolution Mensuelle"
                height={300}
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par titre, description ou localisation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="resolved">Résolus</SelectItem>
                  <SelectItem value="rejected">Rejetés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600">Chargement des signalements...</p>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun signalement trouvé</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" 
                  ? "Aucun signalement ne correspond à vos critères de recherche."
                  : "Aucun signalement n'a encore été créé."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <ReportDetailsModal
        report={selectedReport}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedReport(null);
        }}
        onStatusUpdate={updateReportStatus}
        isAdmin={true}
      />
    </div>
  );
};

export default AdminDashboard;