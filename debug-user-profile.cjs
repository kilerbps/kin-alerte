const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugUserProfile() {
  console.log('🔍 Diagnostic du profil utilisateur...');
  
  try {
    // 1. Vérifier la structure de la table users
    console.log('\n📋 1. Structure de la table users :');
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erreur accès table users:', tableError);
    } else {
      console.log('✅ Table users accessible');
      if (tableInfo && tableInfo.length > 0) {
        console.log('📊 Colonnes disponibles:', Object.keys(tableInfo[0]));
      }
    }

    // 2. Lister tous les utilisateurs
    console.log('\n👥 2. Liste des utilisateurs :');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError);
    } else {
      console.log(`✅ ${users?.length || 0} utilisateurs trouvés :`);
      users?.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.role}) - ${user.id}`);
      });
    }

    // 3. Vérifier l'utilisateur spécifique
    const userId = '8a89c4bf-d61b-4bd2-8900-bae532cda4d9';
    console.log(`\n🔍 3. Recherche de l'utilisateur ${userId} :`);
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('❌ Erreur récupération utilisateur:', userError);
      
      // Essayer avec une requête différente
      console.log('\n🔄 Tentative avec requête alternative :');
      const { data: userAlt, error: userAltError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);
      
      if (userAltError) {
        console.error('❌ Erreur requête alternative:', userAltError);
      } else {
        console.log('✅ Requête alternative réussie:', userAlt);
      }
    } else {
      console.log('✅ Utilisateur trouvé:', user);
    }

    // 4. Vérifier les politiques RLS
    console.log('\n🔒 4. Vérification des politiques RLS :');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'users' });
    
    if (policiesError) {
      console.log('⚠️ Impossible de récupérer les politiques RLS');
      console.log('📝 Vérifiez manuellement dans Supabase Dashboard > Authentication > Policies');
    } else {
      console.log('📋 Politiques RLS pour la table users :', policies);
    }

    // 5. Créer l'utilisateur s'il n'existe pas
    if (userError && userError.code === 'PGRST116') {
      console.log('\n➕ 5. Création de l\'utilisateur manquant...');
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: 'kilemma633@gmail.com',
          full_name: 'Utilisateur Test',
          role: 'citizen',
          commune_id: null,
          phone: null
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Erreur création utilisateur:', createError);
      } else {
        console.log('✅ Utilisateur créé:', newUser);
      }
    }

    // 6. Test avec l'utilisateur connecté
    console.log('\n🔐 6. Test d\'authentification :');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'kilemma633@gmail.com',
      password: 'test123' // Remplacez par le vrai mot de passe
    });
    
    if (authError) {
      console.error('❌ Erreur authentification:', authError);
    } else {
      console.log('✅ Authentification réussie');
      console.log('👤 Utilisateur connecté:', authData.user?.email);
      
      // Test de récupération du profil avec l'utilisateur connecté
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user?.id)
        .single();
      
      if (profileError) {
        console.error('❌ Erreur récupération profil:', profileError);
      } else {
        console.log('✅ Profil récupéré:', profile);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le diagnostic
debugUserProfile(); 