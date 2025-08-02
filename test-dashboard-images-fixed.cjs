const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardImagesFixed() {
  console.log('🚀 Test des images dans les dashboards (CORRIGÉ)');
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

    // 2. Test de la requête AdminDashboard (corrigée)
    console.log('📋 Test 2: Requête AdminDashboard (corrigée)');
    const { data: adminReports, error: adminError } = await supabase
      .from('reports')
      .select(`
        *,
        commune:communes(name),
        problem_type:problem_types(name),
        images:report_images(*)
      `)
      .order('created_at', { ascending: false });

    if (adminError) {
      console.error('❌ Erreur requête AdminDashboard:', adminError);
    } else {
      console.log(`✅ ${adminReports.length} signalements récupérés pour AdminDashboard`);
      
      const reportsWithImages = adminReports.filter(r => r.images && r.images.length > 0);
      console.log(`   Signalements avec images: ${reportsWithImages.length}`);
      
      if (reportsWithImages.length > 0) {
        console.log('   Exemple de signalement avec image:');
        const example = reportsWithImages[0];
        console.log(`     ID: ${example.id}`);
        console.log(`     Description: ${example.description?.substring(0, 50)}...`);
        console.log(`     Images: ${example.images.length}`);
        example.images.forEach((img, idx) => {
          console.log(`       ${idx + 1}. ${img.image_url}`);
        });
      }
    }
    console.log('');

    // 3. Test de la requête BourgmestreDashboard (corrigée)
    console.log('🏛️ Test 3: Requête BourgmestreDashboard (corrigée)');
    const { data: bourgmestreReports, error: bourgmestreError } = await supabase
      .from('reports')
      .select(`
        *,
        commune:communes(name),
        problem_type:problem_types(name),
        images:report_images(*)
      `)
      .eq('commune_id', 'd2a8408a-9587-45cb-8b25-060e147c250d') // Kinshasa
      .order('created_at', { ascending: false });

    if (bourgmestreError) {
      console.error('❌ Erreur requête BourgmestreDashboard:', bourgmestreError);
    } else {
      console.log(`✅ ${bourgmestreReports.length} signalements récupérés pour BourgmestreDashboard`);
      
      const reportsWithImages = bourgmestreReports.filter(r => r.images && r.images.length > 0);
      console.log(`   Signalements avec images: ${reportsWithImages.length}`);
    }
    console.log('');

    // 4. Test de la requête CitizenDashboard (corrigée)
    console.log('👤 Test 4: Requête CitizenDashboard (corrigée)');
    const { data: citizenReports, error: citizenError } = await supabase
      .from('reports')
      .select(`
        *,
        commune:communes(name),
        problem_type:problem_types(name),
        images:report_images(*)
      `)
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false });

    if (citizenError) {
      console.error('❌ Erreur requête CitizenDashboard:', citizenError);
    } else {
      console.log(`✅ ${citizenReports.length} signalements récupérés pour CitizenDashboard`);
      
      const reportsWithImages = citizenReports.filter(r => r.images && r.images.length > 0);
      console.log(`   Signalements avec images: ${reportsWithImages.length}`);
    }
    console.log('');

    // 5. Vérification de l'affichage des images
    console.log('🖼️ Test 5: Vérification de l\'affichage des images');
    const allReports = adminReports || [];
    const reportsWithImages = allReports.filter(r => r.images && r.images.length > 0);
    
    if (reportsWithImages.length > 0) {
      console.log('✅ Images trouvées dans les signalements');
      console.log('   Les images devraient maintenant s\'afficher dans les dashboards');
      
      reportsWithImages.forEach((report, index) => {
        console.log(`\n   Signalement ${index + 1}:`);
        console.log(`     ID: ${report.id}`);
        console.log(`     Description: ${report.description?.substring(0, 50)}...`);
        console.log(`     Images: ${report.images.length}`);
        report.images.forEach((img, imgIdx) => {
          console.log(`       ${imgIdx + 1}. ${img.image_url}`);
        });
      });
    } else {
      console.log('⚠️  Aucun signalement avec image trouvé');
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

    console.log('\n🎉 Test terminé !');
    console.log('📝 Instructions:');
    console.log('1. Rafraîchissez votre application');
    console.log('2. Allez dans le dashboard admin');
    console.log('3. Vous devriez maintenant voir les images des signalements');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testDashboardImagesFixed(); 