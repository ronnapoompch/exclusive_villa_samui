require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const ical = require('node-ical');

const prisma = new PrismaClient();

/**
 * Multi-Villa Calendar Sync Script
 * Syncs Airbnb iCal feeds for all priority villas
 */

// Priority villas with their iCal URLs
// TODO: Add real Airbnb iCal URLs for each villa
const PRIORITY_VILLAS_ICAL = [
  {
    slug: '5-stars-beachfront-villa',
    name: '5 Stars beachfront Villa',
    airbnbIcalUrl: 'https://www.airbnb.com/calendar/ical/967120570910234502.ics?s=4e40e340ff006ece04f5fe02248ebced&locale=zh',
    enabled: true // Set to false to skip
  },
  {
    slug: 'alicia-serenity-a3',
    name: 'Alicia Serenity A3',
    airbnbIcalUrl: null, // TODO: Add Airbnb iCal URL
    enabled: false
  },
  {
    slug: 'anzhu-serenity',
    name: 'Anzhu Serenity',
    airbnbIcalUrl: null, // TODO: Add Airbnb iCal URL
    enabled: false
  },
  {
    slug: 'kieren-villa-mirage',
    name: 'La Mirage',
    airbnbIcalUrl: null, // TODO: Add Airbnb iCal URL
    enabled: false
  },
  {
    slug: 'kieren-villa-grace',
    name: 'Kieren Villa Grace',
    airbnbIcalUrl: null, // TODO: Add Airbnb iCal URL
    enabled: false
  },
  {
    slug: 'the-wavora-1-deluxe-sea-view-3br',
    name: 'The Wavora 1 - Deluxe Sea View 3BR',
    airbnbIcalUrl: null, // TODO: Add Airbnb iCal URL
    enabled: false
  },
  {
    slug: 'millennial-residence-villa-solara',
    name: 'Millennial Residence Villa Solara',
    airbnbIcalUrl: null, // TODO: Add Airbnb iCal URL
    enabled: false
  },
  {
    slug: 'the-clay-haven',
    name: 'The Clay Haven',
    airbnbIcalUrl: null, // TODO: Add Airbnb iCal URL
    enabled: false
  },
  {
    slug: 'zulu-vista-a1',
    name: 'Zulu Vista A1',
    airbnbIcalUrl: null, // TODO: Add Airbnb iCal URL
    enabled: false
  }
];

/**
 * Sync single villa's calendar
 */
async function syncVillaCalendar(villaConfig) {
  const { slug, name, airbnbIcalUrl } = villaConfig;
  
  try {
    console.log(`\n🔄 Syncing ${name}...`);
    
    // Find villa in database
    const villa = await prisma.villa.findUnique({
      where: { slug }
    });
    
    if (!villa) {
      console.log(`   ❌ Villa not found in database: ${slug}`);
      return { success: false, error: 'Villa not found' };
    }
    
    if (!airbnbIcalUrl) {
      console.log(`   ⚠️  No iCal URL configured`);
      return { success: false, error: 'No iCal URL' };
    }
    
    // Fetch iCal feed
    console.log(`   📥 Fetching calendar from Airbnb...`);
    const response = await fetch(airbnbIcalUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const calendarData = await response.text();
    const events = ical.parseICS(calendarData);
    
    // Parse blocked dates
    const blockedDates = [];
    const source = 'airbnb';
    let eventCount = 0;
    
    for (const event of Object.values(events)) {
      if (event.type === 'VEVENT') {
        eventCount++;
        
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        const summary = event.summary || 'Reserved';
        
        blockedDates.push({
          villaId: villa.id,
          startDate: startDate,
          endDate: endDate,
          reason: summary,
          source: source,
          externalId: event.uid || null
        });
      }
    }
    
    console.log(`   📅 Found ${eventCount} events, ${blockedDates.length} blocked periods`);
    
    if (blockedDates.length > 0) {
      // Clear old Airbnb blocked dates
      const deleted = await prisma.blockedDate.deleteMany({
        where: {
          villaId: villa.id,
          source: source
        }
      });
      
      console.log(`   🗑️  Cleared ${deleted.count} old records`);
      
      // Insert new blocked dates
      await prisma.blockedDate.createMany({
        data: blockedDates
      });
      
      console.log(`   ✅ Synced ${blockedDates.length} blocked periods`);
      
      // Show first 3 periods
      const sampleDates = blockedDates.slice(0, 3).map(d => 
        `${d.startDate.toISOString().split('T')[0]} → ${d.endDate.toISOString().split('T')[0]}`
      );
      console.log(`   📆 Sample: ${sampleDates.join(', ')}...`);
      
      return { 
        success: true, 
        events: eventCount,
        periods: blockedDates.length,
        deleted: deleted.count
      };
    } else {
      console.log(`   ℹ️  No blocked dates found`);
      return { success: true, events: 0, periods: 0 };
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Main sync function
 */
async function syncAllVillas() {
  console.log('🚀 Starting Multi-Villa Calendar Sync');
  console.log('=' .repeat(80));
  
  const startTime = Date.now();
  const results = {
    total: 0,
    enabled: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    details: []
  };
  
  // Filter enabled villas
  const enabledVillas = PRIORITY_VILLAS_ICAL.filter(v => v.enabled);
  
  results.total = PRIORITY_VILLAS_ICAL.length;
  results.enabled = enabledVillas.length;
  results.skipped = results.total - results.enabled;
  
  console.log(`\n📊 Found ${results.total} priority villas, ${results.enabled} enabled\n`);
  
  // Sync each enabled villa
  for (const villaConfig of enabledVillas) {
    const result = await syncVillaCalendar(villaConfig);
    
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
    }
    
    results.details.push({
      villa: villaConfig.name,
      slug: villaConfig.slug,
      ...result
    });
  }
  
  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '=' .repeat(80));
  console.log('\n📈 SYNC SUMMARY:\n');
  console.log(`   Total villas: ${results.total}`);
  console.log(`   ✅ Successful: ${results.success}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   ⏭️  Skipped: ${results.skipped}`);
  console.log(`   ⏱️  Duration: ${duration}s`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed villas:');
    results.details
      .filter(d => !d.success)
      .forEach(d => {
        console.log(`   - ${d.villa}: ${d.error}`);
      });
  }
  
  if (results.success > 0) {
    console.log('\n✅ Successful syncs:');
    results.details
      .filter(d => d.success)
      .forEach(d => {
        console.log(`   - ${d.villa}: ${d.periods || 0} periods from ${d.events || 0} events`);
      });
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log('\n💡 Next steps:');
  console.log('   1. Add Airbnb iCal URLs for remaining villas');
  console.log('   2. Set enabled: true for villas you want to sync');
  console.log('   3. Setup Vercel cron to run this script automatically\n');
}

// Run sync
syncAllVillas()
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
