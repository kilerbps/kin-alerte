import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Users, 
  MapPin, 
  TrendingUp, 
  Shield, 
  Globe, 
  Smartphone,
  BarChart3,
  MessageSquare,
  CheckCircle,
  Clock,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";

const APropos = () => {
  const features = [
    {
      icon: AlertTriangle,
      title: "Signalement Rapide",
      description: "Signalez les problèmes urbains en quelques clics avec photos et géolocalisation"
    },
    {
      icon: Users,
      title: "Participation Citoyenne",
      description: "Impliquez-vous activement dans l'amélioration de votre quartier"
    },
    {
      icon: MapPin,
      title: "Géolocalisation Précise",
      description: "Localisez précisément les problèmes pour une intervention efficace"
    },
    {
      icon: TrendingUp,
      title: "Suivi en Temps Réel",
      description: "Suivez l'évolution de vos signalements jusqu'à leur résolution"
    },
    {
      icon: Shield,
      title: "Sécurité des Données",
      description: "Vos données sont protégées et votre anonymat respecté"
    },
    {
      icon: Globe,
      title: "Couverture Complète",
      description: "24 communes de Kinshasa couvertes par la plateforme"
    }
  ];

  const stats = [
    { icon: Users, value: "10,000+", label: "Citoyens actifs" },
    { icon: MapPin, value: "24", label: "Communes couvertes" },
    { icon: AlertTriangle, value: "5,000+", label: "Signalements traités" },
    { icon: CheckCircle, value: "85%", label: "Taux de résolution" }
  ];

  const team = [
    {
      name: "Équipe Technique",
      role: "Développement & Maintenance",
      description: "Experts en développement web et mobile"
    },
    {
      name: "Équipe Administrative",
      role: "Gestion & Coordination",
      description: "Coordination avec les autorités locales"
    },
    {
      name: "Bourgmestres",
      role: "Gestion Locale",
      description: "Responsables de la résolution dans chaque commune"
    }
  ];

  const problemTypes = [
    { name: "Ordures ménagères", priority: "Haute", icon: "🗑️" },
    { name: "Éclairage public", priority: "Moyenne", icon: "💡" },
    { name: "Voirie dégradée", priority: "Haute", icon: "🛣️" },
    { name: "Inondations", priority: "Haute", icon: "🌊" },
    { name: "Approvisionnement en eau", priority: "Haute", icon: "💧" },
    { name: "Pannes électriques", priority: "Moyenne", icon: "⚡" },
    { name: "Insécurité", priority: "Haute", icon: "🛡️" },
    { name: "Infrastructures publiques", priority: "Moyenne", icon: "🏛️" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="text-primary border-primary">
              À propos de Kinshasa-Alerte
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
              Une plateforme citoyenne pour 
              <span className="text-primary block">une Kinshasa meilleure</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              
              Kinshasa Alerte est une plateforme numérique innovante conçue pour permettre aux citoyens de la République Démocratique du Congo,
              en particulier ceux de la ville de Kinshasa, de signaler facilement et rapidement des situations critiques ou suspectes dans leur environnement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signaler">
                <Button size="lg" className="group">
                  Commencer à signaler
                  <AlertTriangle className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg">
                  Rejoindre la communauté
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Pourquoi choisir Kinshasa-Alerte ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une plateforme moderne et efficace pour améliorer votre quartier
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Types Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Types de problèmes traités
            </h2>
            <p className="text-xl text-muted-foreground">
              Nous couvrons tous les aspects de la vie urbaine
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problemTypes.map((problem, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{problem.icon}</div>
                  <h3 className="font-semibold mb-2">{problem.name}</h3>
                  <Badge 
                    variant={problem.priority === "Haute" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    Priorité {problem.priority}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Notre équipe
            </h2>
            <p className="text-xl text-muted-foreground">
              Une collaboration entre citoyens, techniciens et autorités
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-primary font-medium mb-4">{member.role}</p>
                  <p className="text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à améliorer votre quartier ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de citoyens qui agissent déjà pour une Kinshasa meilleure
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

export default APropos; 