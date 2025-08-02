-- Script pour corriger les politiques RLS
-- Exécuter dans la console SQL de Supabase

-- 1. Supprimer toutes les politiques existantes sur la table users
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Bourgmestres can view users in their commune" ON users;

-- 2. Activer RLS sur la table users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Créer des politiques simples et fonctionnelles

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre l'insertion de nouveaux utilisateurs (inscription)
CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique pour permettre aux admins de voir tous les utilisateurs
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Politique pour permettre aux bourgmestres de voir les utilisateurs de leur commune
CREATE POLICY "Bourgmestres can view commune users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users bourgmestre
            WHERE bourgmestre.id = auth.uid() 
            AND bourgmestre.role = 'bourgmestre'
            AND bourgmestre.commune_id = users.commune_id
        )
    );

-- 4. Vérifier que RLS est activé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- 5. Lister les politiques créées
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users'; 