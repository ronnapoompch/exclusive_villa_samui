const https = require('https');

// iCal URL ล่าสุดที่ user ส่งมา
const ICAL_URL = 'https://www.airbnb.com/calendar/ical/1152820496628129007.ics?s=81061c8e575b0f30722c6cd91312fe98&locale=en';

function fetchIcal(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function extractPricing() {
  try {
    console.log('🔍 Fetching Airbnb iCal data...\n');
    
    const icalData = await fetchIcal(ICAL_URL);
    
    console.log('📄 Raw iCal Data:');
    console.log('='.repeat(60));
    console.log(icalData);
    console.log('='.repeat(60));
    
    // แยกเป็น events
    const events = icalData.split('BEGIN:VEVENT');
    
    console.log(`\n📊 Found ${events.length - 1} events\n`);
    
    events.forEach((event, index) => {
      if (index === 0) return; // Skip header
      
      console.log(`\n--- Event ${index} ---`);
      
      // Extract key information
      const lines = event.split('\n');
      const eventData = {};
      
      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          eventData[key.trim()] = value;
        }
      });
      
      console.log('Summary:', eventData.SUMMARY);
      console.log('Start:', eventData.DTSTART);
      console.log('End:', eventData.DTEND);
      console.log('Description:', eventData.DESCRIPTION);
      
      // Look for pricing information
      const descLines = (eventData.DESCRIPTION || '').split('\\n');
      descLines.forEach(line => {
        if (line.toLowerCase().includes('price') || 
            line.toLowerCase().includes('rate') ||
            line.includes('$') ||
            line.includes('THB') ||
            line.includes('฿')) {
          console.log('💰 Pricing info:', line);
        }
      });
      
      // Show all fields for first event to see what's available
      if (index === 1) {
        console.log('\n📋 All available fields:');
        Object.keys(eventData).forEach(key => {
          console.log(`   ${key}: ${eventData[key].substring(0, 100)}`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

extractPricing();
