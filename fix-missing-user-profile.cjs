const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMissingUserProfile() {
  console.log('🔧 Correction du profil utilisateur manquant...\n');

  try {
    // ID de l'utilisateur qui s'est connecté mais n'a pas de profil
    const missingUserId = '4a34d720-6ed1-42f3-94c8-e4a3c98945a7';
    
    console.log(`🔍 Recherche de l'utilisateur avec l'ID: ${missingUserId}`);
    
    // Vérifier s'il existe déjà dans la table users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', missingUserId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la vérification:', checkError.message);
      return;
    }

    if (existingUser) {
      console.log('✅ L\'utilisateur existe déjà dans la table users:');
      console.log('   Email:', existingUser.email);
      console.log('   Nom:', existingUser.full_name);
      console.log('   Rôle:', existingUser.role);
      return;
    }

    console.log('❌ L\'utilisateur n\'existe pas dans la table users, création...');

    // Créer le profil utilisateur manquant
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: missingUserId,
        email: 'citoyen2@kinshasa-alerte.rdc', // Utiliser un email unique
        full_name: 'Citoyen Test 2',
        role: 'citizen',
        commune_id: null,
        phone: null
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création profil:', createError.message);
      return;
    }

    console.log('✅ Profil utilisateur créé avec succès:');
    console.log('   ID:', newUser.id);
    console.log('   Email:', newUser.email);
    console.log('   Nom:', newUser.full_name);
    console.log('   Rôle:', newUser.role);

    // Nettoyer l'utilisateur avec l'email unknown@email.com
    console.log('\n🧹 Nettoyage de l\'utilisateur avec email unknown@email.com...');
    
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('email', 'unknown@email.com');

    if (deleteError) {
      console.error('❌ Erreur suppression utilisateur inconnu:', deleteError.message);
    } else {
      console.log('✅ Utilisateur avec email unknown@email.com supprimé');
    }

    console.log('\n✅ Correction terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

fixMissingUserProfile(); 