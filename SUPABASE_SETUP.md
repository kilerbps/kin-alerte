# 🚀 Configuration Supabase - Kinshasa-Alerte

## 📋 Prérequis

1. Compte Supabase (gratuit sur [supabase.com](https://supabase.com))
2. Node.js et npm installés
3. Projet React configuré

## 🔧 Étapes de configuration

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **URL du projet** et votre **clé anon publique**

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application Configuration
VITE_APP_NAME=Kinshasa-Alerte
VITE_APP_VERSION=1.0.0
```

### 3. Créer la base de données

1. Dans votre dashboard Supabase, allez dans **SQL Editor**
2. Copiez et exécutez le contenu du fichier `database-schema.sql`
3. Vérifiez que toutes les tables sont créées dans **Table Editor**

### 4. Configurer le Storage

1. Dans **Storage**, créez un nouveau bucket appelé `report-images`
2. Configurez les politiques de sécurité :

```sql
-- Politique pour permettre l'upload d'images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'report-images' AND auth.role() = 'authenticated');

-- Politique pour permettre la lecture publique
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT USING (bucket_id = 'report-images');

-- Politique pour permettre la suppression par l'utilisateur
CREATE POLICY "Allow user deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'report-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 5. Initialiser les données

1. Dans **SQL Editor**, exécutez les requêtes d'initialisation :

```sql
-- Insérer les communes
INSERT INTO communes (name, population, coordinates) VALUES
('Bandalungwa', 120000, '-4.4419,15.2663'),
('Barumbu', 95000, '-4.4419,15.2663'),
('Bumbu', 180000, '-4.4419,15.2663'),
('Gombe', 250000, '-4.4419,15.2663'),
('Kalamu', 200000, '-4.4419,15.2663'),
('Kasa-Vubu', 150000, '-4.4419,15.2663'),
('Kimbanseke', 300000, '-4.4419,15.2663'),
('Kinshasa', 220000, '-4.4419,15.2663'),
('Kintambo', 110000, '-4.4419,15.2663'),
('Kisenso', 160000, '-4.4419,15.2663'),
('Lemba', 140000, '-4.4419,15.2663'),
('Limete', 170000, '-4.4419,15.2663'),
('Lingwala', 130000, '-4.4419,15.2663'),
('Makala', 190000, '-4.4419,15.2663'),
('Maluku', 80000, '-4.4419,15.2663'),
('Masina', 280000, '-4.4419,15.2663'),
('Matete', 210000, '-4.4419,15.2663'),
('Mont-Ngafula', 90000, '-4.4419,15.2663'),
('Ndjili', 240000, '-4.4419,15.2663'),
('Ngaba', 120000, '-4.4419,15.2663'),
('Ngaliema', 260000, '-4.4419,15.2663'),
('Ngiri-Ngiri', 100000, '-4.4419,15.2663'),
('N''sele', 70000, '-4.4419,15.2663'),
('Selembao', 85000, '-4.4419,15.2663');

-- Insérer les types de problèmes
INSERT INTO problem_types (name, description, priority_level) VALUES
('Ordures ménagères', 'Accumulation d''ordures, poubelles pleines, décharges sauvages', 3),
('Éclairage public', 'Lampadaires défectueux, zones sombres, pannes d''éclairage', 2),
('Voirie dégradée', 'Nids-de-poule, routes endommagées, trottoirs cassés', 3),
('Inondations', 'Eaux stagnantes, débordements, drainage défaillant', 3),
('Approvisionnement en eau', 'Coupures d''eau, fuites, pression insuffisante', 3),
('Pannes électriques', 'Coupures de courant, transformateurs défectueux', 2),
('Insécurité', 'Vols, agressions, zones dangereuses', 3),
('Infrastructures publiques', 'Écoles, hôpitaux, bâtiments publics dégradés', 2),
('Espaces verts', 'Parks négligés, arbres malades, espaces publics', 1),
('Services publics', 'Transports, postes, services administratifs', 2),
('Transport', 'Problèmes de transport public, routes bloquées', 2),
('Autre', 'Autres problèmes non catégorisés', 1);
```

### 6. Créer des utilisateurs de test

```sql
-- Créer un admin
INSERT INTO users (email, full_name, role) VALUES
('admin@kinshasa-alerte.rdc', 'Administrateur Principal', 'admin');

-- Créer un bourgmestre
INSERT INTO users (email, full_name, role, commune_id) VALUES
('bourgmestre.gombe@kinshasa-alerte.rdc', 'Bourgmestre de Gombe', 'bourgmestre', 
 (SELECT id FROM communes WHERE name = 'Gombe' LIMIT 1));
```

### 7. Tester la configuration

1. Lancez l'application : `npm run dev`
2. Vérifiez que la connexion Supabase fonctionne
3. Testez l'authentification
4. Testez la création d'un signalement

## 🔐 Configuration de l'authentification

### Activer l'authentification par email

1. Dans **Authentication > Settings**
2. Activez **Enable email confirmations**
3. Configurez les templates d'email si nécessaire

### Configurer les redirections

Dans **Authentication > URL Configuration** :

- **Site URL** : `http://localhost:8080`
- **Redirect URLs** : 
  - `http://localhost:8080/auth`
  - `http://localhost:8080/auth/callback`

## 📊 Monitoring et logs

### Activer les logs

1. Dans **Logs**, activez le monitoring
2. Surveillez les requêtes et erreurs

### Métriques importantes

- Nombre de signalements créés
- Temps de résolution moyen
- Taux de satisfaction
- Utilisation par commune

## 🚨 Sécurité

### Politiques RLS

Les politiques de sécurité sont déjà configurées dans le script SQL :

- **Utilisateurs** : Peuvent voir/modifier leur profil
- **Admins** : Accès complet à toutes les données
- **Bourgmestres** : Accès aux données de leur commune
- **Signalements** : Lecture publique, écriture authentifiée

### Bonnes pratiques

1. Ne jamais exposer les clés de service côté client
2. Utiliser les politiques RLS pour la sécurité
3. Valider les données côté serveur
4. Limiter les permissions utilisateur

## 🔧 Dépannage

### Erreurs courantes

1. **"Missing Supabase environment variables"**
   - Vérifiez que le fichier `.env` existe
   - Vérifiez les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

2. **"Policy violation"**
   - Vérifiez les politiques RLS
   - Assurez-vous que l'utilisateur est authentifié

3. **"Storage bucket not found"**
   - Créez le bucket `report-images` dans Storage
   - Configurez les politiques de sécurité

### Logs utiles

```javascript
// Dans la console du navigateur
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('User:', user)
console.log('Session:', session)
```

## 📈 Prochaines étapes

1. **Implémenter l'authentification** dans les composants
2. **Connecter le formulaire de signalement** à Supabase
3. **Mettre à jour les dashboards** avec les données réelles
4. **Ajouter les notifications** en temps réel
5. **Implémenter les rapports** automatiques

## 📞 Support

Pour toute question ou problème :
1. Consultez la [documentation Supabase](https://supabase.com/docs)
2. Vérifiez les logs dans le dashboard Supabase
3. Testez les requêtes dans l'éditeur SQL

---

**🎯 Objectif** : Avoir une base de données fonctionnelle avec des données réelles des 24 communes de Kinshasa et un système d'authentification sécurisé. 