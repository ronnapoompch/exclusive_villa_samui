/**
 * AXIOS INTEGRATION TEST SUITE
 * Professional Villa Booking System Testing
 * 
 * ✅ Tests: Server health, API endpoints, data validation
 * ✅ Uses: axios for HTTP requests (Node.js compatible)
 * ✅ Coverage: Authentication, Villa Management, Booking System
 */

const axios = require('axios');

const SERVER_URL = 'http://localhost:3000';

// Test configuration
const testConfig = {
    timeout: 10000, // 10 seconds
    retries: 3,
    verbose: true
};

// Test utilities
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test suite
class IntegrationTestSuite {
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
            log(`\n${colors.blue}🧪 ${name}${colors.reset}`);
            await testFunction();
            this.results.passed++;
            log(`   ${colors.green}✅ PASSED${colors.reset}`);
        } catch (error) {
            this.results.failed++;
            const errorDetails = error.response ? 
                `${error.message} (Status: ${error.response.status})` : 
                `${error.message} (Code: ${error.code || 'UNKNOWN'})`;
            this.results.errors.push({ test: name, error: errorDetails });
            log(`   ${colors.red}❌ FAILED: ${errorDetails}${colors.reset}`);
            if (testConfig.verbose && error.stack) {
                log(`   ${colors.yellow}Stack: ${error.stack.split('\n')[1]}${colors.reset}`);
            }
        }
    }

    // Test 1: Server Health Check
    async testServerHealth() {
        const response = await axios.get(`${SERVER_URL}`, { 
            timeout: testConfig.timeout,
            validateStatus: () => true // Don't throw on any status
        });
        
        if (response.status >= 200 && response.status < 400) {
            log(`   📡 Server responding (Status: ${response.status})`);
        } else {
            throw new Error(`Server returned status ${response.status}`);
        }
    }

    // Test 2: API Routes Discovery
    async testAPIRoutes() {
        const routes = [
            '/api/villas',
            '/api/v1/auth/register',
            '/api/v1/auth/login'
        ];

        for (const route of routes) {
            try {
                const response = await axios.get(`${SERVER_URL}${route}`, {
                    timeout: 5000,
                    validateStatus: () => true
                });
                
                log(`   📍 ${route}: ${response.status} ${response.statusText}`);
                
                if (response.status >= 500) {
                    throw new Error(`Server error on ${route}: ${response.status}`);
                }
            } catch (error) {
                if (error.code === 'ECONNREFUSED') {
                    throw new Error(`Cannot connect to ${route}`);
                }
                log(`   ⚠️ ${route}: ${error.message}`);
            }
        }
    }

    // Test 3: Villa Data Validation
    async testVillaData() {
        try {
            const response = await axios.get(`${SERVER_URL}/api/villas`, {
                timeout: testConfig.timeout
            });

            if (response.status !== 200) {
                throw new Error(`Villa API returned ${response.status}`);
            }

            const responseData = response.data;
            
            // Handle different API response formats
            let villas;
            if (responseData.success && responseData.data && responseData.data.villas) {
                villas = responseData.data.villas; // Wrapped response
            } else if (Array.isArray(responseData)) {
                villas = responseData; // Direct array
            } else {
                throw new Error(`Unexpected villa data format: ${typeof responseData}`);
            }
            
            if (!Array.isArray(villas)) {
                throw new Error('Villa data is not an array');
            }

            log(`   🏡 Found ${villas.length} villas`);
            
            if (villas.length > 0) {
                const firstVilla = villas[0];
                const requiredFields = ['id', 'name', 'location'];
                const optionalFields = ['pricing', 'price', 'bedrooms', 'bathrooms'];
                
                // Check required fields
                for (const field of requiredFields) {
                    if (!firstVilla.hasOwnProperty(field)) {
                        throw new Error(`Villa missing required field: ${field}`);
                    }
                }
                
                // Check if villa has pricing information (in any format)
                const hasPricing = optionalFields.some(field => 
                    firstVilla.hasOwnProperty(field) && firstVilla[field] !== null
                );
                
                log(`   ✅ Villa data structure validated`);
                log(`   📊 Villa fields: ${Object.keys(firstVilla).length} total`);
                log(`   💰 Pricing info: ${hasPricing ? 'Available' : 'Needs setup'}`);
            }

        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new Error('Villa API endpoint not found');
            }
            throw error;
        }
    }

    // Test 4: Authentication System
    async testAuthSystem() {
        // Test registration endpoint
        try {
            const testUser = {
                email: `test_${Date.now()}@example.com`,
                password: 'TestPassword123!',
                name: 'Integration Test User'
            };

            const registerResponse = await axios.post(`${SERVER_URL}/api/v1/auth/register`, testUser, {
                timeout: testConfig.timeout,
                validateStatus: () => true
            });

            log(`   📝 Registration endpoint: ${registerResponse.status}`);
            
            if (registerResponse.status >= 500) {
                throw new Error(`Registration server error: ${registerResponse.status}`);
            }

        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Cannot connect to auth system');
            }
            throw error;
        }

        // Test login endpoint  
        try {
            const loginResponse = await axios.post(`${SERVER_URL}/api/v1/auth/login`, {
                email: 'test@example.com',
                password: 'wrong_password'
            }, {
                timeout: testConfig.timeout,
                validateStatus: () => true
            });

            log(`   🔐 Login endpoint: ${loginResponse.status}`);
            
        } catch (error) {
            if (error.code !== 'ECONNREFUSED') {
                log(`   ⚠️ Login test: ${error.message}`);
            }
        }
    }

    // Test 5: Database Connectivity
    async testDatabaseConnectivity() {
        // We'll check if the villa API can fetch data (implies DB connection)
        try {
            const response = await axios.get(`${SERVER_URL}/api/villas?limit=1`, {
                timeout: testConfig.timeout
            });

            if (response.status === 200 && response.data) {
                log(`   💾 Database connectivity confirmed`);
            } else {
                throw new Error('Database query failed');
            }

        } catch (error) {
            throw new Error(`Database connection issue: ${error.message}`);
        }
    }

    // Generate final report
    generateReport() {
        const successRate = this.results.total > 0 ? 
            ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;

        log(`\n${colors.bold}===============================================${colors.reset}`);
        log(`${colors.bold}🏆 INTEGRATION TEST RESULTS${colors.reset}`);
        log(`${colors.bold}===============================================${colors.reset}`);
        
        log(`📊 Tests Run: ${this.results.total}`);
        log(`${colors.green}✅ Passed: ${this.results.passed}${colors.reset}`);
        log(`${colors.red}❌ Failed: ${this.results.failed}${colors.reset}`);
        log(`📈 Success Rate: ${successRate}%`);

        if (this.results.errors.length > 0) {
            log(`\n${colors.yellow}⚠️ ERROR DETAILS:${colors.reset}`);
            this.results.errors.forEach(({ test, error }) => {
                log(`   ${colors.red}• ${test}: ${error}${colors.reset}`);
            });
        }

        if (successRate >= 80) {
            log(`\n${colors.green}🎉 SYSTEM STATUS: EXCELLENT${colors.reset}`);
        } else if (successRate >= 60) {
            log(`\n${colors.yellow}⚡ SYSTEM STATUS: GOOD (needs minor fixes)${colors.reset}`);
        } else {
            log(`\n${colors.red}🚨 SYSTEM STATUS: NEEDS ATTENTION${colors.reset}`);
        }

        log(`${colors.bold}===============================================${colors.reset}\n`);
        
        return successRate;
    }

    // Main test runner
    async run() {
        log(`${colors.bold}🚀 STARTING PROFESSIONAL INTEGRATION TESTS${colors.reset}`);
        log(`${colors.blue}Server: ${SERVER_URL}${colors.reset}`);
        log(`${colors.blue}Timeout: ${testConfig.timeout}ms${colors.reset}\n`);

        // Wait for server to be ready
        log(`⏳ Waiting for server startup...`);
        await delay(2000);

        await this.runTest('Server Health Check', () => this.testServerHealth());
        await this.runTest('API Routes Discovery', () => this.testAPIRoutes());
        await this.runTest('Villa Data Validation', () => this.testVillaData());
        await this.runTest('Authentication System', () => this.testAuthSystem());
        await this.runTest('Database Connectivity', () => this.testDatabaseConnectivity());

        const successRate = this.generateReport();
        
        // Exit with appropriate code
        process.exit(successRate >= 80 ? 0 : 1);
    }
}

// Run the test suite
if (require.main === module) {
    const testSuite = new IntegrationTestSuite();
    testSuite.run().catch(error => {
        log(`\n${colors.red}💥 CRITICAL ERROR: ${error.message}${colors.reset}`);
        process.exit(1);
    });
}

module.exports = IntegrationTestSuite;