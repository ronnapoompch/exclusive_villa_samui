/**
 * Export Villa Data from Local Database
 * 
 * This script exports villa data to JSON for importing to Supabase
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Use LOCAL database
process.env.DATABASE_URL = 'postgresql://postgres:12345678@localhost:5432/exclusive_villa_samui_db?schema=public';

const prisma = new PrismaClient();

async function exportData() {
  console.log('📦 Exporting data from local database...\n');
  
  try {
    // Export villas
    const villas = await prisma.villa.findMany({
      include: {
        villaImages: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    console.log(`✅ Found ${villas.length} villas`);
    console.log(`✅ Found ${villas.reduce((sum, v) => sum + v.villaImages.length, 0)} images total\n`);
    
    // Write to file
    fs.writeFileSync(
      'export-villa-data.json',
      JSON.stringify({ villas }, null, 2)
    );
    
    console.log('✅ Data exported to: export-villa-data.json');
    console.log(`📊 File size: ${(fs.statSync('export-villa-data.json').size / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('\n❌ Export failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
