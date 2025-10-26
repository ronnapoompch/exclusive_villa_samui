const https = require('https');
const ical = require('node-ical');

// iCal URL สำหรับ 5 Stars beachfront Villa
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

async function analyzeAvailability() {
  try {
    console.log('📅 Fetching Airbnb Calendar Data...\n');
    console.log('Villa: 5 Stars beachfront Villa');
    console.log('='.repeat(60));
    
    const icalData = await fetchIcal(ICAL_URL);
    const events = await ical.async.parseICS(icalData);
    
    const bookedDates = [];
    const eventList = Object.values(events);
    
    console.log(`\n📊 Total Events Found: ${eventList.length}\n`);
    
    if (eventList.length === 0) {
      console.log('✅ Calendar is EMPTY - All dates are AVAILABLE!');
      console.log('\n💡 This means:');
      console.log('   - No bookings from Airbnb');
      console.log('   - No blocked dates');
      console.log('   - Villa is 100% available for booking\n');
    } else {
      console.log('📋 Booked/Blocked Dates:\n');
      
      let eventCount = 0;
      eventList.forEach((event, index) => {
        // Debug: แสดงทุก event type
        console.log(`Event ${index + 1} Type: ${event.type || 'unknown'}`);
        
        if (event.type === 'VEVENT') {
          eventCount++;
          const start = new Date(event.start);
          const end = new Date(event.end);
          const summary = event.summary || 'Not available';
          const description = event.description || '';
          
          console.log(`\n${eventCount}. ${summary}`);
          console.log(`   Start: ${start.toISOString()}`);
          console.log(`   End: ${end.toISOString()}`);
          console.log(`   Start Date: ${start.toISOString().split('T')[0]}`);
          console.log(`   End Date: ${end.toISOString().split('T')[0]}`);
          
          if (description) {
            console.log(`   Description: ${description}`);
          }
          
          // นับจำนวนคืน
          const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          console.log(`   Duration: ${nights} night(s)`);
          
          // เก็บวันที่ (รวมวันสุดท้าย)
          const current = new Date(start);
          const dates = [];
          while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            bookedDates.push(dateStr);
            dates.push(dateStr);
            current.setDate(current.getDate() + 1);
          }
          console.log(`   Blocked Dates: ${dates.join(', ')}`);
          console.log();
        }
      });
      
      console.log('='.repeat(60));
      console.log(`\n📊 Summary:`);
      console.log(`   Total Bookings: ${eventList.length}`);
      console.log(`   Total Blocked Days: ${bookedDates.length}`);
    }
    
    // แสดงวันที่ว่างในเดือนนี้และเดือนหน้า
    console.log('\n📅 Availability Check (Next 60 Days):\n');
    
    const today = new Date();
    const availableDates = [];
    const bookedSet = new Set(bookedDates);
    
    for (let i = 0; i < 60; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (!bookedSet.has(dateStr)) {
        availableDates.push(dateStr);
      }
    }
    
    console.log(`✅ Available Days: ${availableDates.length} out of 60 days`);
    console.log(`❌ Blocked Days: ${60 - availableDates.length} out of 60 days`);
    
    if (availableDates.length > 0) {
      console.log('\n📝 First 10 Available Dates:');
      availableDates.slice(0, 10).forEach(date => {
        const d = new Date(date);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        console.log(`   ✅ ${date} (${dayName})`);
      });
    }
    
    if (bookedDates.length > 0) {
      console.log('\n📝 Blocked Dates:');
      bookedDates.slice(0, 10).forEach(date => {
        const d = new Date(date);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        console.log(`   ❌ ${date} (${dayName})`);
      });
      if (bookedDates.length > 10) {
        console.log(`   ... and ${bookedDates.length - 10} more dates`);
      }
    }
    
    console.log('\n✅ Analysis Complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

analyzeAvailability();
