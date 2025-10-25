/**
 * SIMPLE SERVER TEST
 * Quick check if server is running
 */

const axios = require('axios');

async function quickServerCheck() {
    console.log('🔍 Quick server connectivity test...\n');
    
    try {
        // Test basic connectivity
        const response = await axios.get('http://localhost:3000', {
            timeout: 5000,
            validateStatus: () => true
        });
        
        console.log(`✅ Server Status: ${response.status} ${response.statusText}`);
        console.log(`📡 Response headers: ${JSON.stringify(response.headers, null, 2)}`);
        
        // Test basic API endpoint
        try {
            const villaResponse = await axios.get('http://localhost:3000/api/villas', {
                timeout: 5000,
                validateStatus: () => true
            });
            
            console.log(`🏡 Villa API Status: ${villaResponse.status} ${villaResponse.statusText}`);
            
            if (villaResponse.status === 200 && villaResponse.data) {
                console.log(`📊 Villa Data: ${Array.isArray(villaResponse.data) ? villaResponse.data.length : 'Not an array'} items`);
            }
            
        } catch (villaError) {
            console.log(`❌ Villa API Error: ${villaError.message}`);
        }
        
    } catch (error) {
        console.log(`❌ Server Connection Failed: ${error.message}`);
        console.log(`🔧 Error Code: ${error.code}`);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Possible solutions:');
            console.log('   1. Make sure Next.js server is running (npm run dev)');
            console.log('   2. Check if port 3000 is available');
            console.log('   3. Wait a few seconds for server to fully start');
        }
    }
}

quickServerCheck();