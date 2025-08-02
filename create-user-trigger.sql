-- Trigger pour créer automatiquement le profil utilisateur
-- lors de l'inscription via Supabase Auth

-- 1. Fonction pour créer le profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    role,
    commune_id,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen'),
    NEW.raw_user_meta_data->>'commune_id',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger pour appeler la fonction lors de l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Politique RLS pour permettre la lecture de son propre profil
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- 4. Politique RLS pour permettre la mise à jour de son propre profil
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- 5. Politique RLS pour permettre l'insertion (via le trigger)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 6. Politique RLS pour les admins (peuvent voir tous les utilisateurs)
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Politique RLS pour les bourgmestres (peuvent voir les utilisateurs de leur commune)
DROP POLICY IF EXISTS "Bourgmestres can view commune users" ON public.users;
CREATE POLICY "Bourgmestres can view commune users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() 
      AND role = 'bourgmestre' 
      AND commune_id = users.commune_id
    )
  );

-- 8. Vérifier que RLS est activé
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 9. Créer l'utilisateur manquant s'il existe
INSERT INTO public.users (
  id,
  email,
  full_name,
  phone,
  role,
  commune_id,
  created_at,
  updated_at
) VALUES (
  '8a89c4bf-d61b-4bd2-8900-bae532cda4d9',
  'kilemma633@gmail.com',
  'Utilisateur Test',
  NULL,
  'citizen',
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 10. Afficher les utilisateurs existants
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10; 