const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Utiliser la clé service role pour la configuration

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.log('⚠️  Assurez-vous d\'avoir VITE_SUPABASE_SERVICE_ROLE_KEY dans votre .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  console.log('🚀 Configuration du stockage Supabase');
  console.log('==================================================\n');

  try {
    // 1. Créer le bucket report-images
    console.log('📦 Étape 1: Création du bucket report-images');
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('report-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket report-images existe déjà');
      } else {
        console.error('❌ Erreur création bucket:', bucketError);
        return;
      }
    } else {
      console.log('✅ Bucket report-images créé avec succès');
    }
    console.log('');

    // 2. Créer les politiques RLS pour le bucket
    console.log('🔐 Étape 2: Configuration des politiques RLS');
    
    // Politique pour permettre l'upload d'images par les utilisateurs authentifiés
    const { error: uploadPolicyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'report-images',
      policy_name: 'Allow authenticated uploads',
      policy_definition: `
        CREATE POLICY "Allow authenticated uploads" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'report-images' AND
          auth.role() = 'authenticated'
        )
      `
    });

    if (uploadPolicyError) {
      console.log('⚠️  Politique d\'upload déjà existante ou erreur:', uploadPolicyError.message);
    } else {
      console.log('✅ Politique d\'upload créée');
    }

    // Politique pour permettre la lecture publique des images
    const { error: readPolicyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'report-images',
      policy_name: 'Allow public reads',
      policy_definition: `
        CREATE POLICY "Allow public reads" ON storage.objects
        FOR SELECT USING (bucket_id = 'report-images')
      `
    });

    if (readPolicyError) {
      console.log('⚠️  Politique de lecture déjà existante ou erreur:', readPolicyError.message);
    } else {
      console.log('✅ Politique de lecture publique créée');
    }

    // Politique pour permettre la suppression par les admins
    const { error: deletePolicyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'report-images',
      policy_name: 'Allow admin deletes',
      policy_definition: `
        CREATE POLICY "Allow admin deletes" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'report-images' AND
          EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
          )
        )
      `
    });

    if (deletePolicyError) {
      console.log('⚠️  Politique de suppression déjà existante ou erreur:', deletePolicyError.message);
    } else {
      console.log('✅ Politique de suppression admin créée');
    }

    console.log('');

    // 3. Vérifier la configuration
    console.log('✅ Étape 3: Vérification de la configuration');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erreur vérification buckets:', bucketsError);
    } else {
      const reportImagesBucket = buckets.find(b => b.name === 'report-images');
      if (reportImagesBucket) {
        console.log('✅ Bucket report-images configuré:', {
          name: reportImagesBucket.name,
          public: reportImagesBucket.public,
          fileSizeLimit: reportImagesBucket.fileSizeLimit,
          allowedMimeTypes: reportImagesBucket.allowedMimeTypes
        });
      } else {
        console.log('❌ Bucket report-images non trouvé');
      }
    }
    console.log('');

    // 4. Test d'upload
    console.log('🧪 Étape 4: Test d\'upload');
    const testContent = 'Test image content';
    const testFile = new File([testContent], 'test-image.txt', { type: 'text/plain' });
    const fileName = `test/${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('report-images')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Erreur test upload:', uploadError);
    } else {
      console.log('✅ Test upload réussi:', uploadData);
      
      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('report-images')
        .getPublicUrl(fileName);
      
      console.log('✅ URL publique de test:', urlData.publicUrl);
    }

    console.log('\n🎉 Configuration du stockage terminée !');
    console.log('📝 Instructions:');
    console.log('1. Les utilisateurs authentifiés peuvent maintenant uploader des images');
    console.log('2. Les images sont accessibles publiquement');
    console.log('3. Seuls les admins peuvent supprimer les images');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

setupStorage(); 