/**
 * Quick Payment API Test
 */
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function quickPaymentTest() {
    try {
        console.log('🧪 Quick Payment API Test');
        console.log('📍 Server: http://localhost:3000');
        console.log('💳 Stripe Key:', process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...');
        
        // Test payment intent creation
        const response = await axios.post('http://localhost:3000/api/payments/create-intent', {
            bookingId: 'test-booking-123',
            amount: 10000, // 100 THB in satang
            currency: 'THB'
        }, {
            timeout: 10000,
            validateStatus: () => true
        });
        
        console.log('📊 Response Status:', response.status);
        console.log('📄 Response Data:', JSON.stringify(response.data, null, 2));
        
        if (response.status >= 500) {
            console.log('❌ Server Error - Check logs');
        } else if (response.status >= 400) {
            console.log('⚠️ Client Error - Check request format');  
        } else {
            console.log('✅ Success!');
        }
        
    } catch (error) {
        console.error('💥 Error:', error.message);
        if (error.response) {
            console.log('Response Status:', error.response.status);
            console.log('Response Data:', error.response.data);
        }
    }
}

quickPaymentTest();