const https = require('https');
const ical = require('node-ical');

const ICAL_URL = 'https://www.airbnb.com/calendar/ical/967120570910234502.ics?s=4e40e340ff006ece04f5fe02248ebced&locale=zh';

function fetchIcal(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function checkDecemberBookings() {
  try {
    console.log('📅 Checking December 2025 Bookings\n');
    console.log('Villa: 5 Stars beachfront Villa');
    console.log('Listing ID: 967120570910234502');
    console.log('='.repeat(60) + '\n');

    const icalData = await fetchIcal(ICAL_URL);
    
    console.log('📄 Raw iCal data length:', icalData.length, 'bytes\n');
    
    // Check for events
    const hasEvents = icalData.includes('BEGIN:VEVENT');
    
    if (!hasEvents) {
      console.log('❌ No booking events found in iCal');
      console.log('\nPossible reasons:');
      console.log('  1. Calendar export is not enabled in Airbnb');
      console.log('  2. No bookings exist yet');
      console.log('  3. Bookings are manual blocks (not synced to iCal)');
      console.log('  4. iCal URL needs to be regenerated\n');
      
      console.log('📊 iCal Content:');
      console.log(icalData);
      return;
    }

    // Parse with node-ical
    const events = await ical.async.parseICS(icalData);
    const eventList = Object.values(events);
    
    console.log(`✅ Found ${eventList.length} total events\n`);
    
    // Filter December bookings
    const decemberBookings = [];
    const december2025Start = new Date('2025-12-01');
    const december2025End = new Date('2025-12-31');
    
    eventList.forEach(event => {
      if (event.type === 'VEVENT') {
        const start = new Date(event.start);
        const end = new Date(event.end);
        
        // Check if event overlaps with December 2025
        if ((start >= december2025Start && start <= december2025End) ||
            (end >= december2025Start && end <= december2025End) ||
            (start <= december2025Start && end >= december2025End)) {
          decemberBookings.push({
            start,
            end,
            summary: event.summary || 'Blocked',
            description: event.description || ''
          });
        }
      }
    });
    
    if (decemberBookings.length === 0) {
      console.log('✅ December 2025: No bookings found - All dates available!\n');
    } else {
      console.log(`📋 December 2025 Bookings: ${decemberBookings.length} booking(s)\n`);
      
      decemberBookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.summary}`);
        console.log(`   Check-in:  ${booking.start.toISOString().split('T')[0]}`);
        console.log(`   Check-out: ${booking.end.toISOString().split('T')[0]}`);
        
        const nights = Math.ceil((booking.end - booking.start) / (1000 * 60 * 60 * 24));
        console.log(`   Duration:  ${nights} night(s)`);
        
        if (booking.description) {
          console.log(`   Details:   ${booking.description.substring(0, 100)}`);
        }
        console.log();
      });
      
      // Show all blocked dates in December
      console.log('📅 All blocked dates in December 2025:');
      const blockedDates = new Set();
      
      decemberBookings.forEach(booking => {
        const current = new Date(booking.start);
        while (current < booking.end) {
          if (current.getMonth() === 11) { // December
            blockedDates.add(current.toISOString().split('T')[0]);
          }
          current.setDate(current.getDate() + 1);
        }
      });
      
      const sortedDates = Array.from(blockedDates).sort();
      sortedDates.forEach(date => {
        const d = new Date(date);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        console.log(`   ❌ ${date} (${dayName})`);
      });
      
      console.log(`\n📊 Summary: ${sortedDates.length} days blocked out of 31 days in December`);
      console.log(`   Available: ${31 - sortedDates.length} days`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDecemberBookings();
