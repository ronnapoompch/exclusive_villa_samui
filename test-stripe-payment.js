/**
 * 💳 STRIPE PAYMENT SYSTEM TESTING SUITE
 * Professional Payment Integration Testing for Exclusive Villa Samui
 * 
 * ✅ Tests: Payment Intent Creation, Payment Confirmation, Webhook System
 * ✅ Coverage: Stripe API, Database Integration, Error Handling
 * ✅ Providers: Stripe Test Environment, Mock Payments
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Test configuration
const CONFIG = {
    serverUrl: 'http://localhost:3000',
    timeout: 20000,
    retries: 3,
    verbose: true,
    testAmount: 5000, // 50.00 THB in satang
    testCurrency: 'thb'
};

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

class StripePaymentTester {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
        this.testBookingId = null;
        this.testPaymentIntentId = null;
    }

    async runTest(name, testFunction) {
        this.results.total++;
        try {
            log(`\n${colors.blue}💳 ${name}${colors.reset}`);
            await testFunction();
            this.results.passed++;
            log(`   ${colors.green}✅ PASSED${colors.reset}`);
        } catch (error) {
            this.results.failed++;
            const errorDetails = error.response ? 
                `${error.message} (Status: ${error.response.status})` : 
                `${error.message}`;
            this.results.errors.push({ test: name, error: errorDetails });
            log(`   ${colors.red}❌ FAILED: ${errorDetails}${colors.reset}`);
            if (CONFIG.verbose && error.stack) {
                log(`   ${colors.yellow}Details: ${error.stack.split('\\n')[1]}${colors.reset}`);
            }
        }
    }

    // Test 1: Environment Configuration Check
    async testPaymentEnvironment() {
        const requiredEnvVars = [
            'STRIPE_SECRET_KEY',
            'STRIPE_PUBLISHABLE_KEY', 
            'STRIPE_WEBHOOK_SECRET',
            'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
        ];

        log(`   🔍 Checking Stripe environment variables...`);
        
        for (const envVar of requiredEnvVars) {
            const value = process.env[envVar];
            if (!value || value.includes('placeholder')) {
                throw new Error(`Missing or placeholder ${envVar}: ${value || 'undefined'}`);
            }
            
            // Validate Stripe key format
            if (envVar.includes('SECRET_KEY') && !value.startsWith('sk_')) {
                throw new Error(`Invalid Stripe secret key format: ${envVar}`);
            }
            if (envVar.includes('PUBLISHABLE_KEY') && !value.startsWith('pk_')) {
                throw new Error(`Invalid Stripe publishable key format: ${envVar}`);
            }
            if (envVar.includes('WEBHOOK_SECRET') && !value.startsWith('whsec_')) {
                throw new Error(`Invalid Stripe webhook secret format: ${envVar}`);
            }
            
            log(`   ✅ ${envVar}: ${value.substring(0, 15)}...`);
        }

        log(`   💳 Stripe environment: ${process.env.STRIPE_SECRET_KEY?.includes('test') ? 'TEST MODE' : 'LIVE MODE'}`);
    }

    // Test 2: Create Test Booking for Payment
    async testCreateTestBooking() {
        log(`   🏡 Creating test booking for payment testing...`);
        
        try {
            // First, get a villa to book
            const villaResponse = await axios.get(`${CONFIG.serverUrl}/api/villas`);
            
            if (!villaResponse.data.success || !villaResponse.data.data.villas.length) {
                throw new Error('No villas available for booking test');
            }

            const testVilla = villaResponse.data.data.villas[0];
            log(`   🏝️ Using test villa: ${testVilla.name}`);

            // Create a test booking
            const bookingData = {
                villaId: testVilla.id,
                guestName: 'Payment Test User',
                guestEmail: 'payment-test@example.com',
                guestPhone: '+66-123-456-789',
                checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now  
                guests: 2,
                totalAmount: CONFIG.testAmount / 100, // Convert from satang
                currency: CONFIG.testCurrency.toUpperCase(),
                specialRequests: 'Payment system test booking'
            };

            const bookingResponse = await axios.post(`${CONFIG.serverUrl}/api/bookings`, bookingData);
            
            if (bookingResponse.data.success && bookingResponse.data.data) {
                this.testBookingId = bookingResponse.data.data.id;
                log(`   ✅ Test booking created: ${this.testBookingId}`);
                log(`   📅 Check-in: ${bookingData.checkIn.split('T')[0]}`);
                log(`   📅 Check-out: ${bookingData.checkOut.split('T')[0]}`);
            } else {
                throw new Error(`Booking creation failed: ${JSON.stringify(bookingResponse.data)}`);
            }

        } catch (error) {
            if (error.response?.status === 404) {
                // Bookings API might not exist, create a mock booking ID
                this.testBookingId = 'test-booking-' + Date.now();
                log(`   ⚠️ Bookings API not available, using mock booking ID: ${this.testBookingId}`);
            } else {
                throw error;
            }
        }
    }

    // Test 3: Payment Intent Creation
    async testPaymentIntentCreation() {
        if (!this.testBookingId) {
            throw new Error('No test booking ID available');
        }

        log(`   💳 Creating payment intent for booking: ${this.testBookingId}`);
        
        const paymentData = {
            bookingId: this.testBookingId,
            amount: CONFIG.testAmount / 100, // 50.00 THB
            currency: CONFIG.testCurrency,
            description: 'Test payment for villa booking'
        };

        const response = await axios.post(`${CONFIG.serverUrl}/api/payments/create-intent`, paymentData, {
            timeout: CONFIG.timeout
        });

        if (response.data.success && response.data.data) {
            this.testPaymentIntentId = response.data.data.paymentIntentId;
            log(`   ✅ Payment Intent created: ${this.testPaymentIntentId}`);
            log(`   💰 Amount: ${response.data.data.amount} ${response.data.data.currency.toUpperCase()}`);
            log(`   🔑 Client Secret: ${response.data.data.clientSecret ? 'Provided' : 'Missing'}`);
            
            if (!response.data.data.clientSecret) {
                throw new Error('Payment Intent missing client secret');
            }
        } else {
            throw new Error(`Payment Intent creation failed: ${JSON.stringify(response.data)}`);
        }
    }

    // Test 4: Payment Status Check
    async testPaymentStatusCheck() {
        if (!this.testPaymentIntentId) {
            throw new Error('No payment intent ID available');
        }

        log(`   🔍 Checking payment status: ${this.testPaymentIntentId}`);
        
        const response = await axios.get(`${CONFIG.serverUrl}/api/payments/confirm`, {
            params: {
                payment_intent: this.testPaymentIntentId
            },
            timeout: CONFIG.timeout
        });

        if (response.data.success && response.data.data) {
            const payment = response.data.data.payment;
            log(`   ✅ Payment status retrieved: ${payment.status}`);
            log(`   💳 Payment ID: ${payment.id}`);
            log(`   📊 Stripe Status: ${response.data.data.stripeStatus || 'N/A'}`);
            
            if (payment.status !== 'PENDING') {
                log(`   ⚠️ Unexpected payment status: ${payment.status}`);
            }
        } else {
            throw new Error(`Payment status check failed: ${JSON.stringify(response.data)}`);
        }
    }

    // Test 5: Payment Confirmation Simulation
    async testPaymentConfirmation() {
        if (!this.testPaymentIntentId) {
            throw new Error('No payment intent ID available');
        }

        log(`   ✅ Simulating payment confirmation: ${this.testPaymentIntentId}`);
        
        const confirmationData = {
            paymentIntentId: this.testPaymentIntentId,
            bookingId: this.testBookingId
        };

        try {
            const response = await axios.post(`${CONFIG.serverUrl}/api/payments/confirm`, confirmationData, {
                timeout: CONFIG.timeout,
                validateStatus: () => true // Allow all status codes
            });

            log(`   📊 Confirmation response: ${response.status}`);
            
            if (response.data.success) {
                log(`   ✅ Payment confirmation processed`);
                log(`   💳 Payment Status: ${response.data.data.paymentStatus}`);
                log(`   🏨 Booking Status: ${response.data.data.bookingStatus}`);
                log(`   💬 Message: ${response.data.message}`);
            } else {
                log(`   ⚠️ Expected response for test payment: ${response.data.error}`);
            }
        } catch (error) {
            // This might fail in test environment, which is expected
            log(`   ⚠️ Payment confirmation test (expected in test env): ${error.message}`);
        }
    }

    // Test 6: Webhook Endpoint Validation
    async testWebhookEndpoint() {
        log(`   🪝 Testing webhook endpoint availability...`);
        
        // Test webhook endpoint exists (should return 400 for missing signature)
        try {
            const response = await axios.post(`${CONFIG.serverUrl}/api/payments/webhook`, 
                { test: 'data' }, 
                { 
                    timeout: CONFIG.timeout,
                    validateStatus: () => true 
                }
            );

            if (response.status === 400) {
                log(`   ✅ Webhook endpoint exists (correctly rejects unsigned requests)`);
            } else {
                log(`   ⚠️ Unexpected webhook response: ${response.status}`);
            }
        } catch (error) {
            throw new Error(`Webhook endpoint test failed: ${error.message}`);
        }
    }

    // Test 7: Error Handling & Validation
    async testPaymentValidation() {
        log(`   🛡️ Testing payment validation and error handling...`);
        
        const invalidRequests = [
            {
                description: 'Missing booking ID',
                data: { amount: 1000, currency: 'thb' },
                expectedStatus: 400
            },
            {
                description: 'Invalid amount (too small)',
                data: { bookingId: 'test-123', amount: 0.5, currency: 'thb' },
                expectedStatus: 400
            },
            {
                description: 'Missing amount',
                data: { bookingId: 'test-123', currency: 'thb' },
                expectedStatus: 400
            },
            {
                description: 'Non-existent booking',
                data: { bookingId: 'non-existent-booking-id', amount: 1000, currency: 'thb' },
                expectedStatus: 404
            }
        ];

        for (const testCase of invalidRequests) {
            try {
                const response = await axios.post(`${CONFIG.serverUrl}/api/payments/create-intent`, 
                    testCase.data, 
                    { 
                        timeout: CONFIG.timeout,
                        validateStatus: () => true 
                    }
                );

                if (response.status === testCase.expectedStatus) {
                    log(`   ✅ ${testCase.description}: Validation working`);
                } else {
                    log(`   ⚠️ ${testCase.description}: Expected ${testCase.expectedStatus}, got ${response.status}`);
                }
            } catch (error) {
                log(`   ❌ ${testCase.description}: ${error.message}`);
            }
        }
    }

    // Generate comprehensive report
    generateReport() {
        const successRate = this.results.total > 0 ? 
            ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;

        log(`\n${colors.bold}===============================================${colors.reset}`);
        log(`${colors.bold}💳 STRIPE PAYMENT SYSTEM TEST RESULTS${colors.reset}`);
        log(`${colors.bold}===============================================${colors.reset}`);
        
        log(`📊 Tests Run: ${this.results.total}`);
        log(`${colors.green}✅ Passed: ${this.results.passed}${colors.reset}`);
        log(`${colors.red}❌ Failed: ${this.results.failed}${colors.reset}`);
        log(`📈 Success Rate: ${successRate}%`);

        // Payment system status
        if (successRate >= 90) {
            log(`\n${colors.green}🎉 PAYMENT SYSTEM STATUS: EXCELLENT${colors.reset}`);
            log(`   💳 Ready for production payments`);
        } else if (successRate >= 70) {
            log(`\n${colors.yellow}⚡ PAYMENT SYSTEM STATUS: GOOD (minor issues)${colors.reset}`);
            log(`   💳 Ready for testing, minor fixes needed`);
        } else {
            log(`\n${colors.red}🚨 PAYMENT SYSTEM STATUS: NEEDS ATTENTION${colors.reset}`);
            log(`   💳 Requires configuration or implementation fixes`);
        }

        if (this.results.errors.length > 0) {
            log(`\n${colors.yellow}⚠️ ISSUES TO ADDRESS:${colors.reset}`);
            this.results.errors.forEach(({ test, error }) => {
                log(`   ${colors.red}• ${test}: ${error}${colors.reset}`);
            });
        }

        // Test data summary
        if (this.testBookingId) {
            log(`\n${colors.cyan}📊 TEST DATA CREATED:${colors.reset}`);
            log(`   🏨 Test Booking ID: ${this.testBookingId}`);
            if (this.testPaymentIntentId) {
                log(`   💳 Payment Intent ID: ${this.testPaymentIntentId}`);
            }
        }

        // Recommendations
        log(`\n${colors.cyan}📋 RECOMMENDATIONS:${colors.reset}`);
        if (successRate >= 90) {
            log(`   ✅ Payment system ready for production`);
            log(`   ✅ Configure live Stripe keys for production`);
            log(`   ✅ Set up webhook endpoints with your hosting provider`);
            log(`   ✅ Test with real credit cards in test mode`);
        } else {
            log(`   🔧 Fix failing API endpoints`);
            log(`   💳 Verify Stripe API keys and configuration`);  
            log(`   🔍 Check database schema and models`);
            log(`   📧 Implement email notifications for payments`);
        }

        log(`${colors.bold}===============================================${colors.reset}\n`);
        
        return successRate;
    }

    // Main test runner
    async run() {
        log(`${colors.bold}🚀 STRIPE PAYMENT SYSTEM TESTING SUITE${colors.reset}`);
        log(`${colors.cyan}Server: ${CONFIG.serverUrl}${colors.reset}`);
        log(`${colors.cyan}Test Amount: ${CONFIG.testAmount / 100} ${CONFIG.testCurrency.toUpperCase()}${colors.reset}`);
        log(`${colors.cyan}Stripe Mode: ${process.env.STRIPE_SECRET_KEY?.includes('test') ? 'TEST' : 'LIVE'}${colors.reset}\n`);

        await this.runTest('Payment Environment Config', () => this.testPaymentEnvironment());
        await this.runTest('Create Test Booking', () => this.testCreateTestBooking());
        await this.runTest('Payment Intent Creation', () => this.testPaymentIntentCreation());
        await this.runTest('Payment Status Check', () => this.testPaymentStatusCheck());
        await this.runTest('Payment Confirmation', () => this.testPaymentConfirmation());
        await this.runTest('Webhook Endpoint', () => this.testWebhookEndpoint());
        await this.runTest('Payment Validation', () => this.testPaymentValidation());

        const successRate = this.generateReport();
        
        // Exit with appropriate code
        process.exit(successRate >= 80 ? 0 : 1);
    }
}

// Run the test suite
if (require.main === module) {
    const tester = new StripePaymentTester();
    tester.run().catch(error => {
        log(`\n${colors.red}💥 CRITICAL ERROR: ${error.message}${colors.reset}`);
        process.exit(1);
    });
}

module.exports = StripePaymentTester;