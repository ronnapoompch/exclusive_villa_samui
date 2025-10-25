require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

async function testPaymentWithMockBooking() {
    console.log('🧪 Testing Payment API with Mock Data');
    console.log('📍 Server: http://localhost:3000');
    console.log('💳 Stripe Key:', process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...');
    
    try {
        // Create a simple mock payment request that bypasses booking validation
        const mockPaymentData = {
            bookingId: 'mock-booking-123', 
            amount: 10000, // 100 THB in satang
            currency: 'THB',
            description: 'Mock booking payment test',
            metadata: {
                test: 'true',
                mockBooking: 'true'
            }
        };

        console.log('\n📊 Testing Payment Intent Creation');
        console.log('📋 Request Data:', JSON.stringify(mockPaymentData, null, 2));

        const response = await axios.post('http://localhost:3000/api/payments/create-intent', mockPaymentData, {
            timeout: 10000,
            validateStatus: () => true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('\n📊 Response Status:', response.status);
        console.log('📄 Response Data:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200) {
            console.log('\n✅ Payment Intent Created Successfully!');
            const { paymentIntent, payment } = response.data;
            
            console.log('🔑 Payment Intent ID:', paymentIntent?.id);
            console.log('🎯 Client Secret:', paymentIntent?.client_secret ? 'Present' : 'Missing');
            console.log('💰 Amount:', paymentIntent?.amount, 'satang');
            console.log('💱 Currency:', paymentIntent?.currency?.toUpperCase());
            console.log('📋 Database Payment ID:', payment?.id);
            
            // Test payment confirmation endpoint
            console.log('\n🔍 Testing Payment Confirmation Endpoint');
            const confirmResponse = await axios.get(`http://localhost:3000/api/payments/confirm?payment_intent=${paymentIntent.id}`, {
                timeout: 10000,
                validateStatus: () => true
            });
            
            console.log('📊 Confirm Response Status:', confirmResponse.status);
            console.log('📄 Confirm Response Data:', JSON.stringify(confirmResponse.data, null, 2));
            
        } else if (response.status >= 500) {
            console.log('\n❌ Server Error - Check server logs');
        } else if (response.status >= 400) {
            console.log('\n⚠️ Client Error - Check request format');
        }
        
    } catch (error) {
        console.error('\n💥 Error testing payment:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('🚨 Server is not running! Please start the server first:');
            console.log('   npm run dev');
        } else if (error.response?.data) {
            console.log('📄 Error Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the test
if (require.main === module) {
    testPaymentWithMockBooking().catch(console.error);
}