const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEmailInconsistency() {
  console.log('🔧 Correction de l\'incohérence d\'email...\n');

  try {
    const userId = '4a34d720-6ed1-42f3-94c8-e4a3c98945a7';
    
    console.log(`🔍 Recherche de l'utilisateur existant avec l'email citoyen@kinshasa-alerte.rdc...`);
    
    // Trouver l'utilisateur existant avec cet email
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'citoyen@kinshasa-alerte.rdc')
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.error('❌ Erreur recherche utilisateur existant:', findError.message);
      return;
    }

    if (existingUser) {
      console.log(`🔍 Utilisateur existant trouvé avec l'ID: ${existingUser.id}`);
      
      // Vérifier s'il a des signalements
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('id')
        .eq('user_id', existingUser.id);

      if (reportsError) {
        console.error('❌ Erreur vérification signalements:', reportsError.message);
        return;
      }

      if (reports && reports.length > 0) {
        console.log(`⚠️  L'utilisateur a ${reports.length} signalements, transfert vers le nouvel utilisateur...`);
        
        // Transférer les signalements vers le nouvel utilisateur
        const { error: transferError } = await supabase
          .from('reports')
          .update({ user_id: userId })
          .eq('user_id', existingUser.id);

        if (transferError) {
          console.error('❌ Erreur transfert signalements:', transferError.message);
          return;
        }

        console.log('✅ Signalements transférés avec succès');
      }

      // Supprimer l'ancien utilisateur
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', existingUser.id);

      if (deleteError) {
        console.error('❌ Erreur suppression ancien utilisateur:', deleteError.message);
        return;
      }

      console.log('✅ Ancien utilisateur supprimé');
    }
    
    console.log(`🔍 Mise à jour de l'email pour l'utilisateur: ${userId}`);
    
    // Mettre à jour l'email pour qu'il corresponde à l'email de connexion
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        email: 'citoyen@kinshasa-alerte.rdc',
        full_name: 'Citoyen Test'
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

    console.log('\n✅ Correction terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

fixEmailInconsistency(); 