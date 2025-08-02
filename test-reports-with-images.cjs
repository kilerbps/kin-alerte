const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReportsWithImages() {
  console.log('🚀 Test de récupération des signalements avec images');
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

    // 2. Récupérer tous les signalements avec leurs images
    console.log('📋 Test 2: Récupération des signalements avec images');
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select(`
        *,
        commune:communes(name),
        problem_type:problem_types(name),
        images:report_images(*)
      `)
      .order('created_at', { ascending: false });

    if (reportsError) {
      console.error('❌ Erreur récupération signalements:', reportsError);
      return;
    }

    console.log(`✅ ${reports.length} signalements récupérés`);
    console.log('');

    // 3. Analyser chaque signalement
    console.log('🔍 Test 3: Analyse des signalements et images');
    reports.forEach((report, index) => {
      console.log(`\n📄 Signalement ${index + 1}:`);
      console.log(`   ID: ${report.id}`);
      console.log(`   Description: ${report.description?.substring(0, 50)}...`);
      console.log(`   Statut: ${report.status}`);
      console.log(`   Images: ${report.images ? report.images.length : 0}`);
      
      if (report.images && report.images.length > 0) {
        console.log('   URLs des images:');
        report.images.forEach((image, imgIndex) => {
          console.log(`     ${imgIndex + 1}. ${image.image_url}`);
        });
      } else {
        console.log('   ❌ Aucune image associée');
      }
    });
    console.log('');

    // 4. Vérifier la table report_images directement
    console.log('📊 Test 4: Vérification directe de la table report_images');
    const { data: images, error: imagesError } = await supabase
      .from('report_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (imagesError) {
      console.error('❌ Erreur récupération images:', imagesError);
    } else {
      console.log(`✅ ${images.length} entrées dans report_images`);
      if (images.length > 0) {
        console.log('   Dernières images:');
        images.slice(0, 5).forEach((image, index) => {
          console.log(`   ${index + 1}. Report ID: ${image.report_id}, URL: ${image.image_url}`);
        });
      }
    }
    console.log('');

    // 5. Test de récupération d'un signalement spécifique
    if (reports.length > 0) {
      const testReport = reports[0];
      console.log('🧪 Test 5: Test de récupération d\'un signalement spécifique');
      console.log(`   Test avec le signalement: ${testReport.id}`);
      
      const { data: singleReport, error: singleError } = await supabase
        .from('reports')
        .select(`
          *,
          commune:communes(name),
          problem_type:problem_types(name),
          images:report_images(*)
        `)
        .eq('id', testReport.id)
        .single();

      if (singleError) {
        console.error('❌ Erreur récupération signalement unique:', singleError);
      } else {
        console.log('✅ Signalement unique récupéré avec succès');
        console.log(`   Images: ${singleReport.images ? singleReport.images.length : 0}`);
        if (singleReport.images && singleReport.images.length > 0) {
          console.log('   URLs:');
          singleReport.images.forEach((img, idx) => {
            console.log(`     ${idx + 1}. ${img.image_url}`);
          });
        }
      }
    }
    console.log('');

    // 6. Déconnexion
    console.log('🚪 Test 6: Déconnexion');
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

testReportsWithImages(); 