import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  MapPin,
  Filter,
  Download,
  Search,
  Eye,
  MessageSquare,
  Calendar,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Mock data - TODO: Replace with Supabase data
  const stats = {
    total: 1247,
    pending: 156,
    inProgress: 89,
    resolved: 1002
  };

  const recentReports = [
    {
      id: "RPT-001",
      type: "Ordures",
      description: "Accumulation d'ordures Avenue Kasa-Vubu",
      location: "Gombe, Avenue Kasa-Vubu",
      status: "pending",
      priority: "high",
      date: "2024-01-15",
      images: 3,
      reporter: "Citoyen anonyme"
    },
    {
      id: "RPT-002", 
      type: "Éclairage",
      description: "Lampadaires éteints Boulevard du 30 Juin",
      location: "Kinshasa, Boulevard du 30 Juin",
      status: "in-progress",
      priority: "medium",
      date: "2024-01-14",
      images: 2,
      reporter: "Jean Mukendi"
    },
    {
      id: "RPT-003",
      type: "Voirie",
      description: "Nids-de-poule dangereux Route de Matadi",
      location: "Ngaliema, Route de Matadi",
      status: "resolved",
      priority: "high", 
      date: "2024-01-13",
      images: 4,
      reporter: "Marie Kabila"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-status-pending text-white";
      case "in-progress": return "bg-status-progress text-white";
      case "resolved": return "bg-status-resolved text-white";
      default: return "bg-muted";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "in-progress": return "En cours";
      case "resolved": return "Résolu";
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
              <p className="text-muted-foreground">Gestion des signalements citoyens</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Link to="/">
                <Button variant="ghost">Retour site</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
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
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-status-progress/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-status-progress" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">En cours</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
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
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">Signalements</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="comments">Commentaires</TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Signalements récents</CardTitle>
                  <div className="flex items-center space-x-4">
                    {/* Filters */}
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="in-progress">En cours</SelectItem>
                          <SelectItem value="resolved">Résolus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        className="pl-9 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant="outline">{report.id}</Badge>
                            <Badge className={getStatusColor(report.status)}>
                              {getStatusText(report.status)}
                            </Badge>
                            <span className={`text-sm font-medium ${getPriorityColor(report.priority)}`}>
                              {report.priority === 'high' ? 'Priorité élevée' : 
                               report.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-foreground mb-1">
                            {report.type}: {report.description}
                          </h3>
                          
                          <div className="flex items-center text-sm text-muted-foreground space-x-4">
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {report.location}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {report.date}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {report.reporter}
                            </span>
                            {report.images > 0 && (
                              <span>{report.images} photo(s)</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                          {report.status === 'pending' && (
                            <>
                              <Button variant="default" size="sm">
                                Approuver
                              </Button>
                              <Button variant="destructive" size="sm">
                                Rejeter
                              </Button>
                            </>
                          )}
                          {report.status === 'in-progress' && (
                            <Button variant="default" size="sm">
                              Marquer résolu
                            </Button>
                          )}
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
                    Signalements par type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: "Ordures", count: 347, percentage: 28 },
                      { type: "Éclairage", count: 234, percentage: 19 },
                      { type: "Voirie", count: 198, percentage: 16 },
                      { type: "Inondations", count: 156, percentage: 12 },
                      { type: "Autres", count: 312, percentage: 25 }
                    ].map((item) => (
                      <div key={item.type} className="flex items-center">
                        <div className="w-20 text-sm font-medium">{item.type}</div>
                        <div className="flex-1 mx-4">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground w-16">
                          {item.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Communes les plus actives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { commune: "Gombe", count: 156 },
                      { commune: "Kinshasa", count: 134 },
                      { commune: "Ngaliema", count: 98 },
                      { commune: "Kasa-Vubu", count: 87 },
                      { commune: "Lemba", count: 76 }
                    ].map((item, index) => (
                      <div key={item.commune} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center mr-3">
                            {index + 1}
                          </span>
                          <span className="font-medium">{item.commune}</span>
                        </div>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Section utilisateurs à développer...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Commentaires bourgmestre
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Commentaires et avis des bourgmestres...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;