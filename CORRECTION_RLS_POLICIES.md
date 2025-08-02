# 🔒 Correction des RLS Policies - Problème de Synchronisation

## 🚨 Problème Identifié

Le diagnostic a révélé que **les mises à jour de statut ne fonctionnent pas** à cause des RLS (Row Level Security) policies qui bloquent les opérations de mise à jour.

## 🔍 Diagnostic

- ✅ **Lecture** : Fonctionne correctement
- ❌ **Mise à jour** : Bloquée par les RLS policies
- ❌ **Synchronisation temps réel** : Ne fonctionne pas à cause des mises à jour bloquées

## 🛠️ Solution

### Étape 1: Accéder à la Console SQL de Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre projet
3. Cliquez sur **"SQL Editor"** dans le menu de gauche

### Étape 2: Supprimer les Anciennes Policies

```sql
-- Supprimer toutes les policies existantes sur la table reports
DROP POLICY IF EXISTS "Enable read access for all users" ON reports;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON reports;
DROP POLICY IF EXISTS "Enable update for admins and owners" ON reports;
DROP POLICY IF EXISTS "Enable delete for admins and owners" ON reports;
DROP POLICY IF EXISTS "Enable all access for admins" ON reports;
DROP POLICY IF EXISTS "Enable all access for bourgmestres" ON reports;
DROP POLICY IF EXISTS "Enable all access for citizens" ON reports;
```

### Étape 3: Créer les Nouvelles Policies

```sql
-- 1. Policy pour permettre la lecture de tous les signalements
CREATE POLICY "Enable read access for all users" 
ON reports FOR SELECT 
USING (true);

-- 2. Policy pour permettre l'insertion de signalements
CREATE POLICY "Enable insert for authenticated users" 
ON reports FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  user_id IS NULL
);

-- 3. Policy pour permettre la mise à jour des signalements
CREATE POLICY "Enable update for admins and owners" 
ON reports FOR UPDATE 
USING (
  -- Permettre aux admins et bourgmestres de tout modifier
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'bourgmestre')
  )
  OR
  -- Permettre aux citoyens de modifier leurs propres signalements
  (auth.uid() = user_id)
);

-- 4. Policy pour permettre la suppression des signalements
CREATE POLICY "Enable delete for admins and owners" 
ON reports FOR DELETE 
USING (
  -- Permettre aux admins et bourgmestres de tout supprimer
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'bourgmestre')
  )
  OR
  -- Permettre aux citoyens de supprimer leurs propres signalements
  (auth.uid() = user_id)
);
```

### Étape 4: Vérifier les Policies

```sql
-- Vérifier que les policies ont été créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'reports';
```

## 🧪 Test de la Correction

Après avoir exécuté les scripts SQL, testez avec ce script :

```bash
node test-approval-sync.js
```

## 📋 Résultat Attendu

Après la correction, vous devriez voir :

```
✅ Signalement approuvé avec succès
✅ Le statut a été correctement mis à jour dans la base de données
Signalements citoyen approuvés: 1
```

## 🔄 Synchronisation Temps Réel

Une fois les RLS policies corrigées, la synchronisation temps réel fonctionnera automatiquement :

1. **Admin approuve** → Statut mis à jour dans la base de données
2. **Dashboard citoyen** → Reçoit l'événement temps réel et met à jour l'affichage
3. **Notification** → Toast affiché au citoyen

## 🚀 Prochaines Étapes

1. ✅ Exécuter les scripts SQL dans Supabase
2. ✅ Tester avec le script de diagnostic
3. ✅ Vérifier que la synchronisation fonctionne dans l'application
4. ✅ Tester l'approbation depuis le dashboard admin

---

**💡 Note importante** : Les RLS policies sont essentielles pour la sécurité, mais elles doivent être configurées correctement pour permettre les opérations nécessaires tout en maintenant la sécurité. 