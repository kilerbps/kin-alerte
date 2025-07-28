import { Card, CardContent } from "@/components/ui/card";
import { 
  Trash2, 
  Lightbulb, 
  Waves, 
  Construction,
  Droplets,
  Zap,
  ShieldAlert,
  Building2,
  TreePine,
  Users
} from "lucide-react";

const ProblemTypes = () => {
  const problemTypes = [
    {
      icon: Trash2,
      title: "Gestion des ordures",
      description: "Ramassage, décharges sauvages, propreté",
      color: "bg-red-500/10 text-red-600",
      count: "2,547"
    },
    {
      icon: Lightbulb,
      title: "Éclairage public",
      description: "Lampadaires défaillants, zones sombres",
      color: "bg-yellow-500/10 text-yellow-600",
      count: "1,832"
    },
    {
      icon: Construction,
      title: "Voirie",
      description: "Nids-de-poule, routes dégradées",
      color: "bg-orange-500/10 text-orange-600",
      count: "1,654"
    },
    {
      icon: Waves,
      title: "Inondations",
      description: "Évacuation des eaux, drainage",
      color: "bg-blue-500/10 text-blue-600",
      count: "1,234"
    },
    {
      icon: Droplets,
      title: "Approvisionnement en eau",
      description: "Coupures, qualité de l'eau",
      color: "bg-cyan-500/10 text-cyan-600",
      count: "987"
    },
    {
      icon: Zap,
      title: "Électricité",
      description: "Pannes, délestages, lignes défaillantes",
      color: "bg-purple-500/10 text-purple-600",
      count: "876"
    },
    {
      icon: ShieldAlert,
      title: "Sécurité",
      description: "Vols, tracasseries, insécurité",
      color: "bg-red-500/10 text-red-600",
      count: "654"
    },
    {
      icon: Building2,
      title: "Infrastructures",
      description: "Bâtiments publics, marchés",
      color: "bg-gray-500/10 text-gray-600",
      count: "543"
    },
    {
      icon: TreePine,
      title: "Espaces verts",
      description: "Parcs, jardins, environnement",
      color: "bg-green-500/10 text-green-600",
      count: "432"
    },
    {
      icon: Users,
      title: "Services publics",
      description: "Administration, services citoyens",
      color: "bg-indigo-500/10 text-indigo-600",
      count: "321"
    }
  ];

  return (
    <section id="problemes" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Types de problèmes signalés
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez les catégories de problèmes les plus fréquemment rapportés 
            par les citoyens de Kinshasa
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {problemTypes.map((type, index) => (
            <Card 
              key={index}
              className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 border-border/50"
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${type.color} group-hover:scale-110 transition-transform duration-300`}>
                  <type.icon className="h-8 w-8" />
                </div>
                
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {type.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {type.description}
                </p>
                
                <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {type.count} signalements
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6">
            Votre problème ne figure pas dans la liste ? 
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Card className="p-4 bg-gradient-card border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-0 text-center">
                <div className="text-2xl mb-2">➕</div>
                <p className="font-medium text-primary">Autre problème</p>
                <p className="text-sm text-muted-foreground">Signalez tout autre problème</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemTypes;