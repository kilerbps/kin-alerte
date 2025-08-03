const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserProfileSimple() {
  console.log('🔧 Correction simple du profil utilisateur...\n');

  try {
    const userId = 'b77d09ee-3595-4e89-9f79-a496ffaa59fb';
    const userEmail = 'kilemma633@gmail.com';
    
    console.log(`🔍 Mise à jour du profil pour l'utilisateur: ${userId}`);
    
    // Mettre à jour le profil existant
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        email: userEmail,
        full_name: 'Kilemma User',
        role: 'citizen'
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour:', updateError.message);
      return;
    }

    console.log('✅ Profil mis à jour avec succès:');
    console.log('   ID:', updatedUser.id);
    console.log('   Email:', updatedUser.email);
    console.log('   Nom:', updatedUser.full_name);
    console.log('   Rôle:', updatedUser.role);

    // Tester la connexion
    console.log('\n🔍 Test de connexion...');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: 'password123' // Le mot de passe réel
    });

    if (authError) {
      console.error('❌ Erreur de connexion:', authError.message);
      console.log('💡 Le profil est corrigé, mais le mot de passe peut être incorrect');
    } else {
      console.log('✅ Connexion réussie !');
      console.log('   ID:', authData.user.id);
      console.log('   Email:', authData.user.email);
    }

    console.log('\n✅ Correction terminée !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

fixUserProfileSimple(); 