import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Users, 
  MapPin, 
  TrendingUp, 
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
  Download,
  Filter,
  Eye,
  MessageSquare,
  Award,
  Globe,
  Smartphone
} from "lucide-react";
import { Link } from "react-router-dom";
import { useReports } from "@/hooks/useReports";
import { useToast } from "@/hooks/use-toast";

const Stats = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedCommune, setSelectedCommune] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    resolutionRate: 0
  });
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { getStats, fetchReports } = useReports();
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, [selectedPeriod, selectedCommune]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques
      const { data: statsData } = await getStats(selectedCommune === "all" ? undefined : selectedCommune);
      if (statsData) {
        setStats({
          total: statsData.total || 0,
          pending: statsData.pending || 0,
          inProgress: statsData.inProgress || 0,
          resolved: statsData.resolved || 0,
          resolutionRate: statsData.total > 0 ? Math.round((statsData.resolved / statsData.total) * 100) : 0
        });
      }

      // Charger les signalements récents
      const { data: reportsData } = await fetchReports({ limit: 10 });
      if (reportsData) {
        setReports(reportsData);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const communes = [
    { id: "all", name: "Toutes les communes" },
    { id: "gombe", name: "Gombe" },
    { id: "kalamu", name: "Kalamu" },
    { id: "limete", name: "Limete" },
    { id: "ngaliema", name: "Ngaliema" },
    { id: "masina", name: "Masina" },
    { id: "kimbanseke", name: "Kimbanseke" }
  ];

  const periods = [
    { value: "week", label: "Cette semaine" },
    { value: "month", label: "Ce mois" },
    { value: "quarter", label: "Ce trimestre" },
    { value: "year", label: "Cette année" }
  ];

  const problemTypeStats = [
    { name: "Ordures ménagères", count: 347, percentage: 28, color: "bg-red-500" },
    { name: "Éclairage public", count: 234, percentage: 19, color: "bg-yellow-500" },
    { name: "Voirie dégradée", count: 198, percentage: 16, color: "bg-orange-500" },
    { name: "Inondations", count: 156, percentage: 12, color: "bg-blue-500" },
    { name: "Approvisionnement en eau", count: 134, percentage: 11, color: "bg-cyan-500" },
    { name: "Autres", count: 178, percentage: 14, color: "bg-gray-500" }
  ];

  const communeStats = [
    { name: "Gombe", total: 156, resolved: 134, pending: 22, rate: 86 },
    { name: "Kalamu", total: 142, resolved: 118, pending: 24, rate: 83 },
    { name: "Limete", total: 128, resolved: 105, pending: 23, rate: 82 },
    { name: "Ngaliema", total: 134, resolved: 112, pending: 22, rate: 84 },
    { name: "Masina", total: 167, resolved: 138, pending: 29, rate: 83 },
    { name: "Kimbanseke", total: 189, resolved: 145, pending: 44, rate: 77 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="text-primary border-primary">
              Statistiques en temps réel
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
              Impact de Kinshasa-Alerte
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez l'impact de notre plateforme sur l'amélioration de Kinshasa
            </p>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedCommune} onValueChange={setSelectedCommune}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Commune" />
                </SelectTrigger>
                <SelectContent>
                  {communes.map((commune) => (
                    <SelectItem key={commune.id} value={commune.id}>
                      {commune.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total signalements</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">En attente</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">{stats.inProgress}</div>
                <div className="text-sm text-muted-foreground">En cours</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">{stats.resolved}</div>
                <div className="text-sm text-muted-foreground">Résolus</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">{stats.resolutionRate}%</div>
                <div className="text-sm text-muted-foreground">Taux de résolution</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Stats */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="problems" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="problems">Par type de problème</TabsTrigger>
              <TabsTrigger value="communes">Par commune</TabsTrigger>
              <TabsTrigger value="recent">Signalements récents</TabsTrigger>
            </TabsList>

            <TabsContent value="problems">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Répartition par type de problème
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {problemTypeStats.map((stat, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-48 text-sm font-medium">{stat.name}</div>
                        <div className="flex-1 mx-4">
                          <div className="w-full bg-muted rounded-full h-3">
                            <div 
                              className={`${stat.color} h-3 rounded-full transition-all duration-500`}
                              style={{ width: `${stat.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-20 text-right text-sm font-medium">{stat.count}</div>
                        <div className="w-16 text-right text-sm text-muted-foreground">{stat.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Performance par commune
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {communeStats.map((commune, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{commune.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {commune.total} signalements • {commune.resolved} résolus
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{commune.rate}%</div>
                          <div className="text-sm text-muted-foreground">Taux de résolution</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Signalements récents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3 text-muted-foreground">Chargement...</span>
                      </div>
                    ) : reports.length > 0 ? (
                      reports.map((report, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <AlertTriangle className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{report.report_id}</h3>
                              <p className="text-sm text-muted-foreground">
                                {report.problem_type?.name} • {report.commune?.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={
                                report.status === 'resolved' ? 'default' :
                                report.status === 'in-progress' ? 'secondary' :
                                'outline'
                              }
                            >
                              {report.status === 'resolved' ? 'Résolu' :
                               report.status === 'in-progress' ? 'En cours' :
                               'En attente'}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun signalement récent
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Contribuez à ces statistiques !
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez la communauté et aidez à améliorer Kinshasa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signaler">
              <Button size="lg" variant="secondary" className="group">
                Signaler un problème
                <AlertTriangle className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Stats; 