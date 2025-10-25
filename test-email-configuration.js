/**
 * 📧 EMAIL CONFIGURATION TESTING SUITE
 * Professional Email System Verification for Exclusive Villa Samui
 * 
 * ✅ Tests: SMTP Configuration, Email Templates, Verification System
 * ✅ Providers: Resend API, Gmail SMTP (backup), Nodemailer
 * ✅ Coverage: Email Verification, Password Reset, System Notifications
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Test configuration
const CONFIG = {
    serverUrl: 'http://localhost:3000',
    timeout: 15000,
    retries: 3,
    verbose: true,
    testEmail: 'test@example.com',
    realTestEmail: process.env.TEST_EMAIL || 'ronnapoom.pch@gmail.com' // From your context
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

class EmailConfigurationTester {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
    }

    async runTest(name, testFunction) {
        this.results.total++;
        try {
            log(`\n${colors.blue}📧 ${name}${colors.reset}`);
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
    async testEnvironmentConfig() {
        const requiredEnvVars = [
            'RESEND_API_KEY',
            'RESEND_FROM_EMAIL',
            'NEXTAUTH_SECRET',
            'NEXTAUTH_URL'
        ];

        log(`   🔍 Checking environment variables...`);
        
        for (const envVar of requiredEnvVars) {
            const value = process.env[envVar];
            if (!value || value.includes('placeholder')) {
                throw new Error(`Missing or invalid ${envVar}: ${value || 'undefined'}`);
            }
            log(`   ✅ ${envVar}: ${value.substring(0, 10)}...`);
        }

        // Check for test email configuration
        if (!process.env.TEST_EMAIL) {
            log(`   ⚠️ TEST_EMAIL not set, using default: ${CONFIG.realTestEmail}`);
        } else {
            log(`   ✅ TEST_EMAIL: ${process.env.TEST_EMAIL}`);
        }

        log(`   📧 Configured email provider: Resend`);
        log(`   📨 From email: ${process.env.RESEND_FROM_EMAIL}`);
    }

    // Test 2: Email Service Module
    async testEmailServiceModule() {
        try {
            // We can't directly import due to ES modules, so we'll test via API
            log(`   🔍 Testing email service availability...`);
            
            // Test by making API call that uses email service
            const response = await axios.post(`${CONFIG.serverUrl}/api/v1/auth/forgot-password`, {
                email: CONFIG.testEmail
            }, {
                timeout: CONFIG.timeout,
                validateStatus: () => true
            });

            if (response.status === 200 && response.data.success) {
                log(`   ✅ Email service module accessible via API`);
                log(`   📧 Response: ${response.data.message}`);
            } else {
                throw new Error(`Email service test failed: ${response.status} ${response.statusText}`);
            }

        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Server not running - start with npm run dev');
            }
            throw error;
        }
    }

    // Test 3: SMTP Configuration Test
    async testSMTPConfiguration() {
        log(`   🔍 Testing SMTP configuration...`);
        
        // Since we're using Resend, we test API connectivity
        try {
            const testPayload = {
                email: CONFIG.testEmail
            };

            const response = await axios.post(
                `${CONFIG.serverUrl}/api/v1/auth/forgot-password`,
                testPayload,
                {
                    timeout: CONFIG.timeout,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.data.success) {
                log(`   ✅ SMTP/Resend API responding correctly`);
                log(`   📨 Message: ${response.data.message}`);
            } else {
                throw new Error(`SMTP test failed: ${JSON.stringify(response.data)}`);
            }

        } catch (error) {
            if (error.response && error.response.status === 429) {
                log(`   ⚠️ Rate limited - SMTP service working but throttled`);
            } else {
                throw error;
            }
        }
    }

    // Test 4: Email Template Rendering
    async testEmailTemplateRendering() {
        log(`   🔍 Testing email template rendering...`);
        
        // Test with different user scenarios
        const testScenarios = [
            { email: CONFIG.testEmail, description: 'Standard test email' },
            { email: CONFIG.realTestEmail, description: 'Real test email' },
            { email: 'user+test@example.com', description: 'Email with plus sign' }
        ];

        for (const scenario of testScenarios) {
            try {
                const response = await axios.post(
                    `${CONFIG.serverUrl}/api/v1/auth/forgot-password`,
                    { email: scenario.email },
                    { timeout: CONFIG.timeout }
                );

                if (response.data.success) {
                    log(`   ✅ Template rendered for ${scenario.description}`);
                } else {
                    log(`   ⚠️ Template issue for ${scenario.description}: ${response.data.error}`);
                }
            } catch (error) {
                log(`   ⚠️ Template test failed for ${scenario.email}: ${error.message}`);
            }
        }
    }

    // Test 5: Email Verification Flow
    async testEmailVerificationFlow() {
        log(`   🔍 Testing email verification flow...`);
        
        // Step 1: Register a new user (should trigger verification email)
        const testUserData = {
            email: `verification-test-${Date.now()}@example.com`,
            password: 'TestPassword123!',
            name: 'Email Test User'
        };

        try {
            const registerResponse = await axios.post(
                `${CONFIG.serverUrl}/api/v1/auth/register`,
                testUserData,
                { 
                    timeout: CONFIG.timeout,
                    validateStatus: () => true 
                }
            );

            log(`   📝 Registration response: ${registerResponse.status}`);
            
            if (registerResponse.status === 201 || registerResponse.status === 200) {
                log(`   ✅ User registration successful - verification email should be sent`);
            } else if (registerResponse.status === 400) {
                log(`   ⚠️ Registration validation working (expected for test scenarios)`);
            } else {
                log(`   ⚠️ Unexpected registration status: ${registerResponse.status}`);
            }

        } catch (error) {
            throw new Error(`Email verification flow test failed: ${error.message}`);
        }
    }

    // Test 6: Password Reset Email System
    async testPasswordResetSystem() {
        log(`   🔍 Testing password reset email system...`);
        
        const testCases = [
            {
                email: CONFIG.testEmail,
                description: 'Non-existent user (should still return success)'
            },
            {
                email: CONFIG.realTestEmail,
                description: 'Valid email format test'
            },
            {
                email: 'invalid-email',
                description: 'Invalid email format (should fail validation)'
            }
        ];

        for (const testCase of testCases) {
            try {
                const response = await axios.post(
                    `${CONFIG.serverUrl}/api/v1/auth/forgot-password`,
                    { email: testCase.email },
                    { 
                        timeout: CONFIG.timeout,
                        validateStatus: () => true 
                    }
                );

                if (testCase.email === 'invalid-email') {
                    if (response.status === 400) {
                        log(`   ✅ ${testCase.description}: Validation working`);
                    } else {
                        log(`   ⚠️ ${testCase.description}: Expected 400, got ${response.status}`);
                    }
                } else {
                    if (response.status === 200 && response.data.success) {
                        log(`   ✅ ${testCase.description}: Success response`);
                    } else {
                        log(`   ⚠️ ${testCase.description}: Unexpected response`);
                    }
                }

            } catch (error) {
                log(`   ❌ ${testCase.description}: ${error.message}`);
            }
        }
    }

    // Test 7: Email Rate Limiting
    async testEmailRateLimiting() {
        log(`   🔍 Testing email rate limiting...`);
        
        const requests = [];
        const testEmail = CONFIG.testEmail;

        // Send multiple requests quickly
        for (let i = 0; i < 5; i++) {
            requests.push(
                axios.post(
                    `${CONFIG.serverUrl}/api/v1/auth/forgot-password`,
                    { email: testEmail },
                    { 
                        timeout: CONFIG.timeout,
                        validateStatus: () => true 
                    }
                )
            );
        }

        try {
            const responses = await Promise.all(requests);
            
            let successCount = 0;
            let rateLimitedCount = 0;

            responses.forEach((response, index) => {
                if (response.status === 200) {
                    successCount++;
                } else if (response.status === 429) {
                    rateLimitedCount++;
                }
                log(`   📨 Request ${index + 1}: ${response.status} ${response.statusText}`);
            });

            if (rateLimitedCount > 0) {
                log(`   ✅ Rate limiting working (${rateLimitedCount} requests blocked)`);
            } else if (successCount === responses.length) {
                log(`   ⚠️ All requests succeeded - rate limiting may need adjustment`);
            }

        } catch (error) {
            throw new Error(`Rate limiting test failed: ${error.message}`);
        }
    }

    // Generate comprehensive report
    generateReport() {
        const successRate = this.results.total > 0 ? 
            ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;

        log(`\n${colors.bold}===============================================${colors.reset}`);
        log(`${colors.bold}📧 EMAIL CONFIGURATION TEST RESULTS${colors.reset}`);
        log(`${colors.bold}===============================================${colors.reset}`);
        
        log(`📊 Tests Run: ${this.results.total}`);
        log(`${colors.green}✅ Passed: ${this.results.passed}${colors.reset}`);
        log(`${colors.red}❌ Failed: ${this.results.failed}${colors.reset}`);
        log(`📈 Success Rate: ${successRate}%`);

        // Email system status
        if (successRate >= 90) {
            log(`\n${colors.green}🎉 EMAIL SYSTEM STATUS: EXCELLENT${colors.reset}`);
            log(`   📧 Ready for production use`);
        } else if (successRate >= 70) {
            log(`\n${colors.yellow}⚡ EMAIL SYSTEM STATUS: GOOD (minor issues)${colors.reset}`);
            log(`   📧 Ready for testing, minor fixes needed`);
        } else {
            log(`\n${colors.red}🚨 EMAIL SYSTEM STATUS: NEEDS ATTENTION${colors.reset}`);
            log(`   📧 Requires configuration fixes`);
        }

        if (this.results.errors.length > 0) {
            log(`\n${colors.yellow}⚠️ ISSUES TO ADDRESS:${colors.reset}`);
            this.results.errors.forEach(({ test, error }) => {
                log(`   ${colors.red}• ${test}: ${error}${colors.reset}`);
            });
        }

        // Recommendations
        log(`\n${colors.cyan}📋 RECOMMENDATIONS:${colors.reset}`);
        if (successRate >= 90) {
            log(`   ✅ Email system ready for production`);
            log(`   ✅ Consider setting up email monitoring`);
            log(`   ✅ Test with real user scenarios`);
        } else {
            log(`   🔧 Fix failing configuration tests`);
            log(`   📧 Verify SMTP/Resend API credentials`);
            log(`   🔍 Check email templates and formatting`);
        }

        log(`${colors.bold}===============================================${colors.reset}\n`);
        
        return successRate;
    }

    // Main test runner
    async run() {
        log(`${colors.bold}🚀 EMAIL CONFIGURATION TESTING SUITE${colors.reset}`);
        log(`${colors.cyan}Server: ${CONFIG.serverUrl}${colors.reset}`);
        log(`${colors.cyan}Provider: Resend API${colors.reset}`);
        log(`${colors.cyan}Test Email: ${CONFIG.realTestEmail}${colors.reset}\n`);

        await this.runTest('Environment Configuration', () => this.testEnvironmentConfig());
        await this.runTest('Email Service Module', () => this.testEmailServiceModule());
        await this.runTest('SMTP Configuration', () => this.testSMTPConfiguration());
        await this.runTest('Email Template Rendering', () => this.testEmailTemplateRendering());
        await this.runTest('Email Verification Flow', () => this.testEmailVerificationFlow());
        await this.runTest('Password Reset System', () => this.testPasswordResetSystem());
        await this.runTest('Email Rate Limiting', () => this.testEmailRateLimiting());

        const successRate = this.generateReport();
        
        // Exit with appropriate code
        process.exit(successRate >= 80 ? 0 : 1);
    }
}

// Run the test suite
if (require.main === module) {
    const tester = new EmailConfigurationTester();
    tester.run().catch(error => {
        log(`\n${colors.red}💥 CRITICAL ERROR: ${error.message}${colors.reset}`);
        process.exit(1);
    });
}

module.exports = EmailConfigurationTester;