-- Script pour corriger les politiques RLS
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Communes are publicly viewable" ON communes;
DROP POLICY IF EXISTS "Admins can manage communes" ON communes;
DROP POLICY IF EXISTS "Problem types are publicly viewable" ON problem_types;
DROP POLICY IF EXISTS "Admins can manage problem types" ON problem_types;
DROP POLICY IF EXISTS "Reports are publicly viewable" ON reports;
DROP POLICY IF EXISTS "Authenticated users can create reports" ON reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON reports;
DROP POLICY IF EXISTS "Admins and bourgmestres can manage all reports" ON reports;
DROP POLICY IF EXISTS "Report images are publicly viewable" ON report_images;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON report_images;
DROP POLICY IF EXISTS "Admins and bourgmestres can manage images" ON report_images;
DROP POLICY IF EXISTS "Comments are publicly viewable" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Admins and bourgmestres can manage all comments" ON comments;
DROP POLICY IF EXISTS "Weekly reports are viewable by admins and bourgmestres" ON weekly_reports;
DROP POLICY IF EXISTS "Admins can manage weekly reports" ON weekly_reports;

-- Politiques simplifiées pour éviter la récursion

-- Politiques pour les utilisateurs (simplifiées)
CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Politiques pour les communes
CREATE POLICY "Enable read access for all users" ON communes
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON communes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politiques pour les types de problèmes
CREATE POLICY "Enable read access for all users" ON problem_types
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON problem_types
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politiques pour les signalements
CREATE POLICY "Enable read access for all users" ON reports
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON reports
    FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour les images des signalements
CREATE POLICY "Enable read access for all users" ON report_images
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON report_images
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politiques pour les commentaires
CREATE POLICY "Enable read access for all users" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour les rapports hebdomadaires
CREATE POLICY "Enable read access for all users" ON weekly_reports
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON weekly_reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Politiques RLS corrigées avec succès !';
    RAISE NOTICE '🔒 Récursion infinie résolue';
    RAISE NOTICE '🎯 Base de données prête pour l''utilisation !';
END $$; 