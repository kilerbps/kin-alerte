# 🚀 Configuration Rapide - Kinshasa-Alerte

## 📋 Étapes de Configuration

### 1. ✅ Variables d'environnement configurées
Le fichier `.env` est déjà créé avec vos clés Supabase.

### 2. 🔧 Créer la base de données dans Supabase

**Allez dans votre dashboard Supabase :**
1. Ouvrez [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet : `skordnyitgvrtiouwdaz`
3. Allez dans **SQL Editor**

**Exécutez le script SQL :**
1. Copiez tout le contenu du fichier `database-schema.sql`
2. Collez-le dans l'éditeur SQL
3. Cliquez sur **Run** pour exécuter

### 3. 🗂️ Configurer le Storage

**Créez le bucket pour les images :**
1. Allez dans **Storage** dans votre dashboard
2. Cliquez sur **New bucket**
3. Nom : `report-images`
4. Public bucket : ✅ Activé
5. Cliquez sur **Create bucket**

### 4. 🔐 Configurer l'authentification

**Dans Authentication > Settings :**
1. Activez **Enable email confirmations**
2. Dans **URL Configuration** :
   - Site URL : `http://localhost:8080`
   - Redirect URLs : 
     - `http://localhost:8080/auth`
     - `http://localhost:8080/auth/callback`

### 5. 📊 Initialiser les données

**Exécutez le script d'initialisation :**
```bash
node init-database.js
```

### 6. 🚀 Lancer l'application

```bash
npm run dev
```

## 🧪 Test de l'application

### Comptes de test créés automatiquement :

**Admin :**
- Email : `admin@kinshasa-alerte.rdc`
- Mot de passe : (à définir via Supabase Auth)

**Bourgmestre :**
- Email : `bourgmestre.gombe@kinshasa-alerte.rdc`
- Mot de passe : (à définir via Supabase Auth)

### Étapes de test :

1. **Accédez à l'application** : `http://localhost:8080`
2. **Testez l'inscription** d'un nouveau citoyen
3. **Testez la connexion** avec les comptes de test
4. **Vérifiez les rôles** dans la navigation
5. **Testez les routes protégées** (admin, bourgmestre)

## 🔧 Dépannage

### Erreur "Missing Supabase environment variables"
- Vérifiez que le fichier `.env` existe
- Vérifiez les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

### Erreur "Policy violation"
- Vérifiez que les politiques RLS sont bien créées
- Assurez-vous que l'utilisateur est authentifié

### Erreur "Storage bucket not found"
- Créez le bucket `report-images` dans Storage
- Configurez les politiques de sécurité

## 📊 Données Réelles Implémentées

### 24 Communes de Kinshasa :
- Bandalungwa, Barumbu, Bumbu, Gombe, Kalamu, Kasa-Vubu
- Kimbanseke, Kinshasa, Kintambo, Kisenso, Lemba, Limete
- Lingwala, Makala, Maluku, Masina, Matete, Mont-Ngafula
- Ndjili, Ngaba, Ngaliema, Ngiri-Ngiri, N'sele, Selembao

### 12 Types de Problèmes :
- Ordures ménagères, Éclairage public, Voirie dégradée
- Inondations, Approvisionnement en eau, Pannes électriques
- Insécurité, Infrastructures publiques, Espaces verts
- Services publics, Transport, Autre

## 🎯 Fonctionnalités Disponibles

✅ **Authentification complète** avec rôles
✅ **Protection des routes** par rôle
✅ **Interface utilisateur** dynamique
✅ **Base de données** avec données réelles
✅ **Upload d'images** vers Supabase Storage
✅ **Sécurité RLS** configurée

## 🚀 Prochaines Étapes

1. **Connecter le formulaire de signalement** à Supabase
2. **Mettre à jour les dashboards** avec données réelles
3. **Implémenter les notifications** temps réel
4. **Ajouter les rapports** automatiques

---

**🎉 Votre application Kinshasa-Alerte est maintenant configurée avec Supabase et des données réelles !** 