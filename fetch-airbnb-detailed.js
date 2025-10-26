const https = require('https');

const LISTING_URL = 'https://www.airbnb.com/rooms/1152820496628129007';
const ICAL_URL = 'https://www.airbnb.com/calendar/ical/1152820496628129007.ics?s=81061c8e575b0f30722c6cd91312fe98';

async function fetchAirbnbData() {
  try {
    console.log('🏠 Airbnb Villa Information\n');
    console.log('Listing ID: 1152820496628129007');
    console.log('URL: ' + LISTING_URL);
    console.log('='.repeat(60) + '\n');

    // ดึง iCal data อีกครั้ง
    console.log('📅 Fetching iCal calendar...');
    
    const icalData = await new Promise((resolve, reject) => {
      https.get(ICAL_URL, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });

    console.log('\n📄 iCal Response:');
    console.log(icalData);
    console.log('\n' + '='.repeat(60));

    // Parse events
    const hasEvents = icalData.includes('BEGIN:VEVENT');
    
    if (hasEvents) {
      console.log('\n✅ Found VEVENT entries!');
      
      // แยก events
      const events = icalData.split('BEGIN:VEVENT');
      console.log(`📊 Total events: ${events.length - 1}\n`);
      
      for (let i = 1; i < events.length; i++) {
        const eventData = events[i].split('END:VEVENT')[0];
        console.log(`\n--- Event ${i} ---`);
        console.log('BEGIN:VEVENT' + eventData + 'END:VEVENT');
        
        // Parse dates
        const dtstart = eventData.match(/DTSTART[^:]*:(\d{8})/);
        const dtend = eventData.match(/DTEND[^:]*:(\d{8})/);
        const summary = eventData.match(/SUMMARY:(.*)/);
        
        if (dtstart && dtend) {
          const startDate = dtstart[1];
          const endDate = dtend[1];
          console.log(`\n📅 Dates: ${startDate.substring(0,4)}-${startDate.substring(4,6)}-${startDate.substring(6,8)} to ${endDate.substring(0,4)}-${endDate.substring(4,6)}-${endDate.substring(6,8)}`);
        }
        
        if (summary) {
          console.log(`📝 Summary: ${summary[1]}`);
        }
      }
    } else {
      console.log('\n❌ No VEVENT entries found');
      console.log('Calendar is empty or booking data not synced yet');
    }

    console.log('\n\n💡 Note:');
    console.log('- iCal URL may take 24-48 hours to sync new bookings');
    console.log('- Manual bookings may not appear in iCal');
    console.log('- Check Airbnb calendar settings to ensure export is enabled');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fetchAirbnbData();
