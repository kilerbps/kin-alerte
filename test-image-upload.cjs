const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImageUpload() {
  console.log('🚀 Test d\'upload d\'images');
  console.log('==================================================\n');

  try {
    // 1. Vérifier les buckets existants
    console.log('📦 Test 1: Vérification des buckets de stockage');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erreur récupération buckets:', bucketsError);
    } else {
      console.log('✅ Buckets disponibles:', buckets.map(b => b.name));
      
      const reportImagesBucket = buckets.find(b => b.name === 'report-images');
      if (!reportImagesBucket) {
        console.log('⚠️  Bucket "report-images" non trouvé');
      } else {
        console.log('✅ Bucket "report-images" trouvé');
      }
    }
    console.log('');

    // 2. Créer un fichier de test
    console.log('📝 Test 2: Création d\'un fichier de test');
    const testContent = 'Test image content';
    const testFile = new File([testContent], 'test-image.txt', { type: 'text/plain' });
    console.log('✅ Fichier de test créé:', testFile.name);
    console.log('');

    // 3. Tenter l\'upload vers le bucket report-images
    console.log('📤 Test 3: Tentative d\'upload vers report-images');
    const fileName = `test/${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('report-images')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Erreur upload:', uploadError);
      console.log('Détails de l\'erreur:', {
        code: uploadError.code,
        message: uploadError.message,
        details: uploadError.details,
        hint: uploadError.hint
      });
    } else {
      console.log('✅ Upload réussi:', uploadData);
      
      // 4. Obtenir l\'URL publique
      console.log('🔗 Test 4: Récupération de l\'URL publique');
      const { data: urlData } = supabase.storage
        .from('report-images')
        .getPublicUrl(fileName);
      
      console.log('✅ URL publique:', urlData.publicUrl);
    }
    console.log('');

    // 5. Vérifier les politiques RLS du bucket
    console.log('🔐 Test 5: Vérification des politiques RLS');
    try {
      const { data: policies, error: policiesError } = await supabase
        .rpc('get_storage_policies', { bucket_name: 'report-images' });
      
      if (policiesError) {
        console.log('⚠️  Impossible de récupérer les politiques:', policiesError.message);
      } else {
        console.log('✅ Politiques RLS:', policies);
      }
    } catch (error) {
      console.log('⚠️  Fonction get_storage_policies non disponible');
    }
    console.log('');

    // 6. Lister les fichiers dans le bucket
    console.log('📋 Test 6: Liste des fichiers dans le bucket');
    const { data: files, error: filesError } = await supabase.storage
      .from('report-images')
      .list('test');
    
    if (filesError) {
      console.error('❌ Erreur liste fichiers:', filesError);
    } else {
      console.log('✅ Fichiers dans le dossier test:', files);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testImageUpload(); 