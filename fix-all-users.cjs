const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAllUsers() {
  console.log('🔧 Correction de tous les utilisateurs...\n');

  try {
    // 1. Lister tous les utilisateurs auth
    console.log('🔍 Récupération des utilisateurs auth...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erreur récupération utilisateurs auth:', authError.message);
      return;
    }

    console.log(`📋 ${authUsers.users.length} utilisateurs auth trouvés`);

    // 2. Lister tous les utilisateurs dans la table users
    console.log('\n🔍 Récupération des utilisateurs de la table users...');
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*');

    if (dbError) {
      console.error('❌ Erreur récupération utilisateurs DB:', dbError.message);
      return;
    }

    console.log(`📋 ${dbUsers.length} utilisateurs dans la table users`);

    // 3. Créer un mapping des IDs existants
    const existingUserIds = new Set(dbUsers.map(user => user.id));
    const existingEmails = new Set(dbUsers.map(user => user.email));

    console.log('\n🔍 Vérification et création des profils manquants...');

    let createdCount = 0;
    let updatedCount = 0;

    for (const authUser of authUsers.users) {
      console.log(`\n👤 Traitement de ${authUser.email} (${authUser.id})`);
      
      if (!existingUserIds.has(authUser.id)) {
        console.log('  ➕ Création du profil manquant...');
        
        // Vérifier si l'email existe déjà
        if (existingEmails.has(authUser.email)) {
          console.log(`  ⚠️  Email ${authUser.email} existe déjà, utilisation d'un email unique`);
          const uniqueEmail = `${authUser.email.split('@')[0]}_${Date.now()}@${authUser.email.split('@')[1]}`;
          
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: uniqueEmail,
              full_name: authUser.user_metadata?.full_name || 'Utilisateur',
              role: 'citizen',
              commune_id: authUser.user_metadata?.commune_id || null,
              phone: authUser.user_metadata?.phone || null
            })
            .select()
            .single();

          if (createError) {
            console.error(`  ❌ Erreur création: ${createError.message}`);
          } else {
            console.log(`  ✅ Profil créé avec email: ${uniqueEmail}`);
            createdCount++;
          }
        } else {
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || 'Utilisateur',
              role: 'citizen',
              commune_id: authUser.user_metadata?.commune_id || null,
              phone: authUser.user_metadata?.phone || null
            })
            .select()
            .single();

          if (createError) {
            console.error(`  ❌ Erreur création: ${createError.message}`);
          } else {
            console.log(`  ✅ Profil créé avec email: ${authUser.email}`);
            createdCount++;
          }
        }
      } else {
        console.log('  ✅ Profil existe déjà');
        
        // Vérifier si l'email correspond
        const dbUser = dbUsers.find(u => u.id === authUser.id);
        if (dbUser && dbUser.email !== authUser.email) {
          console.log(`  🔄 Mise à jour de l'email: ${dbUser.email} → ${authUser.email}`);
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ email: authUser.email })
            .eq('id', authUser.id);

          if (updateError) {
            console.error(`  ❌ Erreur mise à jour: ${updateError.message}`);
          } else {
            console.log('  ✅ Email mis à jour');
            updatedCount++;
          }
        }
      }
    }

    console.log(`\n✅ Correction terminée !`);
    console.log(`   Profils créés: ${createdCount}`);
    console.log(`   Profils mis à jour: ${updatedCount}`);

    // 4. Nettoyer les utilisateurs orphelins
    console.log('\n🧹 Nettoyage des utilisateurs orphelins...');
    
    const authUserIds = new Set(authUsers.users.map(user => user.id));
    const orphanedUsers = dbUsers.filter(dbUser => !authUserIds.has(dbUser.id));
    
    if (orphanedUsers.length > 0) {
      console.log(`⚠️  ${orphanedUsers.length} utilisateurs orphelins trouvés:`);
      orphanedUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
      });
      
      // Ne pas supprimer automatiquement pour éviter les pertes de données
      console.log('💡 Les utilisateurs orphelins sont conservés pour éviter les pertes de données');
    } else {
      console.log('✅ Aucun utilisateur orphelin trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

fixAllUsers(); 