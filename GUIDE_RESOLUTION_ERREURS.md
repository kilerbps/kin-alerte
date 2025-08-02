# 🔧 Guide de Résolution des Erreurs

## 🚨 Erreurs Courantes et Solutions

### 1. **ERR_CONNECTION_CLOSED**

**Symptômes :**
- Erreur `net::ERR_CONNECTION_CLOSED` dans la console
- Impossible de charger les données
- Messages d'erreur de connexion

**Solutions :**

#### A. Vérifier les Variables d'Environnement
```bash
# Vérifier que le fichier .env existe et contient les bonnes valeurs
cat .env

# Les variables doivent être présentes :
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### B. Redémarrer le Serveur de Développement
```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

#### C. Vérifier la Connexion Internet
- Tester la connexion à d'autres sites
- Vérifier que Supabase est accessible

### 2. **Erreur de Récupération des Signalements**

**Symptômes :**
- `❌ CitizenDashboard: Erreur récupération signalements`
- `❌ CitizenDashboard: Erreur lors du chargement des signalements`

**Solutions :**

#### A. Vérifier l'Authentification
1. **Se déconnecter et se reconnecter**
2. **Vérifier que l'utilisateur est bien connecté**
3. **Vérifier les logs de la console pour l'ID utilisateur**

#### B. Vérifier les RLS Policies
Exécuter dans la console SQL de Supabase :
```sql
-- Vérifier les policies existantes
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

#### C. Corriger les RLS Policies
```sql
-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Enable read access for all users" ON reports;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON reports;
DROP POLICY IF EXISTS "Enable update for admins and owners" ON reports;
DROP POLICY IF EXISTS "Enable delete for admins and owners" ON reports;

-- Créer les nouvelles policies
CREATE POLICY "Enable read access for all users" 
ON reports FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON reports FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  user_id IS NULL
);

CREATE POLICY "Enable update for admins and owners" 
ON reports FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'bourgmestre')
  )
  OR
  (auth.uid() = user_id)
);

CREATE POLICY "Enable delete for admins and owners" 
ON reports FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'bourgmestre')
  )
  OR
  (auth.uid() = user_id)
);
```

### 3. **Problèmes de Synchronisation Temps Réel**

**Symptômes :**
- Les changements ne se propagent pas entre les dashboards
- Pas de notifications temps réel
- Données statiques

**Solutions :**

#### A. Vérifier les Abonnements Temps Réel
1. **Ouvrir la console du navigateur**
2. **Chercher les logs commençant par `🔔`**
3. **Vérifier que les abonnements sont actifs**

#### B. Forcer le Rafraîchissement
- **Attendre 30 secondes** (rafraîchissement automatique)
- **Recharger la page** (F5)
- **Vider le cache** (Ctrl+Shift+R)

#### C. Vérifier la Configuration Supabase
1. **Aller dans le dashboard Supabase**
2. **Vérifier que Realtime est activé**
3. **Vérifier les permissions de la base de données**

### 4. **Utilisation du Composant de Diagnostic**

#### A. Afficher le Diagnostic
- **Cliquer sur le bouton "Connexion"** en bas à droite
- **Vérifier l'état de chaque composant**

#### B. Interpréter les Résultats
- **✅ Vert** : Fonctionne correctement
- **🔄 Jaune** : En cours de vérification
- **❌ Rouge** : Erreur détectée

#### C. Actions Correctives
- **Si Supabase est déconnecté** : Vérifier les variables d'environnement
- **Si l'authentification échoue** : Se reconnecter
- **Si la base de données est inaccessible** : Vérifier les RLS policies

## 🔍 Diagnostic Avancé

### 1. **Logs de la Console**
```javascript
// Chercher ces patterns dans la console :
🔍 CitizenDashboard: Récupération des signalements pour user:
✅ CitizenDashboard: Signalements récupérés:
❌ CitizenDashboard: Erreur récupération signalements:
🔔 CitizenDashboard: Changement détecté sur un signalement personnel
```

### 2. **Test de Connexion Manuel**
```javascript
// Dans la console du navigateur :
const { data, error } = await supabase.from('reports').select('count').limit(1);
console.log('Test connexion:', error ? '❌' : '✅', error?.message || 'OK');
```

### 3. **Vérification de l'Authentification**
```javascript
// Dans la console du navigateur :
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session ? '✅ Connecté' : '❌ Non connecté');
```

## 🚀 Solutions Rapides

### **Solution 1 : Redémarrage Complet**
1. Arrêter le serveur (Ctrl+C)
2. Vider le cache du navigateur
3. Redémarrer le serveur (`npm run dev`)
4. Se reconnecter

### **Solution 2 : Vérification des Variables**
1. Vérifier le fichier `.env`
2. Redémarrer le serveur
3. Tester la connexion

### **Solution 3 : Correction des RLS**
1. Exécuter les scripts SQL dans Supabase
2. Tester la synchronisation
3. Vérifier les permissions

## 📞 Support

Si les problèmes persistent :
1. **Vérifier les logs de la console**
2. **Utiliser le composant de diagnostic**
3. **Tester avec les scripts de diagnostic**
4. **Vérifier la configuration Supabase**

---

**💡 Conseil :** Le composant `ConnectionStatus` en bas à droite de l'écran vous donne un aperçu rapide de l'état de la connexion ! 