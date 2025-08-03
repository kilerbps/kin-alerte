const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUsersTable() {
  console.log('🔍 Débogage de la table users...\n');

  try {
    // Lister tous les utilisateurs
    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error('❌ Erreur récupération users:', error.message);
      return;
    }

    console.log(`📋 ${users.length} utilisateurs trouvés dans la table users:`);
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nom: ${user.full_name}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Téléphone: ${user.phone || 'Non renseigné'}`);
      console.log(`   Commune ID: ${user.commune_id || 'Non renseigné'}`);
    });

    // Vérifier l'utilisateur citoyen spécifique
    console.log('\n🔍 Recherche spécifique de l\'utilisateur citoyen...');
    const { data: citizenUser, error: citizenError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'citoyen@kinshasa-alerte.rdc');

    if (citizenError) {
      console.error('❌ Erreur recherche citoyen:', citizenError.message);
    } else {
      console.log(`📋 ${citizenUser.length} entrées trouvées pour citoyen@kinshasa-alerte.rdc:`);
      citizenUser.forEach((user, index) => {
        console.log(`\n${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nom: ${user.full_name}`);
        console.log(`   Rôle: ${user.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

debugUsersTable(); 