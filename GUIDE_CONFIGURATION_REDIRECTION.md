# 🔧 Guide de Configuration des URLs de Redirection Supabase

## ❌ Problème actuel
Les emails de confirmation redirigent vers `localhost:8080` au lieu de `https://kinshasa-alerte.vercel.app`

## ✅ Solution

### 1. Configuration dans Supabase Dashboard

#### A. URLs autorisées
1. **Allez dans votre dashboard Supabase**
2. **Authentication > URL Configuration**
3. **Configurez :**
   - **Site URL :** `https://kinshasa-alerte.vercel.app`
   - **Redirect URLs :**
     ```
     https://kinshasa-alerte.vercel.app/auth
     https://kinshasa-alerte.vercel.app/auth?reset=true
     https://kinshasa-alerte.vercel.app/auth?confirm=true
     https://kinshasa-alerte.vercel.app/dashboard
     https://kinshasa-alerte.vercel.app/
     ```

#### B. Templates d'email
1. **Authentication > Email Templates**
2. **Confirmation d'email :**
   - Cliquez sur "Confirmation"
   - Dans le template, assurez-vous que le lien pointe vers :
     ```
     {{ .ConfirmationURL }}
     ```
   - Ou utilisez directement :
     ```
     https://kinshasa-alerte.vercel.app/auth?confirm=true
     ```

3. **Réinitialisation de mot de passe :**
   - Cliquez sur "Recovery"
   - Dans le template, utilisez :
     ```
     {{ .ConfirmationURL }}
     ```
   - Ou directement :
     ```
     https://kinshasa-alerte.vercel.app/auth?reset=true
     ```

### 2. Variables d'environnement Vercel

Dans votre dashboard Vercel :
1. **Settings > Environment Variables**
2. **Ajoutez :**
   ```
   VITE_AUTH_REDIRECT_URL=https://kinshasa-alerte.vercel.app/auth
   VITE_RESET_PASSWORD_URL=https://kinshasa-alerte.vercel.app/auth?reset=true
   VITE_CONFIRM_EMAIL_URL=https://kinshasa-alerte.vercel.app/auth?confirm=true
   ```

### 3. Test de la configuration

#### A. Test de création de compte
1. Créez un nouveau compte
2. Vérifiez l'email reçu
3. Cliquez sur le lien de confirmation
4. Vérifiez que vous êtes redirigé vers `https://kinshasa-alerte.vercel.app`

#### B. Test de mot de passe oublié
1. Demandez une réinitialisation
2. Vérifiez l'email reçu
3. Cliquez sur le lien
4. Vérifiez que vous êtes redirigé vers `https://kinshasa-alerte.vercel.app`

## 🔧 Code modifié

### Hook useAuth.ts
```typescript
// Fonction signUp avec redirection
const signUp = async (email: string, password: string, userData: {
  full_name: string
  phone?: string
  commune_id?: string
}) => {
  const redirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || 
                     `${window.location.origin}/auth?confirm=true`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: userData.full_name,
        phone: userData.phone,
        commune_id: userData.commune_id,
      },
      emailRedirectTo: redirectUrl
    }
  })
  // ...
}

// Fonction resetPassword avec redirection
const resetPassword = async (email: string) => {
  const redirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || 
                     import.meta.env.VITE_RESET_PASSWORD_URL || 
                     `${window.location.origin}/auth?reset=true`;
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  })
  // ...
}
```

## 📋 Checklist de vérification

### Dans Supabase Dashboard
- [ ] **Authentication > URL Configuration**
  - [ ] Site URL : `https://kinshasa-alerte.vercel.app`
  - [ ] Redirect URLs configurées
- [ ] **Authentication > Email Templates**
  - [ ] Confirmation d'email configuré
  - [ ] Réinitialisation de mot de passe configuré

### Dans Vercel Dashboard
- [ ] **Settings > Environment Variables**
  - [ ] `VITE_AUTH_REDIRECT_URL` configuré
  - [ ] `VITE_RESET_PASSWORD_URL` configuré
  - [ ] `VITE_CONFIRM_EMAIL_URL` configuré

### Tests fonctionnels
- [ ] Création de compte → Email → Redirection correcte
- [ ] Mot de passe oublié → Email → Redirection correcte
- [ ] Connexion normale fonctionne
- [ ] Dashboard accessible après confirmation

## 🚨 Résolution des problèmes

### Problème : Toujours redirigé vers localhost
**Solution :**
1. Vérifiez les URLs dans Supabase
2. Vérifiez les variables d'environnement Vercel
3. Redéployez l'application Vercel
4. Videz le cache du navigateur

### Problème : Email non reçu
**Solution :**
1. Vérifiez les spams
2. Vérifiez la configuration email Supabase
3. Testez avec un autre email

### Problème : Erreur 404 après redirection
**Solution :**
1. Vérifiez que l'URL de redirection existe
2. Vérifiez la configuration des routes React Router
3. Testez l'URL directement

## 📞 Support

### Logs utiles
```bash
# Vercel logs
vercel logs --follow

# Supabase logs
# Dashboard > Logs > Auth
```

### Commandes de test
```bash
# Test local
npm run dev

# Test build
npm run build

# Redéploiement Vercel
vercel --prod
```

---

🎉 **Après cette configuration, les emails redirigeront correctement vers votre application de production !** 