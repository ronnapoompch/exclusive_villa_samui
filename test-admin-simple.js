// Simple test for admin APIs
const testUrls = [
  '/admin',
  '/api/admin/villas', 
  '/api/admin/bookings',
  '/api/admin/stats'
];

console.log('🧪 Testing Admin URLs...\n');

testUrls.forEach((url, index) => {
  setTimeout(() => {
    console.log(`${index + 1}. Testing: http://localhost:3001${url}`);
    
    fetch(`http://localhost:3001${url}`)
      .then(res => {
        console.log(`   Status: ${res.status} ${res.statusText}`);
        return res.text();
      })
      .then(data => {
        if (url.includes('/api/')) {
          try {
            const json = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(json).substring(0, 100)}...`);
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 100)}...`);
          }
        } else {
          console.log(`   HTML Length: ${data.length} characters`);
        }
        console.log('');
      })
      .catch(err => {
        console.log(`   Error: ${err.message}\n`);
      });
  }, index * 1000);
});

// Install fetch if needed
if (typeof fetch === 'undefined') {
  const nodeFetch = require('node-fetch');
  global.fetch = nodeFetch;
}