import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, AlertTriangle, Users, BarChart3 } from "lucide-react";
import logoKinshasaAlerte from "@/assets/logo-kinshasa-alerte.jpg";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Accueil", href: "#accueil", icon: AlertTriangle },
    { name: "Signaler", href: "#signaler", icon: AlertTriangle },
    { name: "À propos", href: "#apropos", icon: Users },
    { name: "Statistiques", href: "#stats", icon: BarChart3 },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src={logoKinshasaAlerte} 
              alt="Kinshasa Alerte" 
              className="h-8 w-8 rounded-md"
            />
            <div>
              <h1 className="text-xl font-bold text-primary">Kinshasa-Alerte</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Signalement citoyen - RDC
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </a>
            ))}
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Connexion Admin
            </Button>
            <Button variant="cta" size="sm">
              Signaler un problème
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-border">
          <div className="px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 text-base font-medium text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </a>
            ))}
            <div className="pt-4 space-y-3 border-t border-border">
              <Button variant="outline" className="w-full">
                Connexion Admin
              </Button>
              <Button variant="cta" className="w-full">
                Signaler un problème
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;