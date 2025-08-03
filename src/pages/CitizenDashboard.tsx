import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Plus, 
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Eye,
  BarChart3,
  User,
  MapPin,
  FileText
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
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

const CitizenDashboard = () => {
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

  const fetchMyReports = async () => {
    if (!user) return;

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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération de mes signalements:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos signalements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, [user]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mon Tableau de Bord</h1>
              <p className="text-gray-600 mt-2">
                Suivez l'évolution de vos signalements et contribuez à l'amélioration de Kinshasa
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={fetchMyReports}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </Button>
              <Link to="/signaler">
                <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nouveau Signalement</span>
                </Button>
              </Link>
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
                <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-blue-200" />
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
                title="Mes Signalements par Statut"
                height={300}
              />
              <ReportsChart
                reports={reports}
                type="bar"
                chartType="by_problem_type"
                title="Mes Types de Problèmes"
                height={300}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <ReportsChart
                reports={reports}
                type="line"
                chartType="by_month"
                title="Évolution de Mes Signalements"
                height={300}
              />
              <ReportsChart
                reports={reports}
                type="area"
                chartType="by_priority"
                title="Répartition par Priorité"
                height={300}
              />
            </div>
          </div>
        )}

        {/* Welcome Card */}
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Bienvenue, {user?.full_name || 'Citoyen'} !
                </h3>
                <p className="text-gray-600 text-sm lg:text-base mb-2">
                  Email: {user?.email || 'Non renseigné'}
                </p>
                <p className="text-gray-600 text-sm lg:text-base">
                  Vous avez contribué à {stats.total} signalement{stats.total > 1 ? 's' : ''} pour améliorer Kinshasa. 
                  Continuez votre engagement citoyen !
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link to="/signaler">
                  <Button className="bg-primary hover:bg-primary/90 w-full lg:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Signalement
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher dans vos signalements..."
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
              <p className="text-gray-600">Chargement de vos signalements...</p>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-8 lg:p-12 text-center">
              {reports.length === 0 ? (
                <>
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun signalement encore</h3>
                  <p className="text-gray-600 mb-6 text-sm lg:text-base">
                    Vous n'avez pas encore créé de signalement. Commencez par signaler un problème dans votre quartier !
                  </p>
                  <Link to="/signaler">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Créer mon premier signalement
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun signalement trouvé</h3>
                  <p className="text-gray-600 text-sm lg:text-base">
                    Aucun de vos signalements ne correspond à vos critères de recherche.
                  </p>
                </>
              )}
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
        isAdmin={false}
      />
    </div>
  );
};

export default CitizenDashboard; 