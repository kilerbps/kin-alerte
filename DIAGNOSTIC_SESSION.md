# 🔍 Diagnostic des Problèmes de Déconnexion Automatique

## 🚨 Problème Identifié
Déconnexion automatique après 5-8 minutes d'inactivité, même pendant la navigation active.

## ✅ Solutions Implémentées

### 1. Configuration Améliorée du Client Supabase
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,           // Persistance de session
    storageKey: 'kinshasa-alerte-auth', // Clé unique
    autoRefreshToken: true,         // Refresh automatique
    detectSessionInUrl: true,       // Détection dans l'URL
    flowType: 'pkce',              // Type de flux sécurisé
  }
})
```

### 2. Hook useAuth Amélioré
- **Refresh automatique** toutes les 30 minutes
- **Gestion robuste des erreurs** sans déconnexion automatique
- **Écoute des événements** de session
- **Timeout de 10 secondes** pour éviter les blocages

### 3. Moniteur de Session
- **Raccourci clavier** : `Ctrl+Shift+S` pour afficher/masquer
- **Surveillance en temps réel** de l'état de la session
- **Compteur de refreshs** et temps restant
- **Logs détaillés** des événements

## 🔧 Diagnostic Manuel

### Étape 1: Vérifier le Moniteur de Session
1. Connectez-vous à l'application
2. Appuyez sur `Ctrl+Shift+S` pour afficher le moniteur
3. Surveillez les informations :
   - **Statut** : Doit être "Active"
   - **Temps restant** : Doit être > 0
   - **Refreshs** : Doit augmenter automatiquement

### Étape 2: Vérifier la Console du Navigateur
1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet "Console"
3. Recherchez les logs commençant par :
   - `🔍 useAuth-simple:` - Logs d'authentification
   - `🔄 useAuth-simple: Refresh automatique` - Refreshs
   - `❌` - Erreurs éventuelles

### Étape 3: Vérifier le LocalStorage
1. Dans les outils de développement, onglet "Application"
2. Local Storage → Votre domaine
3. Recherchez la clé `kinshasa-alerte-auth`
4. Vérifiez que la session est présente et valide

## 🛠️ Solutions Possibles

### Problème 1: LocalStorage Désactivé
**Symptômes** : Session non persistée après rechargement
**Solution** :
```javascript
// Vérifier si localStorage est disponible
if (typeof window !== 'undefined' && window.localStorage) {
  console.log('✅ localStorage disponible');
} else {
  console.log('❌ localStorage non disponible');
}
```

### Problème 2: Cookies Bloqués
**Symptômes** : Déconnexion immédiate
**Solution** :
- Vérifier les paramètres de confidentialité du navigateur
- Autoriser les cookies pour le domaine
- Désactiver le mode navigation privée

### Problème 3: Paramètres de Sécurité Stricts
**Symptômes** : Déconnexion après inactivité
**Solution** :
- Vérifier les extensions de navigateur
- Désactiver temporairement les bloqueurs de publicités
- Vérifier les paramètres de sécurité du navigateur

### Problème 4: Problème de Réseau
**Symptômes** : Erreurs de connexion
**Solution** :
- Vérifier la connexion internet
- Vérifier que Supabase est accessible
- Vérifier les pare-feu

## 📊 Logs de Diagnostic

### Logs Normaux
```
🔍 useAuth-simple: Initialisation
🔍 useAuth-simple: Session initiale: true
✅ fetchUserProfile-simple: Profil récupéré avec succès
🔄 useAuth-simple: Refresh automatique du token
```

### Logs d'Erreur à Surveiller
```
❌ useAuth-simple: Erreur récupération session initiale
❌ fetchUserProfile-simple: Erreur récupération profil
❌ useAuth-simple: Erreur refresh automatique
```

## 🎯 Actions Recommandées

### Immédiat
1. **Testez le moniteur** : `Ctrl+Shift+S`
2. **Vérifiez les logs** dans la console
3. **Testez la persistance** : Rechargez la page

### Si le problème persiste
1. **Vérifiez le localStorage** dans les outils de développement
2. **Testez dans un autre navigateur**
3. **Désactivez les extensions** temporairement
4. **Vérifiez les paramètres** de sécurité

### Contact Support
Si le problème persiste, fournissez :
- **Logs de la console** (copier-coller)
- **Screenshot du moniteur** de session
- **Navigateur et version** utilisés
- **Extensions** installées

## 🔄 Test de Fonctionnement

### Test 1: Persistance de Session
1. Connectez-vous
2. Rechargez la page (F5)
3. Vérifiez que vous êtes toujours connecté

### Test 2: Refresh Automatique
1. Connectez-vous
2. Attendez 30 minutes
3. Vérifiez que la session est toujours active

### Test 3: Navigation Active
1. Connectez-vous
2. Naviguez activement sur le site
3. Vérifiez qu'aucune déconnexion ne se produit

## 📝 Notes Techniques

- **Durée de session** : 1 heure (3600 secondes)
- **Refresh automatique** : Toutes les 30 minutes
- **Storage** : localStorage avec clé `kinshasa-alerte-auth`
- **Fallback** : Gestion d'erreur sans déconnexion forcée

---

**💡 Conseil** : Le moniteur de session (`Ctrl+Shift+S`) est votre meilleur outil pour diagnostiquer les problèmes de session en temps réel ! 