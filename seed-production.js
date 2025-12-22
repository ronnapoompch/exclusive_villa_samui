// Seed production database via API endpoint
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function seedProduction() {
  try {
    console.log('🌱 Seeding production database via API...\n');

    // Read export data
    if (!fs.existsSync('export-villa-data.json')) {
      console.error('❌ export-villa-data.json not found!');
      console.log('   Run: node export-for-production.js first');
      return;
    }

    const exportData = JSON.parse(fs.readFileSync('export-villa-data.json', 'utf8'));
    console.log(`📊 Loaded ${exportData.totalVillas} villas\n`);

    // Get production URL and seed secret
    const productionUrl = process.argv[2] || 'https://exclusive-villa-samui-ronnapoompch-4504-ronnapooms-projects.vercel.app';
    const seedSecret = process.env.SEED_SECRET || 'change-this-secret-in-production';

    console.log(`🎯 Target: ${productionUrl}`);
    console.log(`🔑 Using seed secret from .env.local\n`);

    // Call seed API
    console.log('📤 Sending data to production...');
    
    const response = await fetch(`${productionUrl}/api/seed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${seedSecret}`
      },
      body: JSON.stringify({
        villas: exportData.villas
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('\n❌ Seed failed!');
      console.error('Error:', result.error || result.message);
      return;
    }

    console.log('\n✅ Seed successful!');
    console.log(`   Imported: ${result.data.imported} villas`);
    console.log(`   Failed: ${result.data.failed} villas`);
    console.log(`   Total: ${result.data.total} villas`);

    console.log('\n🔗 Check your site at:');
    console.log(`   ${productionUrl}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

// Usage:
// node seed-production.js [production-url]
// Example: node seed-production.js https://your-site.vercel.app

seedProduction();
