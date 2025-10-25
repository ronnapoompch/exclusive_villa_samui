require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking Stripe Configuration');
console.log('=====================================');
console.log('STRIPE_PUBLISHABLE_KEY:', process.env.STRIPE_PUBLISHABLE_KEY ? 'Set (' + process.env.STRIPE_PUBLISHABLE_KEY.length + ' chars)' : '❌ Missing');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set (' + process.env.STRIPE_SECRET_KEY.length + ' chars)' : '❌ Missing');
console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'Set (' + process.env.STRIPE_WEBHOOK_SECRET.length + ' chars)' : '❌ Missing');

console.log('\n📊 Key Analysis:');
if (process.env.STRIPE_SECRET_KEY) {
    const key = process.env.STRIPE_SECRET_KEY;
    console.log('Secret Key Format:');
    console.log('- Starts with sk_test:', key.startsWith('sk_test_') ? '✅' : '❌');
    console.log('- Length check:', key.length > 100 ? '✅ (' + key.length + ')' : '❌ Too short (' + key.length + ')');
    console.log('- First 20 chars:', key.substring(0, 20));
    console.log('- Last 10 chars:', key.substring(key.length - 10));
}

console.log('\n🔧 Recommendations:');
console.log('1. Get real Stripe test keys from: https://dashboard.stripe.com/test/apikeys');
console.log('2. Replace placeholder keys in .env.local');
console.log('3. Make sure keys start with sk_test_ and pk_test_');

// Test simple Stripe connection
async function testStripeConnection() {
    try {
        console.log('\n🧪 Testing Stripe Connection...');
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        // Try to get account info
        const account = await stripe.accounts.retrieve();
        console.log('✅ Stripe connection successful!');
        console.log('Account ID:', account.id);
        console.log('Country:', account.country);
        console.log('Default currency:', account.default_currency);
        
    } catch (error) {
        console.log('❌ Stripe connection failed:');
        console.log('Error:', error.message);
        
        if (error.message.includes('Invalid API Key')) {
            console.log('\n💡 Solution: Update your Stripe keys in .env.local');
            console.log('Get them from: https://dashboard.stripe.com/test/apikeys');
        }
    }
}

testStripeConnection();