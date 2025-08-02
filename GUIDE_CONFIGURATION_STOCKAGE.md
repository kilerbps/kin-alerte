# 🔧 Guide de Configuration du Stockage Supabase

## Problème identifié
Les images uploadées dans les signalements ne sont pas sauvegardées car le bucket de stockage `report-images` n'existe pas dans Supabase.

## Solution

### Étape 1: Créer le bucket de stockage

1. **Connectez-vous à votre projet Supabase**
   - Allez sur https://supabase.com
   - Sélectionnez votre projet

2. **Accédez à la section Storage**
   - Dans le menu de gauche, cliquez sur "Storage"
   - Cliquez sur "New bucket"

3. **Configurez le bucket**
   - **Nom du bucket**: `report-images`
   - **Public bucket**: ✅ Cochez cette option
   - **File size limit**: `5MB`
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/png`
     - `image/gif`
     - `image/webp`

4. **Cliquez sur "Create bucket"**

### Étape 2: Configurer les politiques RLS

1. **Accédez à la console SQL**
   - Dans le menu de gauche, cliquez sur "SQL Editor"
   - Créez un nouveau query

2. **Exécutez le script SQL**
   - Copiez et collez le contenu du fichier `setup-storage.sql`
   - Cliquez sur "Run"

### Étape 3: Vérifier la configuration

1. **Testez l'upload d'images**
   - Retournez dans votre application
   - Créez un nouveau signalement avec une image
   - Vérifiez que l'image apparaît dans le dashboard

2. **Vérifiez dans Supabase**
   - Allez dans "Storage" > "report-images"
   - Vous devriez voir les images uploadées

## Structure des dossiers

Les images seront organisées comme suit :
```
report-images/
├── {report-id}/
│   ├── {timestamp1}.jpg
│   ├── {timestamp2}.png
│   └── ...
└── test/
    └── {test-files}
```

## Politiques RLS configurées

- ✅ **Upload**: Utilisateurs authentifiés peuvent uploader
- ✅ **Lecture**: Accès public aux images
- ✅ **Suppression**: Seuls les admins peuvent supprimer
- ✅ **Mise à jour**: Seuls les admins peuvent modifier

## Test de la configuration

Après avoir configuré le stockage, vous pouvez tester avec :

```bash
node test-image-upload.cjs
```

## Résolution des problèmes

### Erreur "bucket not found"
- Vérifiez que le bucket `report-images` a été créé
- Vérifiez que le nom est exactement `report-images` (avec un tiret)

### Erreur "RLS policy violation"
- Vérifiez que les politiques RLS ont été créées
- Vérifiez que l'utilisateur est authentifié

### Images non visibles
- Vérifiez que le bucket est public
- Vérifiez que les URLs sont correctement générées
- Vérifiez que les entrées dans `report_images` sont créées

## Code modifié

Le code dans `useReports.ts` gère déjà correctement :
- Upload des images vers le bucket
- Sauvegarde des URLs dans la table `report_images`
- Récupération des images avec les signalements

## Prochaines étapes

1. ✅ Créer le bucket `report-images`
2. ✅ Exécuter le script SQL
3. ✅ Tester l'upload d'images
4. ✅ Vérifier l'affichage dans les dashboards

Une fois ces étapes terminées, les images devraient fonctionner correctement ! 🎉 