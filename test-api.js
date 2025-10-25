// Simple API test script
console.log('Testing Villa API...');

fetch('http://localhost:3000/en/api/villas?featured=true&limit=3')
  .then(response => {
    console.log('Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Villa data received:', data);
    console.log('Number of villas:', data.data?.length);
  })
  .catch(error => {
    console.error('API Error:', error);
  });