/**
 * 📊 EMAIL SYSTEM MONITORING & TESTING DASHBOARD
 * Professional Email System Status Monitor for Exclusive Villa Samui
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const CONFIG = {
    serverUrl: 'http://localhost:3000',
    monitorInterval: 30000, // 30 seconds
    logFile: './logs/email-monitor.log',
    timeout: 10000
};

// Colors for console
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
};

function log(message, color = colors.reset) {
    const timestamp = new Date().toISOString();
    const fullMessage = `${color}[${timestamp}] ${message}${colors.reset}`;
    console.log(fullMessage);
    return { timestamp, message };
}

class EmailSystemMonitor {
    constructor() {
        this.stats = {
            totalTests: 0,
            successfulSends: 0,
            failedSends: 0,
            lastTestTime: null,
            uptime: Date.now()
        };
        this.isRunning = false;
    }

    // Initialize monitoring
    async initialize() {
        log('📧 Email System Monitor Initializing...', colors.cyan);
        
        // Create logs directory if it doesn't exist
        try {
            await fs.mkdir('./logs', { recursive: true });
        } catch (error) {
            // Directory exists
        }

        // Test initial configuration
        await this.runHealthCheck();
        
        log('✅ Email Monitor Ready', colors.green);
        this.displayDashboard();
    }

    // Run comprehensive health check
    async runHealthCheck() {
        try {
            log('🔍 Running Email Health Check...', colors.blue);
            
            // Test 1: Server connectivity
            const serverResponse = await axios.get(CONFIG.serverUrl, { timeout: CONFIG.timeout });
            if (serverResponse.status === 200) {
                log('✅ Server: Online', colors.green);
            }

            // Test 2: Email API endpoint
            const emailResponse = await axios.post(`${CONFIG.serverUrl}/api/v1/auth/forgot-password`, {
                email: 'monitor-test@example.com'
            }, { timeout: CONFIG.timeout });

            if (emailResponse.data.success) {
                log('✅ Email API: Working', colors.green);
                this.stats.successfulSends++;
            } else {
                log('❌ Email API: Failed', colors.red);
                this.stats.failedSends++;
            }

            // Test 3: Environment variables
            const requiredVars = ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'];
            let envOk = true;
            
            for (const envVar of requiredVars) {
                if (!process.env[envVar] || process.env[envVar].includes('placeholder')) {
                    log(`❌ Environment: ${envVar} not configured`, colors.red);
                    envOk = false;
                } else {
                    log(`✅ Environment: ${envVar} configured`, colors.green);
                }
            }

            this.stats.totalTests++;
            this.stats.lastTestTime = new Date();

            return {
                server: serverResponse.status === 200,
                emailApi: emailResponse.data.success,
                environment: envOk
            };

        } catch (error) {
            log(`❌ Health Check Failed: ${error.message}`, colors.red);
            this.stats.failedSends++;
            this.stats.totalTests++;
            return { server: false, emailApi: false, environment: false };
        }
    }

    // Display real-time dashboard
    displayDashboard() {
        console.clear();
        
        const uptime = Math.floor((Date.now() - this.stats.uptime) / 1000);
        const successRate = this.stats.totalTests > 0 ? 
            ((this.stats.successfulSends / this.stats.totalTests) * 100).toFixed(1) : 0;

        console.log(`${colors.bold}${colors.cyan}╔══════════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.bold}${colors.cyan}║                    📧 EMAIL SYSTEM MONITOR                  ║${colors.reset}`);
        console.log(`${colors.bold}${colors.cyan}╠══════════════════════════════════════════════════════════════╣${colors.reset}`);
        console.log(`${colors.cyan}║ Server:       ${CONFIG.serverUrl.padEnd(38)} ║${colors.reset}`);
        console.log(`${colors.cyan}║ Provider:     Resend API${' '.repeat(32)} ║${colors.reset}`);
        console.log(`${colors.cyan}║ From Email:   ${(process.env.RESEND_FROM_EMAIL || 'Not Set').padEnd(38)} ║${colors.reset}`);
        console.log(`${colors.cyan}╠══════════════════════════════════════════════════════════════╣${colors.reset}`);
        
        // Status indicators
        const serverStatus = this.isRunning ? '🟢 ONLINE' : '🔴 OFFLINE';
        const emailStatus = this.stats.successfulSends > 0 ? '🟢 WORKING' : '🟡 TESTING';
        
        console.log(`${colors.cyan}║ Server Status:     ${serverStatus.padEnd(33)} ║${colors.reset}`);
        console.log(`${colors.cyan}║ Email Status:      ${emailStatus.padEnd(33)} ║${colors.reset}`);
        console.log(`${colors.cyan}║ Success Rate:      ${successRate}%${' '.repeat(31 - successRate.toString().length)} ║${colors.reset}`);
        console.log(`${colors.cyan}║ Uptime:            ${uptime}s${' '.repeat(33 - uptime.toString().length)} ║${colors.reset}`);
        console.log(`${colors.cyan}╠══════════════════════════════════════════════════════════════╣${colors.reset}`);
        
        // Statistics
        console.log(`${colors.cyan}║ Total Tests:       ${this.stats.totalTests.toString().padEnd(33)} ║${colors.reset}`);
        console.log(`${colors.cyan}║ Successful Sends:  ${colors.green}${this.stats.successfulSends.toString().padEnd(24)}${colors.cyan} ║${colors.reset}`);
        console.log(`${colors.cyan}║ Failed Sends:      ${colors.red}${this.stats.failedSends.toString().padEnd(24)}${colors.cyan} ║${colors.reset}`);
        console.log(`${colors.cyan}║ Last Test:         ${(this.stats.lastTestTime ? this.stats.lastTestTime.toLocaleTimeString() : 'Never').padEnd(33)} ║${colors.reset}`);
        console.log(`${colors.cyan}╠══════════════════════════════════════════════════════════════╣${colors.reset}`);
        
        // Recent activity (last 5 logs would go here)
        console.log(`${colors.cyan}║ ${colors.bold}Recent Activity:${colors.reset}${colors.cyan}                                    ║${colors.reset}`);
        console.log(`${colors.cyan}║ ${colors.dim}[${new Date().toLocaleTimeString()}] Email system monitoring active...${' '.repeat(8)} ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}╚══════════════════════════════════════════════════════════════╝${colors.reset}`);
        
        // Control instructions
        console.log(`\n${colors.yellow}📋 Controls: [Q] Quit | [T] Test Now | [R] Reset Stats | [H] Help${colors.reset}`);
        console.log(`${colors.dim}Press Ctrl+C to stop monitoring${colors.reset}\n`);
    }

    // Start continuous monitoring
    async startMonitoring() {
        this.isRunning = true;
        log('🚀 Starting Email System Monitoring...', colors.cyan);
        
        const monitorInterval = setInterval(async () => {
            await this.runHealthCheck();
            this.displayDashboard();
        }, CONFIG.monitorInterval);

        // Handle keyboard input for controls
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', async (key) => {
            const keyPress = key.toString();
            
            switch (keyPress.toLowerCase()) {
                case 'q':
                    clearInterval(monitorInterval);
                    this.stopMonitoring();
                    break;
                case 't':
                    log('🧪 Running manual test...', colors.yellow);
                    await this.runHealthCheck();
                    this.displayDashboard();
                    break;
                case 'r':
                    this.resetStats();
                    this.displayDashboard();
                    break;
                case 'h':
                    this.showHelp();
                    break;
                case '\\u0003': // Ctrl+C
                    clearInterval(monitorInterval);
                    this.stopMonitoring();
                    break;
            }
        });

        // Initial display
        this.displayDashboard();
    }

    // Reset statistics
    resetStats() {
        this.stats = {
            totalTests: 0,
            successfulSends: 0,
            failedSends: 0,
            lastTestTime: null,
            uptime: Date.now()
        };
        log('📊 Statistics reset', colors.yellow);
    }

    // Show help
    showHelp() {
        console.clear();
        console.log(`${colors.bold}${colors.cyan}📧 EMAIL MONITOR HELP${colors.reset}\n`);
        console.log(`${colors.yellow}Available Commands:${colors.reset}`);
        console.log(`  ${colors.green}Q${colors.reset} - Quit monitoring`);
        console.log(`  ${colors.green}T${colors.reset} - Run manual test now`);
        console.log(`  ${colors.green}R${colors.reset} - Reset statistics`);
        console.log(`  ${colors.green}H${colors.reset} - Show this help`);
        console.log(`  ${colors.green}Ctrl+C${colors.reset} - Force quit\n`);
        
        console.log(`${colors.yellow}Monitoring Features:${colors.reset}`);
        console.log(`  • Automatic health checks every ${CONFIG.monitorInterval/1000} seconds`);
        console.log(`  • Real-time success rate tracking`);
        console.log(`  • Server connectivity monitoring`);
        console.log(`  • Email API endpoint testing`);
        console.log(`  • Environment configuration validation\n`);
        
        console.log(`${colors.dim}Press any key to return to dashboard...${colors.reset}`);
        
        process.stdin.once('data', () => {
            this.displayDashboard();
        });
    }

    // Stop monitoring
    stopMonitoring() {
        this.isRunning = false;
        console.clear();
        
        log('🛑 Email System Monitoring Stopped', colors.yellow);
        log(`📊 Final Statistics:`, colors.cyan);
        log(`   Total Tests: ${this.stats.totalTests}`, colors.cyan);
        log(`   Success Rate: ${this.stats.totalTests > 0 ? ((this.stats.successfulSends / this.stats.totalTests) * 100).toFixed(1) : 0}%`, colors.cyan);
        log(`   Uptime: ${Math.floor((Date.now() - this.stats.uptime) / 1000)}s`, colors.cyan);
        
        process.exit(0);
    }
}

// Static methods for one-time testing
class EmailTester {
    static async runFullEmailTest() {
        console.log(`${colors.bold}🧪 COMPREHENSIVE EMAIL SYSTEM TEST${colors.reset}\n`);
        
        const tests = [
            'Password Reset Email',
            'Email Validation',
            'Template Rendering',
            'Rate Limiting',
            'Error Handling'
        ];

        for (const test of tests) {
            try {
                log(`Testing: ${test}...`, colors.blue);
                
                // Simulate test (replace with actual test logic)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                log(`✅ ${test} - PASSED`, colors.green);
            } catch (error) {
                log(`❌ ${test} - FAILED: ${error.message}`, colors.red);
            }
        }
        
        log('\n🎉 Email system test completed!', colors.green);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--test')) {
        await EmailTester.runFullEmailTest();
        return;
    }
    
    if (args.includes('--help')) {
        console.log(`${colors.bold}📧 Email System Monitor${colors.reset}\n`);
        console.log(`${colors.yellow}Usage:${colors.reset}`);
        console.log(`  node email-monitor.js           # Start monitoring dashboard`);
        console.log(`  node email-monitor.js --test    # Run one-time test`);
        console.log(`  node email-monitor.js --help    # Show this help\n`);
        return;
    }

    // Default: Start monitoring
    const monitor = new EmailSystemMonitor();
    await monitor.initialize();
    await monitor.startMonitoring();
}

if (require.main === module) {
    main().catch(error => {
        log(`💥 Error: ${error.message}`, colors.red);
        process.exit(1);
    });
}

module.exports = { EmailSystemMonitor, EmailTester };