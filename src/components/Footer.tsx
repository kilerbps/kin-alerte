import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from "lucide-react";
import logoKinshasaAlerte from "@/assets/logo-kinshasa-alerte.jpg";

const Footer = () => {
  const quickLinks = [
    { name: "Signaler un problème", href: "#signaler" },
    { name: "Suivre un signalement", href: "#suivi" },
    { name: "Statistiques", href: "#stats" },
    { name: "À propos", href: "#apropos" },
  ];

  const contacts = [
    { icon: MapPin, text: "Kinshasa, République Démocratique du Congo" },
    { icon: Phone, text: "+243 971 289 828" },
    { icon: Mail, text: "contact@kinshasa-alerte.cd" },
  ];

  const communes = [
    "Bandalungwa", "Barumbu", "Bumbu", "Gombe",
    "Kalamu", "Kasa-Vubu", "Kimbanseke", "Kinshasa",
    "Kintambo", "Kisenso", "Lemba", "Limete",
    "Lingwala", "Makala", "Maluku", "Masina",
    "Matete", "Mont-Ngafula", "Ndjili", "Ngaba",
    "Ngaliema", "Ngiri-Ngiri", "N'sele", "Selembao"
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src={logoKinshasaAlerte} 
                alt="Kinshasa Alerte" 
                className="h-10 w-10 rounded-md bg-white p-1"
              />
              <div>
                <h3 className="text-xl font-bold">Kinshasa-Alerte</h3>
                <p className="text-sm text-primary-foreground/80">
                  Signalement citoyen
                </p>
              </div>
            </div>
            <p className="text-primary-foreground/90 leading-relaxed mb-6">
              Plateforme citoyenne pour améliorer la qualité de vie à Kinshasa. 
              Signalez, suivez et contribuez au développement de votre ville.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram].map((Social, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Social className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Liens rapides</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Communes */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Communes couvertes</h4>
            <div className="grid grid-cols-2 gap-1 text-sm">
              {communes.slice(0, 12).map((commune, index) => (
                <div key={index} className="text-primary-foreground/80">
                  {commune}
                </div>
              ))}
            </div>
            <p className="text-primary-foreground/60 text-xs mt-3">
              Et 12 autres communes...
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact</h4>
            <ul className="space-y-4">
              {contacts.map((contact, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <contact.icon className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-primary-foreground/80 text-sm">
                    {contact.text}
                  </span>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <h5 className="font-medium mb-2">Urgences</h5>
              <p className="text-sm text-primary-foreground/80">
                Pour les urgences, contactez directement les autorités locales 
                ou les services d'urgence.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/80 text-sm">
              © 2025 Kinshasa-Alerte. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                Politique de confidentialité
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                Conditions d'utilisation
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;