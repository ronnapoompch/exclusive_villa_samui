// Import Airbnb Calendar (iCal) for villa availability
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const ical = require('node-ical');
const https = require('https');

const prisma = new PrismaClient();

// iCal URLs configuration for villa calendar sync
const ICAL_URLS = [
  {
    villaSlug: '5-stars-beachfront-villa',
    icalUrl: 'https://www.airbnb.com/calendar/ical/967120570910234502.ics?s=4e40e340ff006ece04f5fe02248ebced&locale=zh',
    source: 'Airbnb'
  }
];

async function fetchICalData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function parseAndSyncCalendar(villaSlug, icalUrl, source) {
  console.log(`\n🔄 Syncing ${villaSlug} from ${source}...`);
  
  try {
    // Find villa
    const villa = await prisma.villa.findUnique({
      where: { slug: villaSlug }
    });
    
    if (!villa) {
      console.log(`❌ Villa not found: ${villaSlug}`);
      return;
    }
    
    console.log(`✅ Found villa: ${villa.name}`);
    
    // Fetch iCal data
    console.log(`📥 Fetching calendar from ${source}...`);
    const icalData = await fetchICalData(icalUrl);
    
    // Parse iCal
    const events = await ical.async.parseICS(icalData);
    
    const blockedDates = [];
    let eventCount = 0;
    
    for (const event of Object.values(events)) {
      if (event.type === 'VEVENT') {
        eventCount++;
        
        // Airbnb blocked dates - all VEVENT entries are bookings/blocks
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        const summary = event.summary || 'Reserved';
        
        // Add each day in the range
        let currentDate = new Date(startDate);
        while (currentDate < endDate) {
          blockedDates.push({
            villaId: villa.id,
            date: new Date(currentDate),
            reason: summary,
            source: source
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }
    
    console.log(`📅 Found ${eventCount} events, ${blockedDates.length} blocked dates`);
    
    if (blockedDates.length > 0) {
      // Delete existing blocked dates from this source
      await prisma.blockedDate.deleteMany({
        where: {
          villaId: villa.id,
          source: source
        }
      });
      
      console.log(`🗑️  Cleared old ${source} blocked dates`);
      
      // Insert new blocked dates
      await prisma.blockedDate.createMany({
        data: blockedDates,
        skipDuplicates: true
      });
      
      console.log(`✅ Synced ${blockedDates.length} blocked dates for ${villa.name}`);
      
      // Show sample dates
      const sampleDates = blockedDates.slice(0, 5).map(d => 
        d.date.toISOString().split('T')[0]
      );
      console.log(`📆 Sample blocked dates: ${sampleDates.join(', ')}...`);
    } else {
      console.log(`✅ No blocked dates found - villa is available`);
    }
    
  } catch (error) {
    console.error(`❌ Error syncing ${villaSlug}:`, error.message);
  }
}

async function syncAllCalendars() {
  console.log('🚀 Starting Airbnb calendar sync...\n');
  
  for (const config of ICAL_URLS) {
    await parseAndSyncCalendar(config.villaSlug, config.icalUrl, config.source);
  }
  
  console.log('\n✅ Calendar sync completed!');
}

// Run sync
syncAllCalendars()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
