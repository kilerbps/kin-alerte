# 🔧 Guide de Configuration Manuelle du Stockage Supabase

## Erreur rencontrée
```
ERROR: 42501: must be owner of table objects
```

Cette erreur est normale car la table `storage.objects` est gérée par Supabase et nécessite des privilèges spéciaux.

## Solution : Configuration via l'interface Supabase

### Étape 1: Créer le bucket (déjà fait)
✅ Vous avez déjà créé le bucket `report-images`

### Étape 2: Configurer les politiques RLS via l'interface

#### 2.1 Accéder aux politiques RLS
1. Dans votre projet Supabase, allez dans **"Authentication"** > **"Policies"**
2. Trouvez la table **"storage.objects"**
3. Cliquez sur **"New Policy"**

#### 2.2 Créer la politique d'upload
1. **Nom de la politique**: `Allow authenticated uploads`
2. **Target roles**: `authenticated`
3. **Policy definition**:
```sql
(bucket_id = 'report-images' AND auth.role() = 'authenticated')
```
4. **Operation**: `INSERT`
5. Cliquez sur **"Review"** puis **"Save policy"**

#### 2.3 Créer la politique de lecture publique
1. **Nom de la politique**: `Allow public reads`
2. **Target roles**: `public`
3. **Policy definition**:
```sql
(bucket_id = 'report-images')
```
4. **Operation**: `SELECT`
5. Cliquez sur **"Review"** puis **"Save policy"**

#### 2.4 Créer la politique de suppression admin
1. **Nom de la politique**: `Allow admin deletes`
2. **Target roles**: `authenticated`
3. **Policy definition**:
```sql
(bucket_id = 'report-images' AND EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.role = 'admin'
))
```
4. **Operation**: `DELETE`
5. Cliquez sur **"Review"** puis **"Save policy"**

#### 2.5 Créer la politique de mise à jour admin
1. **Nom de la politique**: `Allow admin updates`
2. **Target roles**: `authenticated`
3. **Policy definition**:
```sql
(bucket_id = 'report-images' AND EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.role = 'admin'
))
```
4. **Operation**: `UPDATE`
5. Cliquez sur **"Review"** puis **"Save policy"**

### Étape 3: Vérifier la configuration

#### 3.1 Vérifier les politiques créées
Dans **"Authentication"** > **"Policies"**, vous devriez voir :
- ✅ `Allow authenticated uploads` (INSERT)
- ✅ `Allow public reads` (SELECT)
- ✅ `Allow admin deletes` (DELETE)
- ✅ `Allow admin updates` (UPDATE)

#### 3.2 Tester l'upload
```bash
node test-image-upload.cjs
```

### Étape 4: Test complet

1. **Créez un signalement avec image** dans votre application
2. **Vérifiez dans Supabase Storage** que l'image apparaît
3. **Vérifiez dans les dashboards** que l'image s'affiche

## Résolution des problèmes

### Erreur "bucket not found"
- Vérifiez que le bucket s'appelle exactement `report-images`
- Vérifiez que le bucket est public

### Erreur "RLS policy violation"
- Vérifiez que toutes les politiques sont créées
- Vérifiez que l'utilisateur est authentifié

### Images non visibles
- Vérifiez que les URLs sont correctement générées
- Vérifiez que les entrées dans `report_images` sont créées

## Politiques RLS finales

Après configuration, vous devriez avoir :

| Politique | Opération | Rôles | Condition |
|-----------|-----------|-------|-----------|
| `Allow authenticated uploads` | INSERT | authenticated | `bucket_id = 'report-images' AND auth.role() = 'authenticated'` |
| `Allow public reads` | SELECT | public | `bucket_id = 'report-images'` |
| `Allow admin deletes` | DELETE | authenticated | `bucket_id = 'report-images' AND user is admin` |
| `Allow admin updates` | UPDATE | authenticated | `bucket_id = 'report-images' AND user is admin` |

## Test de validation

Une fois configuré, testez avec :

```bash
# Test de l'upload
node test-image-upload.cjs

# Test de l'application
# 1. Créez un signalement avec image
# 2. Vérifiez l'affichage dans les dashboards
```

🎉 **Après cette configuration, les images devraient fonctionner parfaitement !** 