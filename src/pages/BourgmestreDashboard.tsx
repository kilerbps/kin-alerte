import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const BourgmestreDashboard = () => {
  const [selectedCommune, setSelectedCommune] = useState("gombe");
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  // Mock data - TODO: Replace with Supabase data
  const communeStats = {
    gombe: {
      name: "Gombe",
      total: 156,
      resolved: 134,
      pending: 22,
      resolutionRate: 86
    }
  };

  const weeklyReports = [
    {
      id: "WR-001",
      period: "8-14 Janvier 2024",
      totalReports: 23,
      resolvedReports: 18,
      pendingReports: 5,
      categories: {
        "Ordures": 8,
        "Éclairage": 6,
        "Voirie": 5,
        "Autres": 4
      },
      resolutionRate: 78,
      status: "generated"
    },
    {
      id: "WR-002", 
      period: "1-7 Janvier 2024",
      totalReports: 19,
      resolvedReports: 17,
      pendingReports: 2,
      categories: {
        "Ordures": 7,
        "Éclairage": 5,
        "Voirie": 4,
        "Autres": 3
      },
      resolutionRate: 89,
      status: "reviewed"
    }
  ];

  const handleSendComment = () => {
    if (!comment.trim()) return;
    
    // TODO: Send comment to admin via Supabase
    toast({
      title: "Commentaire envoyé",
      description: "Votre commentaire a été transmis à l'administration.",
    });
    setComment("");
  };

  const handleDownloadReport = (reportId: string) => {
    // TODO: Generate and download PDF report
    toast({
      title: "Téléchargement",
      description: "Le rapport PDF sera disponible sous peu.",
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard Bourgmestre</h1>
              <p className="text-muted-foreground">Suivi des signalements de votre commune</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedCommune} onValueChange={setSelectedCommune}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gombe">Commune de Gombe</SelectItem>
                  <SelectItem value="kinshasa">Commune de Kinshasa</SelectItem>
                  <SelectItem value="ngaliema">Commune de Ngaliema</SelectItem>
                </SelectContent>
              </Select>
              <Link to="/">
                <Button variant="ghost">Retour site</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total signalements</p>
                  <p className="text-2xl font-bold">{communeStats.gombe.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-status-resolved/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-status-resolved" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Résolus</p>
                  <p className="text-2xl font-bold">{communeStats.gombe.resolved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-status-pending/10 rounded-lg">
                  <Clock className="h-6 w-6 text-status-pending" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold">{communeStats.gombe.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Taux de résolution</p>
                  <p className="text-2xl font-bold text-green-600">{communeStats.gombe.resolutionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">Rapports hebdomadaires</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
            <TabsTrigger value="comments">Mes commentaires</TabsTrigger>
          </TabsList>

          {/* Weekly Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Rapports hebdomadaires générés
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {weeklyReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-6 border border-border rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Rapport {report.period}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {report.period}
                            </span>
                            <Badge 
                              variant={report.status === 'reviewed' ? 'default' : 'outline'}
                            >
                              {report.status === 'reviewed' ? 'Consulté' : 'Nouveau'}
                            </Badge>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          onClick={() => handleDownloadReport(report.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger PDF
                        </Button>
                      </div>

                      {/* Report Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">Signalements</p>
                          <p className="text-2xl font-bold text-primary">{report.totalReports}</p>
                        </div>
                        
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">Résolus</p>
                          <p className="text-2xl font-bold text-green-600">{report.resolvedReports}</p>
                        </div>
                        
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">Taux de résolution</p>
                          <p className="text-2xl font-bold text-green-600">{report.resolutionRate}%</p>
                        </div>
                      </div>

                      {/* Categories Breakdown */}
                      <div className="space-y-2">
                        <p className="font-medium">Répartition par catégorie:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.entries(report.categories).map(([category, count]) => (
                            <div key={category} className="flex justify-between items-center text-sm">
                              <span>{category}:</span>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Évolution mensuelle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { month: "Janvier", reports: 89, resolved: 76 },
                      { month: "Décembre", reports: 76, resolved: 68 },
                      { month: "Novembre", reports: 92, resolved: 84 },
                      { month: "Octobre", reports: 65, resolved: 61 }
                    ].map((item) => (
                      <div key={item.month} className="flex items-center justify-between">
                        <span className="font-medium">{item.month}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-muted-foreground">
                            {item.reports} signalements
                          </span>
                          <span className="text-sm text-green-600">
                            {Math.round((item.resolved / item.reports) * 100)}% résolus
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Zones prioritaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { zone: "Centre-ville", issues: 23, priority: "high" },
                      { zone: "Marché Central", issues: 18, priority: "high" },
                      { zone: "Boulevard du 30 Juin", issues: 15, priority: "medium" },
                      { zone: "Avenue Kasa-Vubu", issues: 12, priority: "medium" },
                      { zone: "Quartier résidentiel", issues: 8, priority: "low" }
                    ].map((item) => (
                      <div key={item.zone} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.zone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{item.issues}</Badge>
                          <div 
                            className={`w-3 h-3 rounded-full ${
                              item.priority === 'high' ? 'bg-red-500' :
                              item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <div className="space-y-6">
              {/* Send Comment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Nouveau commentaire pour l'administration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Partagez vos observations, recommandations ou demandes à l'administration..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-32"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Ce commentaire sera visible par l'administration dans leur dashboard
                      </p>
                      <Button 
                        onClick={handleSendComment}
                        disabled={!comment.trim()}
                        variant="cta"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Previous Comments */}
              <Card>
                <CardHeader>
                  <CardTitle>Mes commentaires précédents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        date: "15 Jan 2024",
                        content: "Je recommande d'augmenter la fréquence de ramassage des ordures dans le centre-ville, particulièrement aux heures de pointe.",
                        status: "read"
                      },
                      {
                        date: "10 Jan 2024", 
                        content: "Excellente réactivité de l'équipe technique pour la réparation de l'éclairage Boulevard du 30 Juin.",
                        status: "read"
                      }
                    ].map((comment, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm text-muted-foreground">{comment.date}</span>
                          <Badge variant={comment.status === 'read' ? 'default' : 'outline'}>
                            {comment.status === 'read' ? 'Lu' : 'Non lu'}
                          </Badge>
                        </div>
                        <p className="text-foreground">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BourgmestreDashboard;