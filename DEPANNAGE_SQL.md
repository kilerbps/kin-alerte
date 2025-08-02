# 🔧 Dépannage SQL - Erreurs Courantes

## ❌ Erreur : "relation "communes" does not exist"

### **Cause du Problème**
Cette erreur se produit quand le script SQL essaie de créer des références entre tables qui n'existent pas encore. L'ordre de création des tables est important.

### **Solution : Utiliser le Script Corrigé**

1. **Supprimez d'abord les tables existantes (si elles existent) :**
```sql
-- Exécutez ceci dans l'éditeur SQL de Supabase pour nettoyer
DROP TABLE IF EXISTS weekly_reports CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS report_images CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS problem_types CASCADE;
DROP TABLE IF EXISTS communes CASCADE;
```

2. **Utilisez le script corrigé :**
   - Copiez le contenu de `database-schema-fixed.sql`
   - Collez-le dans l'éditeur SQL de Supabase
   - Cliquez sur **Run**

### **Pourquoi le Script Corrigé Fonctionne**

Le script corrigé crée les tables dans le bon ordre :

1. ✅ **communes** (sans références)
2. ✅ **problem_types** (sans références)
3. ✅ **users** (avec référence à communes)
4. ✅ **Ajout de la contrainte** bourgmestre_id dans communes
5. ✅ **reports** (avec références aux autres tables)
6. ✅ **report_images** (avec référence à reports)
7. ✅ **comments** (avec références)
8. ✅ **weekly_reports** (avec références)

## 🔍 **Vérification de la Création**

### **1. Vérifiez que les tables sont créées :**
```sql
-- Exécutez cette requête pour voir toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Résultat attendu :**
```
communes
comments
problem_types
report_images
reports
users
weekly_reports
```

### **2. Vérifiez les politiques RLS :**
```sql
-- Exécutez cette requête pour voir les politiques
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### **3. Vérifiez les fonctions :**
```sql
-- Exécutez cette requête pour voir les fonctions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

## 🚀 **Étapes Complètes de Configuration**

### **Étape 1 : Nettoyer la Base de Données**
```sql
-- Exécutez ce script de nettoyage
DROP TABLE IF EXISTS weekly_reports CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS report_images CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS problem_types CASCADE;
DROP TABLE IF EXISTS communes CASCADE;
```

### **Étape 2 : Créer la Base de Données**
- Copiez le contenu de `database-schema-fixed.sql`
- Exécutez dans l'éditeur SQL de Supabase

### **Étape 3 : Vérifier la Création**
```sql
-- Vérifiez que tout est créé
SELECT 'Tables créées :' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

SELECT 'Politiques RLS :' as info;
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

SELECT 'Fonctions :' as info;
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';
```

### **Étape 4 : Initialiser les Données**
```bash
node init-database-complete.js
```

## 🎯 **Messages de Confirmation Attendus**

### **Après l'exécution du script SQL :**
```
NOTICE:  ✅ Base de données Kinshasa-Alerte créée avec succès !
NOTICE:  📊 Tables créées : users, communes, problem_types, reports, report_images, comments, weekly_reports
NOTICE:  🔒 Politiques RLS configurées
NOTICE:  📈 Index et vues créés
NOTICE:  🎯 Prêt pour l'initialisation des données !
```

### **Après l'initialisation des données :**
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

## 🔧 **Autres Erreurs Courantes**

### **Erreur : "duplicate key value violates unique constraint"**
**Solution :** Les données existent déjà. Relancez le script d'initialisation, il détectera automatiquement les données existantes.

### **Erreur : "permission denied"**
**Solution :** Vérifiez que vous utilisez la clé de service (service role key) et non la clé anonyme.

### **Erreur : "bucket does not exist"**
**Solution :** Créez le bucket `report-images` dans Storage > Buckets.

## 📞 **Support**

Si vous rencontrez encore des problèmes :

1. **Vérifiez les logs** dans la console SQL de Supabase
2. **Testez la connexion** avec `node test-connection.js`
3. **Vérifiez les variables d'environnement** dans `.env`
4. **Relancez le script de configuration** : `./setup-supabase.sh`

---

**🎯 Avec le script corrigé, la configuration devrait fonctionner parfaitement !** 