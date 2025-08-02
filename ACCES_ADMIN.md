# 🔐 Guide d'Accès à la Page Admin - Kinshasa-Alerte

## ✅ **Utilisateurs de Test Créés**

Les utilisateurs de test suivants ont été créés dans la base de données :

### **👨‍💼 Administrateur Principal**
- **Email :** `admin@kinshasa-alerte.rdc`
- **Rôle :** `admin`
- **Accès :** Dashboard Admin complet

### **🏛️ Bourgmestre de Gombe**
- **Email :** `bourgmestre.gombe@kinshasa-alerte.rdc`
- **Rôle :** `bourgmestre`
- **Commune :** Gombe
- **Accès :** Dashboard Bourgmestre

## 🚀 **Comment Accéder à la Page Admin**

### **Étape 1 : Lancer l'Application**
```bash
npm run dev
```

### **Étape 2 : Aller sur la Page d'Authentification**
1. Ouvrez votre navigateur
2. Allez sur `http://localhost:8080`
3. Cliquez sur **"Se connecter"** dans la navigation

### **Étape 3 : Se Connecter avec le Compte Admin**
1. Dans le formulaire de connexion, entrez :
   - **Email :** `admin@kinshasa-alerte.rdc`
   - **Mot de passe :** (laissez vide pour les comptes de test)
2. Cliquez sur **"Se connecter"**

### **Étape 4 : Accéder au Dashboard Admin**
Après connexion, vous verrez :
- Votre nom dans la navigation : "Administrateur Principal"
- Un lien **"Dashboard Admin"** dans le menu
- Cliquez sur ce lien pour accéder à `/admin`

## 🎯 **URLs Directes**

### **Page Admin :**
```
http://localhost:8080/admin
```

### **Page Bourgmestre :**
```
http://localhost:8080/bourgmestre
```

### **Page d'Authentification :**
```
http://localhost:8080/auth
```

## 🔧 **Si la Connexion ne Fonctionne Pas**

### **Problème : "Utilisateur non trouvé"**
**Solution :** Les comptes de test utilisent l'authentification Supabase. Créez un compte normal :

1. Allez sur `/auth`
2. Cliquez sur **"S'inscrire"**
3. Créez un compte avec votre email
4. Connectez-vous
5. Le rôle sera automatiquement `citizen`

### **Problème : "Accès refusé"**
**Solution :** Vérifiez que l'utilisateur a le bon rôle dans Supabase :

1. Allez dans votre dashboard Supabase
2. Ouvrez **Table Editor**
3. Sélectionnez la table `users`
4. Vérifiez que l'utilisateur a `role = 'admin'`

### **Problème : "Page non trouvée"**
**Solution :** Vérifiez que les routes sont bien configurées dans `App.tsx`

## 🛠️ **Créer un Nouvel Admin Manuellement**

Si vous voulez créer un nouvel admin :

### **Option 1 : Via Supabase Dashboard**
1. Allez dans **Table Editor** > `users`
2. Ajoutez une nouvelle ligne :
   ```json
   {
     "email": "votre-email@example.com",
     "full_name": "Votre Nom",
     "role": "admin"
   }
   ```

### **Option 2 : Via l'Application**
1. Créez un compte normal via `/auth`
2. Allez dans Supabase Dashboard
3. Modifiez le rôle de `citizen` à `admin`

## 📊 **Fonctionnalités du Dashboard Admin**

Une fois connecté en tant qu'admin, vous aurez accès à :

### **📈 Statistiques Globales**
- Total des signalements
- Signalements par statut
- Signalements par commune
- Signalements par type de problème

### **📝 Gestion des Signalements**
- Voir tous les signalements
- Modifier le statut (En attente → En cours → Résolu)
- Rejeter des signalements
- Voir les détails complets

### **👥 Gestion des Utilisateurs**
- Voir tous les utilisateurs
- Modifier les rôles
- Gérer les profils

### **🏘️ Gestion des Communes**
- Voir toutes les communes
- Modifier les informations
- Assigner les bourgmestres

## 🔍 **Test des Comptes**

### **Test Admin :**
1. Connectez-vous avec `admin@kinshasa-alerte.rdc`
2. Allez sur `/admin`
3. Vérifiez les statistiques et signalements

### **Test Bourgmestre :**
1. Connectez-vous avec `bourgmestre.gombe@kinshasa-alerte.rdc`
2. Allez sur `/bourgmestre`
3. Vérifiez les données de la commune Gombe

### **Test Citoyen :**
1. Créez un nouveau compte via `/auth`
2. Allez sur `/signaler`
3. Créez un signalement

## 🎉 **Résultat Attendu**

Après connexion en tant qu'admin, vous devriez voir :

- ✅ **Navigation** avec votre nom et rôle
- ✅ **Lien Dashboard Admin** dans le menu
- ✅ **Accès à `/admin`** sans restriction
- ✅ **Statistiques** en temps réel
- ✅ **Gestion complète** des signalements

---

**🎯 Vous devriez maintenant pouvoir accéder au dashboard admin avec le compte `admin@kinshasa-alerte.rdc` !** 