const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserInfo() {
  console.log('🔍 Test des informations utilisateur...\n');

  try {
    // Test avec un utilisateur citoyen existant
    const testEmail = 'citoyen@kinshasa-alerte.rdc';
    const testPassword = 'citoyen123456';

    console.log(`📧 Tentative de connexion avec: ${testEmail}`);

    // Connexion
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (authError) {
      console.error('❌ Erreur de connexion:', authError.message);
      return;
    }

    console.log('✅ Connexion réussie');
    console.log('👤 ID utilisateur:', authData.user.id);
    console.log('📧 Email:', authData.user.email);

    // Récupération du profil utilisateur
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erreur récupération profil:', profileError.message);
      return;
    }

    console.log('\n📋 Profil utilisateur récupéré:');
    console.log('   Nom complet:', userProfile.full_name);
    console.log('   Email:', userProfile.email);
    console.log('   Téléphone:', userProfile.phone || 'Non renseigné');
    console.log('   Rôle:', userProfile.role);
    console.log('   Commune ID:', userProfile.commune_id || 'Non renseigné');

    // Test avec un utilisateur admin
    console.log('\n🔍 Test avec un utilisateur admin...');
    
    const { data: adminAuthData, error: adminAuthError } = await supabase.auth.signInWithPassword({
      email: 'admin@kinshasa-alerte.rdc',
      password: 'admin123456'
    });

    if (adminAuthError) {
      console.error('❌ Erreur connexion admin:', adminAuthError.message);
    } else {
      console.log('✅ Connexion admin réussie');
      
      const { data: adminProfile, error: adminProfileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', adminAuthData.user.id)
        .single();

      if (!adminProfileError) {
        console.log('📋 Profil admin:');
        console.log('   Nom complet:', adminProfile.full_name);
        console.log('   Email:', adminProfile.email);
        console.log('   Rôle:', adminProfile.role);
      }
    }

    console.log('\n✅ Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testUserInfo();