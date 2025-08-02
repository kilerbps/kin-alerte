# 🔐 Guide de Test de Connexion - Kinshasa-Alerte

## ✅ **Comptes d'Authentification Créés**

Tous les comptes de test ont été créés avec succès dans Supabase :

### **👨‍💼 Administrateur**
- **Email :** `admin@kinshasa-alerte.rdc`
- **Mot de passe :** `admin123456`
- **Rôle :** `admin`
- **Accès :** Dashboard Admin complet

### **🏛️ Bourgmestre de Gombe**
- **Email :** `bourgmestre.gombe@kinshasa-alerte.rdc`
- **Mot de passe :** `bourg123456`
- **Rôle :** `bourgmestre`
- **Commune :** Gombe
- **Accès :** Dashboard Bourgmestre

### **👤 Citoyen Test**
- **Email :** `citoyen@kinshasa-alerte.rdc`
- **Mot de passe :** `citoyen123456`
- **Rôle :** `citizen`
- **Accès :** Formulaire de signalement

## 🚀 **Test de Connexion**

### **Étape 1 : Accéder à l'Application**
1. Assurez-vous que l'application est lancée :
   ```bash
   npm run dev
   ```
2. Ouvrez votre navigateur sur `http://localhost:8080`

### **Étape 2 : Test de l'Administrateur**
1. Cliquez sur **"Se connecter"** dans la navigation
2. Entrez les identifiants :
   - **Email :** `admin@kinshasa-alerte.rdc`
   - **Mot de passe :** `admin123456`
3. Cliquez sur **"Se connecter"**
4. **Résultat attendu :**
   - ✅ Connexion réussie
   - ✅ Nom affiché : "Administrateur Principal"
   - ✅ Lien "Dashboard Admin" visible
   - ✅ Accès à `/admin` possible

### **Étape 3 : Test du Bourgmestre**
1. Déconnectez-vous (cliquez sur votre nom puis "Se déconnecter")
2. Reconnectez-vous avec :
   - **Email :** `bourgmestre.gombe@kinshasa-alerte.rdc`
   - **Mot de passe :** `bourg123456`
3. **Résultat attendu :**
   - ✅ Connexion réussie
   - ✅ Nom affiché : "Bourgmestre de Gombe"
   - ✅ Lien "Dashboard Bourgmestre" visible
   - ✅ Accès à `/bourgmestre` possible

### **Étape 4 : Test du Citoyen**
1. Déconnectez-vous
2. Reconnectez-vous avec :
   - **Email :** `citoyen@kinshasa-alerte.rdc`
   - **Mot de passe :** `citoyen123456`
3. **Résultat attendu :**
   - ✅ Connexion réussie
   - ✅ Nom affiché : "Citoyen Test"
   - ✅ Accès au formulaire de signalement
   - ✅ Pas d'accès aux dashboards admin/bourgmestre

## 🎯 **URLs de Test Directes**

### **Page d'Authentification :**
```
http://localhost:8080/auth
```

### **Dashboard Admin :**
```
http://localhost:8080/admin
```
*Nécessite d'être connecté en tant qu'admin*

### **Dashboard Bourgmestre :**
```
http://localhost:8080/bourgmestre
```
*Nécessite d'être connecté en tant que bourgmestre*

### **Formulaire de Signalement :**
```
http://localhost:8080/signaler
```

## 🔍 **Vérifications à Effectuer**

### **✅ Connexion Réussie**
- [ ] Pas d'erreur lors de la connexion
- [ ] Nom de l'utilisateur affiché dans la navigation
- [ ] Bouton "Se déconnecter" visible
- [ ] Pas de message d'erreur

### **✅ Rôles Corrects**
- [ ] **Admin :** Accès à `/admin` sans restriction
- [ ] **Bourgmestre :** Accès à `/bourgmestre` sans restriction
- [ ] **Citoyen :** Pas d'accès aux dashboards admin/bourgmestre

### **✅ Navigation Fonctionnelle**
- [ ] Liens de navigation appropriés selon le rôle
- [ ] Redirection correcte après connexion
- [ ] Déconnexion fonctionnelle

## 🔧 **Dépannage**

### **Problème : "Email ou mot de passe incorrect"**
**Solutions :**
1. Vérifiez l'orthographe de l'email
2. Vérifiez le mot de passe (attention aux espaces)
3. Assurez-vous que l'application est bien lancée

### **Problème : "Erreur de connexion"**
**Solutions :**
1. Vérifiez la console du navigateur pour les erreurs
2. Vérifiez que Supabase est accessible
3. Relancez l'application

### **Problème : "Accès refusé" aux dashboards**
**Solutions :**
1. Vérifiez que vous êtes connecté avec le bon compte
2. Vérifiez que le rôle est correct dans Supabase
3. Rafraîchissez la page

### **Problème : "Page non trouvée"**
**Solutions :**
1. Vérifiez que l'URL est correcte
2. Vérifiez que les routes sont bien configurées
3. Relancez l'application

## 📊 **Test des Fonctionnalités**

### **Dashboard Admin (`/admin`)**
- [ ] Statistiques affichées
- [ ] Liste des signalements visible
- [ ] Actions sur les signalements (Approuver, Rejeter, Résolu)
- [ ] Filtres fonctionnels

### **Dashboard Bourgmestre (`/bourgmestre`)**
- [ ] Statistiques de la commune Gombe
- [ ] Signalements de la commune
- [ ] Actions sur les signalements

### **Formulaire de Signalement (`/signaler`)**
- [ ] Communes chargées depuis Supabase
- [ ] Types de problèmes chargés
- [ ] Soumission fonctionnelle
- [ ] Upload d'images (si configuré)

## 🎉 **Résultat Attendu**

Après avoir testé tous les comptes, vous devriez avoir :

- ✅ **3 comptes fonctionnels** avec des rôles différents
- ✅ **Authentification Supabase** opérationnelle
- ✅ **Gestion des rôles** correcte
- ✅ **Navigation conditionnelle** selon le rôle
- ✅ **Accès aux dashboards** appropriés

---

**🎯 Testez maintenant la connexion avec les comptes fournis et dites-moi si tout fonctionne !** 