const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateRedirectUrls() {
  console.log('🔧 Mise à jour des URLs de redirection Supabase...');
  
  try {
    // URL de production
    const productionUrl = 'https://kinshasa-alerte.vercel.app';
    
    // URLs de redirection à configurer
    const redirectUrls = [
      `${productionUrl}/auth`,
      `${productionUrl}/auth?reset=true`,
      `${productionUrl}/auth?confirm=true`,
      `${productionUrl}/dashboard`,
      `${productionUrl}/`
    ];
    
    console.log('📋 URLs de redirection à configurer :');
    redirectUrls.forEach(url => console.log(`  - ${url}`));
    
    console.log('\n📝 Instructions manuelles :');
    console.log('1. Allez dans votre dashboard Supabase');
    console.log('2. Authentication > URL Configuration');
    console.log('3. Site URL: ' + productionUrl);
    console.log('4. Redirect URLs:');
    redirectUrls.forEach(url => console.log(`   - ${url}`));
    console.log('5. Sauvegardez les modifications');
    
    console.log('\n📧 Configuration des templates d\'email :');
    console.log('1. Authentication > Email Templates');
    console.log('2. Confirmation d\'email :');
    console.log(`   - URL de redirection : ${productionUrl}/auth?confirm=true`);
    console.log('3. Réinitialisation de mot de passe :');
    console.log(`   - URL de redirection : ${productionUrl}/auth?reset=true`);
    
    console.log('\n✅ Configuration terminée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error);
  }
}

// Exécuter le script
updateRedirectUrls(); 