# 🚀 Guide de Déploiement en Production

## ✅ Prérequis

### 1. Configuration Supabase
- ✅ Base de données configurée
- ✅ Authentification activée
- ✅ Storage configuré
- ✅ RLS policies en place
- ✅ Templates d'email configurés

### 2. Variables d'environnement
- ✅ URL Supabase
- ✅ Clé API Supabase
- ✅ Configuration de production

## 🔧 Configuration pour la Production

### 1. Variables d'environnement de production

Créez un fichier `.env.production` :

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Application Configuration
VITE_APP_NAME=Kinshasa-Alerte
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# URLs de redirection pour l'authentification
VITE_AUTH_REDIRECT_URL=https://your-domain.com
VITE_RESET_PASSWORD_URL=https://your-domain.com/auth?reset=true
```

### 2. Configuration Vite pour la production

Modifiez `vite.config.ts` :

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Désactiver en production
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-tabs', '@radix-ui/react-select'],
        },
      },
    },
  },
  server: {
    port: 8080,
    host: true,
  },
})
```

### 3. Configuration Supabase pour la production

#### A. URLs autorisées
Dans votre dashboard Supabase :
1. Allez dans **Authentication > URL Configuration**
2. Ajoutez vos URLs de production :
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth`

#### B. Templates d'email
Configurez les templates d'email dans **Authentication > Email Templates** :
- Confirmation d'email
- Réinitialisation de mot de passe
- Invitation d'utilisateur

## 🌐 Options de Déploiement

### Option 1: Vercel (Recommandé)

#### A. Préparation
```bash
# Installer Vercel CLI
npm i -g vercel

# Build de l'application
npm run build
```

#### B. Déploiement
```bash
# Déployer
vercel --prod

# Ou via l'interface web
# 1. Connectez-vous à vercel.com
# 2. Importez votre repository GitHub
# 3. Configurez les variables d'environnement
```

#### C. Configuration Vercel
Créez `vercel.json` :
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

#### A. Préparation
```bash
# Build de l'application
npm run build
```

#### B. Déploiement
1. Connectez-vous à netlify.com
2. Glissez-déposez le dossier `dist`
3. Configurez les variables d'environnement

#### C. Configuration Netlify
Créez `netlify.toml` :
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Option 3: Serveur VPS/Dedicated

#### A. Préparation du serveur
```bash
# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer Nginx
sudo apt update
sudo apt install nginx

# Installer PM2
sudo npm install -g pm2
```

#### B. Déploiement
```bash
# Cloner le repository
git clone https://github.com/your-repo/kin-alerte.git
cd kin-alerte

# Installer les dépendances
npm install

# Build de l'application
npm run build

# Démarrer avec PM2
pm2 start npm --name "kin-alerte" -- start
pm2 save
pm2 startup
```

#### C. Configuration Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /var/www/kin-alerte/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache pour les assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

## 🔒 Sécurité en Production

### 1. Variables d'environnement
- ✅ Ne jamais commiter les clés API
- ✅ Utiliser des variables d'environnement sécurisées
- ✅ Rotation régulière des clés

### 2. HTTPS
- ✅ Certificat SSL obligatoire
- ✅ Redirection HTTP vers HTTPS
- ✅ HSTS headers

### 3. Headers de sécurité
```nginx
# Nginx security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### 4. Supabase Security
- ✅ RLS policies strictes
- ✅ API rate limiting
- ✅ Audit logs activés

## 📊 Monitoring et Maintenance

### 1. Monitoring
```bash
# PM2 monitoring
pm2 monit

# Logs
pm2 logs kin-alerte

# Status
pm2 status
```

### 2. Sauvegarde
```bash
# Sauvegarde de la base de données
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Sauvegarde des fichiers
tar -czf kin-alerte-backup-$(date +%Y%m%d).tar.gz dist/
```

### 3. Mise à jour
```bash
# Pull des dernières modifications
git pull origin main

# Installer les nouvelles dépendances
npm install

# Build
npm run build

# Redémarrer l'application
pm2 restart kin-alerte
```

## 🧪 Tests de Production

### 1. Tests fonctionnels
- ✅ Connexion utilisateur
- ✅ Création de compte
- ✅ Mot de passe oublié
- ✅ Création de signalement
- ✅ Upload d'images
- ✅ Dashboard admin/bourgmestre

### 2. Tests de performance
```bash
# Test de charge avec Apache Bench
ab -n 1000 -c 10 https://your-domain.com/

# Test de vitesse de chargement
lighthouse https://your-domain.com/
```

### 3. Tests de sécurité
- ✅ Scan de vulnérabilités
- ✅ Test d'injection SQL
- ✅ Test XSS
- ✅ Test CSRF

## 📱 Configuration Mobile

### 1. PWA (Progressive Web App)
Ajoutez `vite-plugin-pwa` :

```bash
npm install vite-plugin-pwa
```

Configuration dans `vite.config.ts` :
```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Kinshasa-Alerte',
        short_name: 'Kinshasa-Alerte',
        description: 'Plateforme citoyenne de signalement',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

### 2. Responsive Design
- ✅ Test sur différents appareils
- ✅ Optimisation mobile
- ✅ Touch-friendly interface

## 🚨 Gestion des Erreurs

### 1. Error Boundaries
```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Une erreur s'est produite.</h1>;
    }

    return this.props.children;
  }
}
```

### 2. Logging
```typescript
// src/lib/logger.ts
export const logger = {
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // Envoyer à un service de logging (Sentry, LogRocket, etc.)
  },
  info: (message: string) => {
    console.log(`[INFO] ${message}`);
  }
};
```

## 📈 Optimisations

### 1. Performance
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Image optimization
- ✅ Bundle analysis

### 2. SEO
```html
<!-- index.html -->
<meta name="description" content="Plateforme citoyenne de signalement à Kinshasa">
<meta name="keywords" content="signalement, kinshasa, citoyen, administration">
<meta property="og:title" content="Kinshasa-Alerte">
<meta property="og:description" content="Signalez les problèmes de votre quartier">
```

## 🎯 Checklist de Déploiement

### Avant le déploiement
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Build de production réussi
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Supabase configuré

### Après le déploiement
- [ ] Application accessible
- [ ] Authentification fonctionne
- [ ] Upload d'images fonctionne
- [ ] Emails envoyés
- [ ] Performance acceptable
- [ ] Monitoring configuré

## 🆘 Support et Maintenance

### 1. Documentation
- ✅ Guide utilisateur
- ✅ Guide administrateur
- ✅ API documentation
- ✅ Troubleshooting

### 2. Support
- ✅ Email de support
- ✅ Chat en ligne
- ✅ Base de connaissances
- ✅ FAQ

### 3. Maintenance
- ✅ Mises à jour régulières
- ✅ Sauvegardes automatiques
- ✅ Monitoring 24/7
- ✅ Plan de reprise d'activité

---

🎉 **Votre application Kinshasa-Alerte est maintenant prête pour la production !** 