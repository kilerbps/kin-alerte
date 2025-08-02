# 🚀 Guide de Configuration Supabase - Kinshasa-Alerte

## 📋 Étapes de Configuration Complète

### **Étape 1 : Créer la Base de Données**

1. **Allez dans votre dashboard Supabase :**
   - Ouvrez [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sélectionnez votre projet : `skordnyitgvrtiouwdaz`

2. **Ouvrez l'éditeur SQL :**
   - Cliquez sur **SQL Editor** dans le menu de gauche
   - Cliquez sur **New query**

3. **Exécutez le script SQL :**
   - Copiez tout le contenu du fichier `database-schema.sql`
   - Collez-le dans l'éditeur SQL
   - Cliquez sur **Run** pour exécuter

**Résultat attendu :**
```
✅ 7 tables créées
✅ Indexes créés
✅ Triggers créés
✅ Politiques RLS configurées
✅ Fonctions créées
```

### **Étape 2 : Configurer le Storage**

1. **Créez le bucket pour les images :**
   - Allez dans **Storage** dans le menu de gauche
   - Cliquez sur **New bucket**
   - Nom : `report-images`
   - Public bucket : ✅ Activé
   - Cliquez sur **Create bucket**

2. **Configurez les politiques de sécurité :**
   - Dans le bucket `report-images`, allez dans **Policies**
   - Ajoutez les politiques suivantes :

```sql
-- Politique pour permettre l'upload d'images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'report-images' AND auth.role() = 'authenticated');

-- Politique pour permettre la lecture publique
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT USING (bucket_id = 'report-images');
```

### **Étape 3 : Configurer l'Authentification**

1. **Allez dans Authentication > Settings :**
   - Activez **Enable email confirmations**
   - Activez **Enable phone confirmations** (optionnel)

2. **Configurez les URLs :**
   - Site URL : `http://localhost:8080`
   - Redirect URLs : 
     - `http://localhost:8080/auth`
     - `http://localhost:8080/auth/callback`
     - `http://localhost:8080/`

3. **Configurez les fournisseurs :**
   - Email : ✅ Activé
   - Google : ❌ Désactivé (optionnel)
   - GitHub : ❌ Désactivé (optionnel)

### **Étape 4 : Initialiser les Données**

1. **Exécutez le script d'initialisation :**
```bash
node init-database-complete.js
```

**Résultat attendu :**
```
🚀 Initialisation complète de la base de données Kinshasa-Alerte
============================================================
🔍 Test de connexion à Supabase...
✅ Connexion réussie !
🏘️  Initialisation des communes...
✅ 24 communes insérées avec succès
🚨 Initialisation des types de problèmes...
✅ 12 types de problèmes insérés avec succès
📝 Création de signalements de test...
✅ 5 signalements de test créés avec succès
👥 Création des utilisateurs de test...
✅ Utilisateurs de test créés avec succès

🎉 Initialisation terminée !
```

### **Étape 5 : Vérifier la Configuration**

1. **Testez la connexion :**
```bash
node test-connection.js
```

**Résultat attendu :**
```
📋 Résumé:
Base de données: ✅ Connectée
Authentification: ✅ Fonctionnelle
```

2. **Vérifiez les données dans Supabase :**
   - Allez dans **Table Editor**
   - Vérifiez que les tables contiennent des données :
     - `communes` : 24 communes
     - `problem_types` : 12 types
     - `reports` : 5 signalements de test
     - `users` : 2 utilisateurs de test

## 🎯 Données Créées

### **24 Communes de Kinshasa**
- Bandalungwa, Barumbu, Bumbu, Gombe, Kalamu, Kasa-Vubu
- Kimbanseke, Kinshasa, Kintambo, Kisenso, Lemba, Limete
- Lingwala, Makala, Maluku, Masina, Matete, Mont-Ngafula
- Ndjili, Ngaba, Ngaliema, Ngiri-Ngiri, N'sele, Selembao

### **12 Types de Problèmes**
- Ordures ménagères, Éclairage public, Voirie dégradée
- Inondations, Approvisionnement en eau, Pannes électriques
- Insécurité, Infrastructures publiques, Espaces verts
- Services publics, Transport, Autre

### **5 Signalements de Test**
- Ordures à Gombe (En attente)
- Éclairage à Kalamu (En cours)
- Voirie à Ngaliema (Résolu)
- Inondations à Masina (En attente)
- Eau à Limete (En cours)

### **2 Utilisateurs de Test**
- **Admin** : `admin@kinshasa-alerte.rdc`
- **Bourgmestre** : `bourgmestre.gombe@kinshasa-alerte.rdc`

## 🚀 Test de l'Application

### **1. Lancez l'application :**
```bash
npm run dev
```

### **2. Testez les fonctionnalités :**

**Page d'accueil :**
- ✅ Navigation fonctionnelle
- ✅ Boutons redirigent correctement

**Formulaire de signalement :**
- ✅ Chargement rapide des données depuis Supabase
- ✅ 24 communes disponibles
- ✅ 12 types de problèmes disponibles
- ✅ Soumission fonctionnelle

**Authentification :**
- ✅ Inscription d'un nouveau citoyen
- ✅ Connexion avec les comptes de test
- ✅ Gestion des rôles

**Dashboards :**
- ✅ Dashboard Admin avec données réelles
- ✅ Dashboard Bourgmestre avec données réelles
- ✅ Statistiques en temps réel

## 🔧 Dépannage

### **Problème : "relation does not exist"**
**Solution :** Exécutez d'abord le script SQL dans Supabase

### **Problème : "Policy violation"**
**Solution :** Vérifiez que les politiques RLS sont bien créées

### **Problème : "Storage bucket not found"**
**Solution :** Créez le bucket `report-images` dans Storage

### **Problème : "Authentication error"**
**Solution :** Vérifiez les URLs de redirection dans Auth Settings

## 📊 Vérification Finale

### **Checklist de validation :**
- ✅ Base de données créée avec 7 tables
- ✅ 24 communes insérées
- ✅ 12 types de problèmes insérés
- ✅ 5 signalements de test créés
- ✅ 2 utilisateurs de test créés
- ✅ Storage configuré
- ✅ Authentification configurée
- ✅ Application fonctionnelle

### **Test complet :**
1. Accédez à `http://localhost:8080`
2. Testez la navigation
3. Allez sur `/signaler` - données chargées depuis Supabase
4. Créez un compte citoyen
5. Connectez-vous avec les comptes de test
6. Testez les dashboards

## 🎉 Résultat Final

**Votre application Kinshasa-Alerte est maintenant entièrement configurée avec :**

- ✅ **Base de données Supabase** complète
- ✅ **Données réelles** des 24 communes de Kinshasa
- ✅ **Authentification** fonctionnelle
- ✅ **Storage** pour les images
- ✅ **Sécurité RLS** configurée
- ✅ **Signalements de test** pour démonstration

**L'application est prête pour la production !** 🚀

---

**🎯 Configuration Supabase terminée ! Votre application utilise maintenant des données réelles au lieu des données statiques.** 