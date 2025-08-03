const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function mergeCitizenUsers() {
  console.log('🔧 Fusion des utilisateurs citoyens...\n');

  try {
    const oldUserId = '9072d83d-10eb-4138-bc75-b9cbf420b85b'; // Ancien utilisateur avec citoyen@kinshasa-alerte.rdc
    const newUserId = '4a34d720-6ed1-42f3-94c8-e4a3c98945a7'; // Nouvel utilisateur qui se connecte
    
    console.log(`🔍 Fusion de l'utilisateur ${oldUserId} vers ${newUserId}...`);
    
    // Vérifier les signalements de l'ancien utilisateur
    const { data: oldUserReports, error: reportsError } = await supabase
      .from('reports')
      .select('id')
      .eq('user_id', oldUserId);

    if (reportsError) {
      console.error('❌ Erreur vérification signalements:', reportsError.message);
      return;
    }

    console.log(`📋 L'ancien utilisateur a ${oldUserReports.length} signalements`);

    // Transférer les signalements vers le nouvel utilisateur
    if (oldUserReports.length > 0) {
      const { error: transferError } = await supabase
        .from('reports')
        .update({ user_id: newUserId })
        .eq('user_id', oldUserId);

      if (transferError) {
        console.error('❌ Erreur transfert signalements:', transferError.message);
        return;
      }

      console.log('✅ Signalements transférés avec succès');
    }

    // Supprimer l'ancien utilisateur d'abord
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', oldUserId);

    if (deleteError) {
      console.error('❌ Erreur suppression ancien utilisateur:', deleteError.message);
      return;
    }

    console.log('✅ Ancien utilisateur supprimé');

    // Mettre à jour l'email du nouvel utilisateur
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        email: 'citoyen@kinshasa-alerte.rdc',
        full_name: 'Citoyen Test'
      })
      .eq('id', newUserId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour email:', updateError.message);
      return;
    }

    console.log('✅ Email du nouvel utilisateur mis à jour:');
    console.log('   ID:', updatedUser.id);
    console.log('   Email:', updatedUser.email);
    console.log('   Nom:', updatedUser.full_name);

    console.log('\n✅ Fusion terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

mergeCitizenUsers(); 