require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Priority villas from Excel analysis
const priorityVillas = [
  { realName: '5 House (5BR)', websiteName: '5 Stars beachfront Villa' },
  { realName: 'Ariya Residence A3 (5BR)', websiteName: 'Alicia Serenity A3' },
  { realName: 'Anzhu Seamate (3BR)', websiteName: 'Anzhu Serenity' },
  { realName: 'La Moon (4BR)', websiteName: 'La Mirage' },
  { realName: 'Kerem Villa Gamay (Upper)', websiteName: 'Kieren Villa Grace' },
  { realName: 'The Wave 1 - Deluxe Sea View 3BR', websiteName: 'The Wavora 1 - Deluxe Sea View 3BR' },
  { realName: 'Miskawaan Residence Villa Sila', websiteName: 'Millennial Residence Villa Solara' },
  { realName: 'Tish: Clay Hut (2BR)', websiteName: 'The Clay Haven' },
  { realName: 'Zog Villas A1 Banana Fan (2BR)', websiteName: 'Zulu Vista A1' }
];

async function checkPriorityVillas() {
  try {
    console.log('🔍 Checking Priority Villas in Database\n');
    console.log('=' .repeat(80));
    
    let found = [];
    let notFound = [];
    
    for (const villa of priorityVillas) {
      // Search by website name
      const result = await prisma.villa.findFirst({
        where: {
          name: {
            contains: villa.websiteName,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          slug: true,
          name: true,
          bedrooms: true,
          location: true,
          airbnbUrl: true,
          agodaUrl: true,
          officialWebsite: true
        }
      });
      
      if (result) {
        found.push({
          realName: villa.realName,
          websiteName: villa.websiteName,
          database: result
        });
      } else {
        // Try searching by partial match
        const partial = await prisma.villa.findFirst({
          where: {
            OR: [
              { name: { contains: villa.websiteName.split(' ')[0], mode: 'insensitive' } },
              { name: { contains: villa.realName.split(' ')[0], mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            slug: true,
            name: true,
            bedrooms: true,
            location: true
          }
        });
        
        if (partial) {
          found.push({
            realName: villa.realName,
            websiteName: villa.websiteName,
            database: partial,
            partialMatch: true
          });
        } else {
          notFound.push(villa);
        }
      }
    }
    
    console.log(`\n✅ FOUND IN DATABASE (${found.length}/${priorityVillas.length}):\n`);
    
    found.forEach((v, i) => {
      console.log(`${i + 1}. ${v.websiteName}`);
      console.log(`   Excel Real Name: "${v.realName}"`);
      console.log(`   Database Name: "${v.database.name}"`);
      console.log(`   Slug: ${v.database.slug}`);
      console.log(`   ID: ${v.database.id}`);
      console.log(`   Bedrooms: ${v.database.bedrooms}`);
      console.log(`   Location: ${v.database.location}`);
      if (v.database.airbnbUrl) {
        console.log(`   ✅ Has Airbnb URL`);
      }
      if (v.database.bookingUrl) {
        console.log(`   ✅ Has Booking.com URL`);
      }
      if (v.partialMatch) {
        console.log(`   ⚠️  PARTIAL MATCH - Please verify`);
      }
      console.log('');
    });
    
    if (notFound.length > 0) {
      console.log(`\n❌ NOT FOUND IN DATABASE (${notFound.length}):\n`);
      notFound.forEach((v, i) => {
        console.log(`${i + 1}. Excel Name: "${v.websiteName}"`);
        console.log(`   Real Name: "${v.realName}"`);
        console.log('');
      });
    }
    
    console.log('=' .repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   Total Priority Villas: ${priorityVillas.length}`);
    console.log(`   ✅ Found: ${found.length}`);
    console.log(`   ❌ Not Found: ${notFound.length}`);
    console.log(`   ⚠️  Partial Matches: ${found.filter(v => v.partialMatch).length}`);
    
    // Generate configuration
    console.log('\n\n🔧 Priority Villa Configuration:\n');
    console.log('const PRIORITY_VILLAS = [');
    found.forEach(v => {
      console.log(`  {`);
      console.log(`    slug: '${v.database.slug}',`);
      console.log(`    websiteName: '${v.websiteName}',`);
      console.log(`    realName: '${v.realName}',`);
      console.log(`    id: '${v.database.id}',`);
      console.log(`    hasAirbnb: ${!!v.database.airbnbUrl},`);
      console.log(`    hasBooking: ${!!v.database.bookingUrl}`);
      console.log(`  },`);
    });
    console.log('];');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPriorityVillas();
