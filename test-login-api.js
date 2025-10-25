// Test login via API
async function testLogin() {
  try {
    console.log('🧪 Testing login system...\n');
    
    const testCredentials = [
      { email: 'test@villa.com', password: 'test123' },
      { email: 'admin@exclusivevillasamui.com', password: 'Admin123!' },
      { email: 'user@villa.com', password: 'user123' }
    ];
    
    for (const creds of testCredentials) {
      console.log(`Testing ${creds.email}...`);
      
      const response = await fetch('http://localhost:3001/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: creds.email,
          password: creds.password,
          csrfToken: 'test'
        })
      });
      
      console.log(`Response status: ${response.status}`);
      
      if (response.ok) {
        console.log(`✅ ${creds.email} - Login successful`);
      } else {
        const error = await response.text();
        console.log(`❌ ${creds.email} - Login failed: ${error}`);
      }
      console.log('---');
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testLogin();
} else {
  // Browser environment
  console.log('Run this in Node.js environment');
}