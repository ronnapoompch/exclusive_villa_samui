require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

async function createTestBooking() {
    console.log('🏗️ Creating Test Booking for Payment Testing');
    console.log('📍 Server: http://localhost:3000');
    
    try {
        const testBooking = {
            villaId: 'test-villa-001',
            guestName: 'John Doe',
            guestEmail: 'test@example.com',
            guestPhone: '+66812345678',
            checkIn: '2025-12-01',
            checkOut: '2025-12-05',
            guests: 4,
            totalAmount: 10000, // 100 THB
            currency: 'THB',
            specialRequests: 'Test booking for payment integration'
        };

        console.log('📊 Creating booking:', JSON.stringify(testBooking, null, 2));

        const response = await axios.post('http://localhost:3000/api/bookings', testBooking, {
            timeout: 10000,
            validateStatus: () => true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📋 Response Status:', response.status);
        console.log('📄 Response Data:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200 || response.status === 201) {
            console.log('✅ Test booking created successfully!');
            console.log('🔑 Booking ID:', response.data.booking?.id || response.data.id);
            return response.data.booking?.id || response.data.id;
        } else {
            console.log('❌ Failed to create test booking');
            return null;
        }
        
    } catch (error) {
        console.error('💥 Error creating test booking:', error.message);
        if (error.response?.data) {
            console.log('📄 Error Response:', JSON.stringify(error.response.data, null, 2));
        }
        return null;
    }
}

async function testPaymentWithRealBooking() {
    console.log('\n🧪 Testing Payment with Real Booking');
    
    // First create a test booking
    const bookingId = await createTestBooking();
    
    if (!bookingId) {
        console.log('❌ Cannot proceed without valid booking');
        return;
    }

    console.log('\n💳 Testing Payment Intent Creation');
    
    try {
        const paymentData = {
            bookingId: bookingId,
            amount: 10000, // 100 THB in satang
            currency: 'THB'
        };

        const response = await axios.post('http://localhost:3000/api/payments/create-intent', paymentData, {
            timeout: 10000,
            validateStatus: () => true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Payment Response Status:', response.status);
        console.log('📄 Payment Response Data:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200) {
            console.log('✅ Payment intent created successfully!');
            console.log('🔑 Payment Intent ID:', response.data.paymentIntent?.id);
            console.log('🎯 Client Secret:', response.data.paymentIntent?.client_secret ? 'Available' : 'Missing');
        } else {
            console.log('❌ Payment creation failed');
        }
        
    } catch (error) {
        console.error('💥 Payment Error:', error.message);
        if (error.response?.data) {
            console.log('📄 Error Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the test
if (require.main === module) {
    testPaymentWithRealBooking().catch(console.error);
}