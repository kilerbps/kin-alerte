import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, AlertTriangle, Users, BarChart3, LogOut, User, Shield, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import logoKinshasaAlerte from "@/assets/logo-kinshasa-alerte.jpg";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, isBourgmestre, isCitizen, signOut } = useAuth();
  const { toast } = useToast();

  const navItems = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "Signaler", href: "/signaler", icon: AlertTriangle },
    { name: "À propos", href: "/apropos", icon: Users },
    { name: "Statistiques", href: "/stats", icon: BarChart3 },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion",
        variant: "destructive"
      });
    }
  };

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
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/signaler">
              <Button variant="outline" size="sm">
                Signaler un problème
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Badge de rôle */}
                <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full">
                  {isAdmin ? (
                    <Shield className="h-4 w-4 text-primary" />
                  ) : isBourgmestre ? (
                    <User className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-medium text-primary">
                    {isAdmin ? 'Admin' : isBourgmestre ? 'Bourgmestre' : 'Citoyen'}
                  </span>
                </div>
                
                {/* Menu utilisateur */}
                <div className="relative group">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user?.full_name || 'Utilisateur'}</span>
                  </Button>
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      {isAdmin && (
                        <Link to="/admin">
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            Dashboard Admin
                          </Button>
                        </Link>
                      )}
                      {isBourgmestre && (
                        <Link to="/bourgmestre">
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            Dashboard Bourgmestre
                          </Button>
                        </Link>
                      )}
                      {isCitizen && (
                        <Link to="/citizen">
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            Mon Tableau de Bord
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Se déconnecter
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="cta" size="sm">
                  Se connecter
                </Button>
              </Link>
            )}
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
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-3 text-base font-medium text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="pt-4 space-y-3 border-t border-border">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-primary/10 rounded-lg">
                    {isAdmin ? (
                      <Shield className="h-4 w-4 text-primary" />
                    ) : isBourgmestre ? (
                      <User className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-sm font-medium text-primary">
                      {isAdmin ? 'Admin' : isBourgmestre ? 'Bourgmestre' : 'Citoyen'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user?.full_name || 'Utilisateur'}
                  </div>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="outline" className="w-full">
                        Dashboard Admin
                      </Button>
                    </Link>
                  )}
                  {isBourgmestre && (
                    <Link to="/bourgmestre">
                      <Button variant="outline" className="w-full">
                        Dashboard Bourgmestre
                      </Button>
                    </Link>
                  )}
                  {isCitizen && (
                    <Link to="/citizen">
                      <Button variant="outline" className="w-full">
                        Mon Tableau de Bord
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="cta" className="w-full">
                    Se connecter
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;