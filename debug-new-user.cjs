const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugNewUser() {
  console.log('🔍 Diagnostic du nouvel utilisateur...\n');

  try {
    const newUserId = 'b77d09ee-3595-4e89-9f79-a496ffaa59fb';
    
    console.log(`🔍 Recherche de l'utilisateur avec l'ID: ${newUserId}`);
    
    // Vérifier s'il existe dans la table users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', newUserId)
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

    console.log('❌ L\'utilisateur n\'existe pas dans la table users');

    // Vérifier l'email utilisé pour la connexion
    console.log('\n🔍 Tentative de connexion pour récupérer les informations...');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'kilemma633@gmail.com',
      password: 'password123' // Mot de passe temporaire
    });

    if (authError) {
      console.error('❌ Erreur de connexion:', authError.message);
      console.log('\n💡 Création manuelle du profil utilisateur...');
      
      // Créer le profil manuellement
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: newUserId,
          email: 'kilemma633@gmail.com',
          full_name: 'Nouvel Utilisateur',
          role: 'citizen',
          commune_id: null,
          phone: null
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erreur création profil:', createError.message);
        
        // Vérifier s'il y a un conflit d'email
        if (createError.code === '23505') {
          console.log('\n🔍 Vérification des conflits d\'email...');
          
          const { data: emailConflict, error: emailError } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'kilemma633@gmail.com');

          if (!emailError && emailConflict.length > 0) {
            console.log('⚠️  Conflit d\'email détecté:');
            emailConflict.forEach((user, index) => {
              console.log(`   ${index + 1}. ID: ${user.id}, Nom: ${user.full_name}, Rôle: ${user.role}`);
            });
          }
        }
        return;
      }

      console.log('✅ Profil utilisateur créé avec succès:');
      console.log('   ID:', newUser.id);
      console.log('   Email:', newUser.email);
      console.log('   Nom:', newUser.full_name);
      console.log('   Rôle:', newUser.role);
    } else {
      console.log('✅ Connexion réussie');
      console.log('   ID:', authData.user.id);
      console.log('   Email:', authData.user.email);
      
      // Créer le profil avec les vraies informations
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: authData.user.user_metadata?.full_name || 'Nouvel Utilisateur',
          role: 'citizen',
          commune_id: authData.user.user_metadata?.commune_id || null,
          phone: authData.user.user_metadata?.phone || null
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
    }

    console.log('\n✅ Diagnostic terminé !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

debugNewUser(); 