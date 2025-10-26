// Test fetching Airbnb iCal data
const https = require('https');

const icalUrl = 'https://www.airbnb.com/calendar/ical/1152820496628129007.ics?s=81061c8e575b0f30722c6cd91312fe98&locale=en';

console.log('📥 Fetching iCal from Airbnb...\n');

https.get(icalUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => { data += chunk; });
  
  res.on('end', () => {
    console.log('✅ Data received!\n');
    console.log('📊 Data length:', data.length, 'bytes\n');
    console.log('📄 First 1000 characters:\n');
    console.log(data.substring(0, 1000));
    console.log('\n...\n');
    console.log('📄 Last 500 characters:\n');
    console.log(data.substring(data.length - 500));
  });
}).on('error', (err) => {
  console.error('❌ Error:', err.message);
});
