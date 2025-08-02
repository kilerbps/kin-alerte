const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminUpdateReports() {
  console.log('🚀 Test de mise à jour des signalements par admin');
  console.log('==================================================\n');

  try {
    // 1. Connexion admin
    console.log('👤 Test 1: Connexion admin');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@kinshasa-alerte.rdc',
      password: 'admin123456'
    });

    if (authError) {
      console.error('❌ Erreur connexion:', authError);
      return;
    }

    console.log('✅ Connexion admin réussie');
    console.log('User ID:', authData.user.id);
    console.log('');

    // 2. Récupérer un signalement en attente
    console.log('📋 Test 2: Récupération d\'un signalement en attente');
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .eq('status', 'pending')
      .limit(1);

    if (reportsError) {
      console.error('❌ Erreur récupération signalements:', reportsError);
      return;
    }

    if (!reports || reports.length === 0) {
      console.log('⚠️  Aucun signalement en attente trouvé');
      return;
    }

    const report = reports[0];
    console.log('✅ Signalement trouvé:', {
      id: report.id,
      title: report.title,
      status: report.status
    });
    console.log('');

    // 3. Tenter de mettre à jour le statut vers 'in_progress'
    console.log('🔄 Test 3: Mise à jour statut vers "in_progress"');
    const { data: updateData, error: updateError } = await supabase
      .from('reports')
      .update({ 
        status: 'in-progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', report.id)
      .select();

    if (updateError) {
      console.error('❌ Erreur mise à jour:', updateError);
      console.log('Détails de l\'erreur:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
    } else {
      console.log('✅ Mise à jour réussie');
      console.log('Nouveau statut:', updateData[0].status);
    }
    console.log('');

    // 4. Vérifier le rôle de l'utilisateur connecté
    console.log('👤 Test 4: Vérification du rôle utilisateur');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('❌ Erreur récupération rôle:', userError);
    } else {
      console.log('✅ Rôle utilisateur:', userData.role);
    }
    console.log('');

    // 5. Déconnexion
    console.log('🚪 Test 5: Déconnexion');
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('❌ Erreur déconnexion:', signOutError);
    } else {
      console.log('✅ Déconnexion réussie');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testAdminUpdateReports(); 