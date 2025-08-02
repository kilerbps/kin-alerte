-- Script de configuration du stockage Supabase pour les images de signalements
-- À exécuter dans la console SQL de Supabase

-- 1. Créer le bucket report-images (si il n'existe pas)
-- Note: Cette commande doit être exécutée via l'API ou l'interface Supabase
-- car INSERT INTO storage.buckets n'est pas autorisé directement

-- 2. Activer RLS sur storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to images" ON storage.objects;

-- 4. Créer les politiques RLS pour le bucket report-images

-- Politique pour permettre l'upload d'images par les utilisateurs authentifiés
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'report-images' AND
  auth.role() = 'authenticated'
);

-- Politique pour permettre la lecture publique des images
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT USING (
  bucket_id = 'report-images'
);

-- Politique pour permettre la suppression par les admins
CREATE POLICY "Allow admin deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'report-images' AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Politique pour permettre la mise à jour par les admins
CREATE POLICY "Allow admin updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'report-images' AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- 5. Vérifier que les politiques ont été créées
SELECT 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- 6. Vérifier que RLS est activé
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' 
AND schemaname = 'storage'; 