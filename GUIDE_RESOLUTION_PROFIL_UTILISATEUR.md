# 🔧 Guide de Résolution - Problème de Profil Utilisateur

## ❌ Problème identifié
- **Erreur 406 (Not Acceptable)** lors de la récupération du profil utilisateur
- **Boucle infinie** de tentatives de récupération
- **Utilisateur connecté** mais profil non trouvé dans la table `users`

## 🔍 Diagnostic

### 1. Exécuter le script de diagnostic
```bash
node debug-user-profile.cjs
```

### 2. Vérifier dans Supabase Dashboard
1. **Table Editor > users**
2. Vérifier si l'utilisateur existe
3. **Authentication > Users**
4. Vérifier si l'utilisateur est dans auth.users

## ✅ Solutions

### Solution 1: Créer le trigger automatique (Recommandé)

#### A. Exécuter le script SQL
1. Allez dans **Supabase Dashboard > SQL Editor**
2. Copiez le contenu de `create-user-trigger.sql`
3. Exécutez le script

#### B. Vérifier le trigger
```sql
-- Vérifier que le trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_schema = 'auth';
```

### Solution 2: Créer manuellement l'utilisateur

#### A. Via SQL Editor
```sql
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
```

#### B. Via Table Editor
1. **Table Editor > users**
2. Cliquez sur **Insert**
3. Remplissez les champs :
   - `id`: `8a89c4bf-d61b-4bd2-8900-bae532cda4d9`
   - `email`: `kilemma633@gmail.com`
   - `full_name`: `Utilisateur Test`
   - `role`: `citizen`
   - `created_at`: `now()`
   - `updated_at`: `now()`

### Solution 3: Vérifier les politiques RLS

#### A. Politiques nécessaires
```sql
-- Politique pour lire son propre profil
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Politique pour les admins
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### B. Vérifier les politiques existantes
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users';
```

## 🔧 Code modifié

### Hook useAuth.ts amélioré
```typescript
const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      // Si l'utilisateur n'existe pas, essayer de le créer
      if (error.code === 'PGRST116') {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: session?.user?.email || 'unknown@email.com',
            full_name: session?.user?.user_metadata?.full_name || 'Utilisateur',
            role: 'citizen',
            commune_id: session?.user?.user_metadata?.commune_id || null,
            phone: session?.user?.user_metadata?.phone || null
          })
          .select()
          .single()
        
        if (!createError) {
          setUser(newUser)
        }
      }
    } else {
      setUser(data)
    }
  } catch (error) {
    console.error('Erreur récupération profil:', error)
  } finally {
    setLoading(false)
  }
}
```

## 🧪 Tests après correction

### 1. Test de connexion
1. Déconnectez-vous
2. Reconnectez-vous
3. Vérifiez les logs de la console
4. Vérifiez que le profil est récupéré

### 2. Test de création de compte
1. Créez un nouveau compte
2. Vérifiez que le profil est créé automatiquement
3. Vérifiez que la connexion fonctionne

### 3. Test des dashboards
1. Testez l'accès au dashboard citoyen
2. Testez l'accès au dashboard admin
3. Testez l'accès au dashboard bourgmestre

## 📊 Monitoring

### Logs à surveiller
```javascript
// Logs normaux
✅ fetchUserProfile-simple: Profil récupéré avec succès
✅ useAuth-simple: État actuel - user: true loading: false isAuthenticated: true

// Logs d'erreur
❌ fetchUserProfile-simple: Erreur récupération profil
❌ fetchUserProfile-simple: Erreur création profil
```

### Métriques à vérifier
- ✅ Temps de récupération du profil < 2s
- ✅ Pas de boucles infinies
- ✅ Profil créé automatiquement lors de l'inscription
- ✅ Accès aux dashboards fonctionnel

## 🚨 Résolution des problèmes

### Problème : Toujours erreur 406
**Solution :**
1. Vérifiez les politiques RLS
2. Vérifiez que l'utilisateur existe dans la table `users`
3. Vérifiez les permissions de la table

### Problème : Boucle infinie
**Solution :**
1. Vérifiez le timeout dans `fetchUserProfile`
2. Vérifiez les événements d'authentification
3. Redémarrez l'application

### Problème : Profil non créé automatiquement
**Solution :**
1. Vérifiez que le trigger existe
2. Vérifiez les permissions du trigger
3. Testez manuellement la création

## 📞 Support

### Commandes utiles
```bash
# Diagnostic
node debug-user-profile.cjs

# Test de connexion
node test-auth-flow.js

# Vérification des tables
node test-connection.js
```

### Logs Supabase
- **Dashboard > Logs > Auth** : Logs d'authentification
- **Dashboard > Logs > Database** : Logs de base de données
- **Dashboard > Logs > API** : Logs d'API

---

🎉 **Après ces corrections, la récupération du profil utilisateur devrait fonctionner correctement !** 