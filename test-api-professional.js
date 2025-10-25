// Professional API Testing Suite
const https = require('http');
const querystring = require('querystring');

const BASE_URL = 'http://localhost:3000';

class APITester {
  constructor() {
    this.results = [];
  }

  async makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Professional-API-Tester/1.0',
          ...headers
        }
      };

      if (data && method !== 'GET') {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedData = responseData ? JSON.parse(responseData) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: parsedData
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: responseData,
              parseError: e.message
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data && method !== 'GET') {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async testEndpoint(name, method, path, data = null, expectedStatus = 200) {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   ${method} ${path}`);
    
    try {
      const startTime = Date.now();
      const response = await this.makeRequest(method, path, data);
      const duration = Date.now() - startTime;
      
      const success = response.status === expectedStatus;
      const status = success ? '✅' : '❌';
      
      console.log(`   ${status} Status: ${response.status} (Expected: ${expectedStatus})`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      
      if (response.data && typeof response.data === 'object') {
        if (response.data.success !== undefined) {
          console.log(`   📊 Success: ${response.data.success}`);
        }
        if (response.data.error) {
          console.log(`   ⚠️  Error: ${response.data.error.message || response.data.error}`);
        }
      }
      
      this.results.push({
        name,
        method,
        path,
        status: response.status,
        expectedStatus,
        success,
        duration,
        response: response.data
      });
      
      return response;
      
    } catch (error) {
      console.log(`   ❌ Connection Error: ${error.message}`);
      this.results.push({
        name,
        method,
        path,
        status: 'ERROR',
        expectedStatus,
        success: false,
        error: error.message
      });
      return null;
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 API TEST SUMMARY');
    console.log('='.repeat(60));
    
    const successful = this.results.filter(r => r.success).length;
    const total = this.results.length;
    const successRate = ((successful / total) * 100).toFixed(1);
    
    console.log(`✅ Successful: ${successful}/${total} (${successRate}%)`);
    console.log(`❌ Failed: ${total - successful}/${total}`);
    
    const avgDuration = this.results
      .filter(r => r.duration)
      .reduce((sum, r) => sum + r.duration, 0) / 
      this.results.filter(r => r.duration).length;
    
    if (avgDuration) {
      console.log(`⏱️  Average Response Time: ${avgDuration.toFixed(0)}ms`);
    }
    
    console.log('\n📋 Detailed Results:');
    this.results.forEach(r => {
      const status = r.success ? '✅' : '❌';
      console.log(`   ${status} ${r.method} ${r.path} - ${r.status} (${r.duration || 'N/A'}ms)`);
    });
  }
}

async function runProfessionalTests() {
  console.log('🚀 PROFESSIONAL API TESTING SUITE');
  console.log('🎯 Target: Exclusive Villa Samui Backend');
  console.log('📅 Date:', new Date().toISOString());
  
  const tester = new APITester();
  
  // Health Check
  await tester.testEndpoint('Health Check', 'GET', '/api/health');
  
  // Villa API Tests
  await tester.testEndpoint('Get All Villas', 'GET', '/api/villas');
  await tester.testEndpoint('Villa Search', 'GET', '/api/v1/villas/search?location=samui');
  await tester.testEndpoint('Get Villa by Slug', 'GET', '/api/villas/luxury-beachfront-villa');
  
  // Authentication Tests
  await tester.testEndpoint('Register User', 'POST', '/api/v1/auth/register', {
    name: 'API Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    phone: '+66812345678'
  }, 201);
  
  // Should fail - invalid data
  await tester.testEndpoint('Register Invalid', 'POST', '/api/v1/auth/register', {
    name: 'Test',
    email: 'invalid-email',
    password: '123'
  }, 400);
  
  // Forgot Password Test
  await tester.testEndpoint('Forgot Password', 'POST', '/api/auth/forgot-password', {
    email: 'test@example.com'
  }, 200);
  
  // Booking Tests
  await tester.testEndpoint('Create Booking', 'POST', '/api/v1/bookings', {
    villaId: 'test-villa-id',
    checkIn: '2025-12-01T00:00:00.000Z',
    checkOut: '2025-12-07T00:00:00.000Z',
    guests: 2,
    guestName: 'Test Guest',
    guestEmail: 'guest@example.com'
  }, 201);
  
  // Get Bookings
  await tester.testEndpoint('Get Bookings', 'GET', '/api/v1/bookings');
  
  // Performance Tests
  console.log('\n⚡ PERFORMANCE TESTS');
  const performanceTests = [];
  
  for (let i = 0; i < 5; i++) {
    const result = await tester.testEndpoint(`Performance Test ${i+1}`, 'GET', '/api/health');
    if (result && result.duration) {
      performanceTests.push(result.duration);
    }
  }
  
  if (performanceTests.length > 0) {
    const avgPerf = performanceTests.reduce((a, b) => a + b, 0) / performanceTests.length;
    const minPerf = Math.min(...performanceTests);
    const maxPerf = Math.max(...performanceTests);
    
    console.log(`📈 Performance Results:`);
    console.log(`   Average: ${avgPerf.toFixed(0)}ms`);
    console.log(`   Fastest: ${minPerf}ms`);
    console.log(`   Slowest: ${maxPerf}ms`);
  }
  
  tester.printSummary();
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  const failed = tester.results.filter(r => !r.success);
  
  if (failed.length === 0) {
    console.log('🎉 All tests passed! API is functioning well.');
  } else {
    console.log('⚠️  Issues found:');
    failed.forEach(f => {
      console.log(`   - ${f.name}: ${f.error || f.response?.error?.message || 'Unknown error'}`);
    });
  }
  
  const slowTests = tester.results.filter(r => r.duration && r.duration > 1000);
  if (slowTests.length > 0) {
    console.log('🐌 Performance concerns:');
    slowTests.forEach(t => {
      console.log(`   - ${t.name}: ${t.duration}ms (consider optimization)`);
    });
  }
}

// Run the tests
runProfessionalTests().catch(console.error);