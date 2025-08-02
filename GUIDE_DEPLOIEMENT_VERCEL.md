# 🚀 Guide de Déploiement Vercel - Kinshasa-Alerte

## ✅ Problème résolu

L'erreur `Function Runtimes must have a valid version` a été corrigée en :
- ✅ Supprimant la section `functions` du `vercel.json`
- ✅ Ajoutant un fichier `.vercelignore` pour optimiser le déploiement
- ✅ Poussant les corrections sur GitHub

## 🎯 Déploiement sur Vercel

### Option 1: Via l'interface web (Recommandé)

1. **Aller sur Vercel.com**
   - Connectez-vous ou créez un compte
   - Cliquez sur "New Project"

2. **Importer votre repository**
   - Sélectionnez votre repo GitHub : `kilerbps/kin-alerte`
   - Vercel détectera automatiquement que c'est un projet Vite

3. **Configuration automatique**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Variables d'environnement**
   - Cliquez sur "Environment Variables"
   - Ajoutez :
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     VITE_AUTH_REDIRECT_URL=https://your-domain.vercel.app
     VITE_RESET_PASSWORD_URL=https://your-domain.vercel.app/auth?reset=true
     ```

5. **Déployer**
   - Cliquez sur "Deploy"
   - Attendez 2-3 minutes

### Option 2: Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod

# Configurer les variables d'environnement
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_AUTH_REDIRECT_URL
vercel env add VITE_RESET_PASSWORD_URL
```

## 🔧 Configuration Supabase

### 1. URLs autorisées
Dans votre dashboard Supabase :
1. **Authentication > URL Configuration**
2. Ajoutez vos URLs Vercel :
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: `https://your-domain.vercel.app/auth`

### 2. Templates d'email
1. **Authentication > Email Templates**
2. Configurez les templates :
   - Confirmation d'email
   - Réinitialisation de mot de passe

## 📊 Monitoring du déploiement

### Logs de build
- Allez dans votre projet Vercel
- Onglet "Deployments"
- Cliquez sur le dernier déploiement
- Onglet "Build Logs"

### Variables d'environnement
- Onglet "Settings > Environment Variables"
- Vérifiez que toutes les variables sont présentes

## 🧪 Tests après déploiement

### 1. Tests fonctionnels
- [ ] Page d'accueil accessible
- [ ] Connexion utilisateur
- [ ] Création de compte
- [ ] Mot de passe oublié
- [ ] Création de signalement
- [ ] Upload d'images
- [ ] Dashboard admin/bourgmestre

### 2. Tests de performance
- [ ] Temps de chargement < 3s
- [ ] Images optimisées
- [ ] Responsive design

### 3. Tests de sécurité
- [ ] HTTPS fonctionnel
- [ ] Headers de sécurité
- [ ] Pas d'erreurs console

## 🔒 Sécurité

### Headers configurés
- ✅ `X-Frame-Options: SAMEORIGIN`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Referrer-Policy: no-referrer-when-downgrade`
- ✅ `Cache-Control` pour les assets

### Variables d'environnement
- ✅ Sécurisées dans Vercel
- ✅ Pas exposées dans le code client
- ✅ Rotation possible

## 📱 Optimisations

### Performance
- ✅ Code splitting automatique
- ✅ Compression gzip
- ✅ CDN global
- ✅ Cache optimisé

### Mobile
- ✅ Responsive design
- ✅ PWA ready (optionnel)
- ✅ Touch-friendly

## 🚨 Résolution des problèmes

### Erreur de build
```bash
# Vérifier les logs
vercel logs

# Rebuild local
npm run build

# Vérifier les dépendances
npm install
```

### Variables d'environnement manquantes
```bash
# Ajouter une variable
vercel env add VITE_SUPABASE_URL

# Lister les variables
vercel env ls

# Redéployer
vercel --prod
```

### Problème d'authentification
1. Vérifier les URLs dans Supabase
2. Vérifier les variables d'environnement
3. Tester la connexion Supabase

## 📈 Analytics et monitoring

### Vercel Analytics (optionnel)
```bash
# Installer
npm install @vercel/analytics

# Utiliser dans App.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### Performance monitoring
- Google PageSpeed Insights
- Lighthouse
- WebPageTest

## 🔄 Mises à jour

### Déploiement automatique
- ✅ Chaque push sur `main` déclenche un déploiement
- ✅ Prévisualisation des pull requests
- ✅ Rollback facile

### Déploiement manuel
```bash
# Redéployer
vercel --prod

# Déployer une branche spécifique
vercel --prod --branch feature-branch
```

## 📞 Support

### Vercel Support
- Documentation : https://vercel.com/docs
- Discord : https://vercel.com/discord
- Email : support@vercel.com

### Commandes utiles
```bash
# Status du projet
vercel ls

# Logs en temps réel
vercel logs --follow

# Informations du projet
vercel inspect

# Redéployer
vercel --prod
```

---

🎉 **Votre application Kinshasa-Alerte est maintenant déployée sur Vercel !**

**URL de votre application :** `https://your-domain.vercel.app` 