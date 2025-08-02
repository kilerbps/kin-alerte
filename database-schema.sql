-- Script SQL pour créer la base de données Kinshasa-Alerte
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('citizen', 'admin', 'bourgmestre')) DEFAULT 'citizen',
  commune_id UUID REFERENCES communes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des communes
CREATE TABLE IF NOT EXISTS communes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  coordinates TEXT, -- Format: "latitude,longitude"
  population INTEGER,
  bourgmestre_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des types de problèmes
CREATE TABLE IF NOT EXISTS problem_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  priority_level INTEGER DEFAULT 2 CHECK (priority_level BETWEEN 1 AND 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des signalements
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id TEXT UNIQUE NOT NULL, -- Format: RPT-XXXXXX-XXX
  problem_type_id UUID REFERENCES problem_types(id) NOT NULL,
  commune_id UUID REFERENCES communes(id) NOT NULL,
  user_id UUID REFERENCES users(id), -- NULL si anonyme
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  coordinates TEXT, -- Format: "latitude,longitude"
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'in-progress', 'resolved', 'rejected')) DEFAULT 'pending',
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table des images des signalements
CREATE TABLE IF NOT EXISTS report_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table des commentaires
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table des rapports hebdomadaires
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID REFERENCES communes(id) NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_reports INTEGER DEFAULT 0,
  resolved_reports INTEGER DEFAULT 0,
  report_data JSONB, -- Données détaillées du rapport
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reports_commune_id ON reports(commune_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_report_images_report_id ON report_images(report_id);
CREATE INDEX IF NOT EXISTS idx_comments_report_id ON comments(report_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_commune_id ON weekly_reports(commune_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week_start ON weekly_reports(week_start);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer automatiquement report_id
CREATE OR REPLACE FUNCTION generate_report_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.report_id := 'RPT-' || 
                     EXTRACT(EPOCH FROM NOW())::TEXT || 
                     '-' || 
                     SUBSTRING(MD5(RANDOM()::TEXT), 1, 3);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour générer automatiquement report_id
CREATE TRIGGER generate_report_id_trigger
    BEFORE INSERT ON reports
    FOR EACH ROW
    WHEN (NEW.report_id IS NULL)
    EXECUTE FUNCTION generate_report_id();

-- RLS (Row Level Security) - Politiques de sécurité
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE communes ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour les communes (lecture publique)
CREATE POLICY "Communes are viewable by everyone" ON communes
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify communes" ON communes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour les types de problèmes (lecture publique)
CREATE POLICY "Problem types are viewable by everyone" ON problem_types
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify problem types" ON problem_types
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour les signalements
CREATE POLICY "Reports are viewable by everyone" ON reports
    FOR SELECT USING (true);

CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own reports" ON reports
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'bourgmestre')
        )
    );

CREATE POLICY "Admins and bourgmestres can update all reports" ON reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'bourgmestre')
        )
    );

-- Politiques pour les images
CREATE POLICY "Report images are viewable by everyone" ON report_images
    FOR SELECT USING (true);

CREATE POLICY "Users can upload images for their reports" ON report_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM reports 
            WHERE id = report_id AND user_id = auth.uid()
        )
    );

-- Politiques pour les commentaires
CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (user_id = auth.uid());

-- Politiques pour les rapports hebdomadaires
CREATE POLICY "Weekly reports are viewable by admins and bourgmestres" ON weekly_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'bourgmestre')
        )
    );

CREATE POLICY "Only admins can create weekly reports" ON weekly_reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Fonction pour obtenir les statistiques des signalements
CREATE OR REPLACE FUNCTION get_reports_stats(commune_id_param UUID DEFAULT NULL)
RETURNS TABLE (
    total_reports BIGINT,
    pending_reports BIGINT,
    in_progress_reports BIGINT,
    resolved_reports BIGINT,
    rejected_reports BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_reports,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_reports,
        COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress_reports,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_reports,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_reports
    FROM reports
    WHERE commune_id_param IS NULL OR commune_id = commune_id_param;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les signalements par type de problème
CREATE OR REPLACE FUNCTION get_reports_by_problem_type(commune_id_param UUID DEFAULT NULL)
RETURNS TABLE (
    problem_type_name TEXT,
    problem_type_description TEXT,
    report_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.name as problem_type_name,
        pt.description as problem_type_description,
        COUNT(r.id) as report_count
    FROM problem_types pt
    LEFT JOIN reports r ON pt.id = r.problem_type_id
    WHERE commune_id_param IS NULL OR r.commune_id = commune_id_param
    GROUP BY pt.id, pt.name, pt.description
    ORDER BY report_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Vues utiles
CREATE OR REPLACE VIEW reports_with_details AS
SELECT 
    r.*,
    pt.name as problem_type_name,
    pt.description as problem_type_description,
    c.name as commune_name,
    u.full_name as reporter_name,
    u.email as reporter_email,
    COUNT(ri.id) as image_count
FROM reports r
LEFT JOIN problem_types pt ON r.problem_type_id = pt.id
LEFT JOIN communes c ON r.commune_id = c.id
LEFT JOIN users u ON r.user_id = u.id
LEFT JOIN report_images ri ON r.id = ri.report_id
GROUP BY r.id, pt.name, pt.description, c.name, u.full_name, u.email;

-- Vue pour les statistiques par commune
CREATE OR REPLACE VIEW commune_stats AS
SELECT 
    c.id,
    c.name,
    c.population,
    COUNT(r.id) as total_reports,
    COUNT(r.id) FILTER (WHERE r.status = 'pending') as pending_reports,
    COUNT(r.id) FILTER (WHERE r.status = 'in-progress') as in_progress_reports,
    COUNT(r.id) FILTER (WHERE r.status = 'resolved') as resolved_reports,
    CASE 
        WHEN COUNT(r.id) > 0 THEN 
            ROUND((COUNT(r.id) FILTER (WHERE r.status = 'resolved')::DECIMAL / COUNT(r.id)::DECIMAL) * 100, 2)
        ELSE 0 
    END as resolution_rate
FROM communes c
LEFT JOIN reports r ON c.id = r.commune_id
GROUP BY c.id, c.name, c.population
ORDER BY total_reports DESC; 