import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import heroKinshasa from "@/assets/hero-kinshasa.jpg";

const Hero = () => {
  const stats = [
    { icon: Users, value: "10,000+", label: "Citoyens actifs" },
    { icon: MapPin, value: "24", label: "Communes" },
    { icon: TrendingUp, value: "85%", label: "Problèmes résolus" },
  ];

  return (
    <section id="accueil" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroKinshasa} 
          alt="Kinshasa Digital" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-accent/80"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Votre voix compte pour 
                <span className="text-accent block">
                  Kinshasa
                </span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-2xl">
                Signalez rapidement les problèmes urbains de votre quartier. 
                Ensemble, construisons une Kinshasa moderne et fonctionnelle.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signaler">
                <Button 
                  variant="hero" 
                  size="lg"
                  className="group"
                >
                  Signaler un problème
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/apropos">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                >
                  Découvrir la plateforme
                </Button>
              </Link>
            </div>

            {/* Problem Types */}
            <div className="pt-8">
              <p className="text-white/80 text-sm mb-4">Problèmes les plus signalés :</p>
              <div className="flex flex-wrap gap-2">
                {["Ordures", "Éclairage", "Nids-de-poule", "Inondations", "Panne d'eau"].map((problem) => (
                  <span 
                    key={problem}
                    className="px-3 py-1 bg-white/20 text-white text-sm rounded-full border border-white/30"
                  >
                    {problem}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="lg:justify-self-end">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-glow">
              <h3 className="text-2xl font-bold text-white mb-6">
                Impact en temps réel
              </h3>
              <div className="space-y-6">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                        <stat.icon className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-white/80 text-sm">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-white/80 text-sm text-center">
                  📍 Disponible dans toutes les communes de Kinshasa
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;