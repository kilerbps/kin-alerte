const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateUserEmail() {
  console.log('🔧 Mise à jour de l\'email utilisateur...\n');

  try {
    const userId = '4a34d720-6ed1-42f3-94c8-e4a3c98945a7';
    
    console.log(`🔍 Mise à jour de l'email pour l'utilisateur: ${userId}`);
    
    // Mettre à jour l'email
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        email: 'citoyen@kinshasa-alerte.rdc'
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour email:', updateError.message);
      return;
    }

    console.log('✅ Email mis à jour avec succès:');
    console.log('   ID:', updatedUser.id);
    console.log('   Email:', updatedUser.email);
    console.log('   Nom:', updatedUser.full_name);
    console.log('   Rôle:', updatedUser.role);

    console.log('\n✅ Mise à jour terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

updateUserEmail(); 