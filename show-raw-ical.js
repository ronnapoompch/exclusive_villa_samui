const https = require('https');

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

async function showRawData() {
  try {
    console.log('📄 Fetching RAW iCal Data...\n');
    
    const icalData = await fetchIcal(ICAL_URL);
    
    console.log('='.repeat(80));
    console.log('RAW iCAL CONTENT:');
    console.log('='.repeat(80));
    console.log(icalData);
    console.log('='.repeat(80));
    
    // แยก events manually
    const events = icalData.split('BEGIN:VEVENT');
    console.log(`\n📊 Found ${events.length - 1} VEVENT(s)\n`);
    
    if (events.length > 1) {
      for (let i = 1; i < events.length; i++) {
        console.log(`\n--- VEVENT #${i} ---`);
        console.log('BEGIN:VEVENT' + events[i].split('END:VEVENT')[0] + 'END:VEVENT');
        console.log('---\n');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

showRawData();
