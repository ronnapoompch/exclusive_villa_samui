// Fix bedroom/bathroom/guests data in existing database
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();
const EXCEL_PATH = path.join(__dirname, 'data', 'New EXVLSM Price Listing.xlsx');

async function fixVillaData() {
  try {
    console.log('📖 Reading Excel file...\n');
    
    const workbook = XLSX.readFile(EXCEL_PATH);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });
    
    console.log(`✅ Found ${data.length} rows in Excel\n`);
    console.log('🔍 Matching with database villas...\n');
    
    const allVillas = await prisma.villa.findMany();
    console.log(`📊 Found ${allVillas.length} villas in database\n`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const row of data) {
      const excelName = (row['NEW NAME (IN CASE CAN USE)'] || row['VILLAS REAL NAME'] || '').trim();
      const codeId = row['CODE ID.'];
      
      if (!excelName) continue;
      
      // Find villa in database by name or codeId
      const villa = allVillas.find(v => 
        v.name === excelName || 
        v.slug === createSlug(excelName) ||
        v.id === codeId
      );
      
      if (!villa) {
        skipped++;
        continue;
      }
      
      // Parse bedrooms correctly
      const bedroomsRaw = String(row['Bedroom'] || '0').trim();
      let bedrooms = 0;
      
      if (bedroomsRaw.includes('-')) {
        const parts = bedroomsRaw.split('-').map(p => parseInt(p.trim()));
        bedrooms = Math.max(...parts.filter(n => !isNaN(n)));
      } else {
        bedrooms = parseInt(bedroomsRaw) || 0;
      }
      
      // Validate
      if (bedrooms > 50 || bedrooms < 0) {
        console.log(`⚠️  ${villa.name}: Invalid bedrooms "${bedroomsRaw}" - keeping existing: ${villa.bedrooms}`);
        continue;
      }
      
      // Parse PAX (guests)
      let guests = bedrooms * 2;
      const paxRaw = String(row['PAX'] || '').trim();
      if (paxRaw) {
        const paxMatch = paxRaw.match(/(\d+)(?:-(\d+))?/);
        if (paxMatch) {
          guests = parseInt(paxMatch[2] || paxMatch[1]);
        }
      }
      
      // Calculate bathrooms
      const bathrooms = Math.max(1, bedrooms - 1);
      
      // Check if update needed
      if (villa.bedrooms === bedrooms && villa.bathrooms === bathrooms && villa.maxGuests === guests) {
        skipped++;
        continue;
      }
      
      // Update villa
      try {
        await prisma.villa.update({
          where: { id: villa.id },
          data: {
            bedrooms,
            bathrooms,
            maxGuests: guests
          }
        });
        
        console.log(`✅ ${villa.name}:`);
        console.log(`   Bedrooms: ${villa.bedrooms} → ${bedrooms} (raw: "${bedroomsRaw}")`);
        console.log(`   Bathrooms: ${villa.bathrooms} → ${bathrooms}`);
        console.log(`   Guests: ${villa.maxGuests} → ${guests}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating ${villa.name}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   ✅ Updated: ${updated} villas`);
    console.log(`   ⏭️  Skipped: ${skipped} villas (no changes or not found)`);
    console.log(`   ❌ Errors: ${errors} villas`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function createSlug(villaName) {
  return villaName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

fixVillaData();
