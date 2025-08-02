const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDashboardImages() {
  console.log('🚀 Debug de l\'affichage des images dans les dashboards');
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
    console.log('');

    // 2. Récupérer un signalement avec image
    console.log('📋 Test 2: Récupération d\'un signalement avec image');
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select(`
        *,
        commune:communes(name),
        problem_type:problem_types(name),
        images:report_images(*)
      `)
      .not('images', 'is', null)
      .limit(1);

    if (reportsError) {
      console.error('❌ Erreur récupération:', reportsError);
      return;
    }

    if (!reports || reports.length === 0) {
      console.log('❌ Aucun signalement avec image trouvé');
      return;
    }

    const report = reports[0];
    console.log('✅ Signalement avec image trouvé:');
    console.log(`   ID: ${report.id}`);
    console.log(`   Description: ${report.description}`);
    console.log(`   Statut: ${report.status}`);
    console.log('');

    // 3. Analyser la structure des données
    console.log('🔍 Test 3: Analyse de la structure des données');
    console.log('Structure complète du signalement:');
    console.log(JSON.stringify(report, null, 2));
    console.log('');

    // 4. Vérifier la structure des images
    console.log('🖼️ Test 4: Structure des images');
    if (report.images && Array.isArray(report.images)) {
      console.log(`   Nombre d'images: ${report.images.length}`);
      report.images.forEach((image, index) => {
        console.log(`   Image ${index + 1}:`);
        console.log(`     ID: ${image.id}`);
        console.log(`     Report ID: ${image.report_id}`);
        console.log(`     URL: ${image.image_url}`);
        console.log(`     Created at: ${image.created_at}`);
        console.log('');
      });
    } else {
      console.log('   ❌ Images n\'est pas un tableau ou est null');
      console.log(`   Type d'images: ${typeof report.images}`);
      console.log(`   Valeur d'images: ${JSON.stringify(report.images)}`);
    }
    console.log('');

    // 5. Test de récupération avec la même requête que useReports
    console.log('🔄 Test 5: Test avec la requête de useReports');
    const { data: reportsWithDetails, error: detailsError } = await supabase
      .from('reports')
      .select(`
        *,
        problem_type:problem_types(name, description),
        commune:communes(name),
        user:users(full_name, email),
        images:report_images(*),
        _count:report_images(count)
      `)
      .eq('id', report.id)
      .single();

    if (detailsError) {
      console.error('❌ Erreur récupération avec détails:', detailsError);
    } else {
      console.log('✅ Récupération avec détails réussie');
      console.log(`   Images: ${reportsWithDetails.images ? reportsWithDetails.images.length : 0}`);
      console.log(`   _count: ${reportsWithDetails._count ? reportsWithDetails._count.images : 'N/A'}`);
      if (reportsWithDetails.images && reportsWithDetails.images.length > 0) {
        console.log('   URLs des images:');
        reportsWithDetails.images.forEach((img, idx) => {
          console.log(`     ${idx + 1}. ${img.image_url}`);
        });
      }
    }
    console.log('');

    // 6. Test d'accès à l'image via navigateur
    console.log('🌐 Test 6: Test d\'accès à l\'image');
    if (report.images && report.images.length > 0) {
      const imageUrl = report.images[0].image_url;
      console.log(`   URL à tester: ${imageUrl}`);
      console.log('   Ouvrez cette URL dans votre navigateur pour vérifier l\'accès');
      
      // Test avec curl
      const { exec } = require('child_process');
      exec(`curl -s -o /dev/null -w "%{http_code}" "${imageUrl}"`, (error, stdout, stderr) => {
        if (error) {
          console.log(`   ❌ Erreur curl: ${error.message}`);
        } else {
          console.log(`   ✅ Code de réponse HTTP: ${stdout}`);
        }
      });
    }
    console.log('');

    // 7. Déconnexion
    console.log('🚪 Test 7: Déconnexion');
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

debugDashboardImages(); 