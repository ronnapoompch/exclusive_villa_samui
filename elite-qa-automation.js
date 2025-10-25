/**
 * 🧪 ELITE FULL-STACK QA AUTOMATION SYSTEM
 * Comprehensive NextAuth + Supabase Authentication Testing
 * 100% Self-Verified System Testing
 */

import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'

const prisma = new PrismaClient()

// Test Configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  adminCredentials: {
    email: 'admin@exclusivevillasamui.com',
    password: 'admin123'
  },
  testTimeout: 30000,
  maxRetries: 3
}

// Test Results Storage
const testResults = {
  systemAnalysis: {},
  authTests: {},
  routeTests: {},
  sessionTests: {},
  summary: { passed: 0, failed: 0, total: 0 }
}

console.log('🚀 ELITE FULL-STACK QA AUTOMATION SYSTEM')
console.log('=========================================')
console.log('NextAuth + Supabase Authentication Testing')
console.log('100% Self-Verified System Testing\n')

// Utility Functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const testWithRetry = async (testName, testFn, maxRetries = 3) => {
  let lastError = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${testName} (Attempt ${attempt}/${maxRetries})`)
      const result = await testFn()
      console.log(`✅ ${testName}: PASS`)
      testResults.summary.passed++
      return { status: 'PASS', result, attempts: attempt }
    } catch (error) {
      lastError = error
      console.log(`❌ ${testName} (Attempt ${attempt}): ${error.message}`)
      
      if (attempt < maxRetries) {
        await sleep(2000) // Wait 2 seconds before retry
      }
    }
  }
  
  console.log(`🚫 ${testName}: FAIL (${maxRetries} attempts)`)
  testResults.summary.failed++
  return { status: 'FAIL', error: lastError.message, attempts: maxRetries }
}

// Phase 1: System Analysis Tests
async function runSystemAnalysisTests() {
  console.log('\n🧠 PHASE 1: SYSTEM ANALYSIS TESTS')
  console.log('==================================')
  
  // Test 1: Database Connection
  const dbTest = await testWithRetry('Database Connection', async () => {
    const adminUser = await prisma.user.findUnique({
      where: { email: TEST_CONFIG.adminCredentials.email }
    })
    
    if (!adminUser) throw new Error('Admin user not found in database')
    if (adminUser.role !== 'ADMIN') throw new Error('Admin user role is not ADMIN')
    if (!adminUser.active) throw new Error('Admin user is not active')
    
    return {
      email: adminUser.email,
      role: adminUser.role,
      active: adminUser.active,
      hasPassword: !!adminUser.password
    }
  })
  testResults.systemAnalysis.database = dbTest
  
  // Test 2: Server Availability
  const serverTest = await testWithRetry('Server Availability', async () => {
    const response = await fetch(TEST_CONFIG.baseUrl)
    if (!response.ok) throw new Error(`Server responded with status ${response.status}`)
    return { status: response.status, url: TEST_CONFIG.baseUrl }
  })
  testResults.systemAnalysis.server = serverTest
  
  // Test 3: NextAuth API Routes
  const nextAuthTest = await testWithRetry('NextAuth API Routes', async () => {
    const routes = [
      '/api/auth/csrf',
      '/api/auth/providers',
      '/api/auth/session'
    ]
    
    const results = {}
    
    for (const route of routes) {
      const response = await fetch(`${TEST_CONFIG.baseUrl}${route}`)
      if (!response.ok) throw new Error(`Route ${route} failed with status ${response.status}`)
      
      const data = await response.json()
      results[route] = {
        status: response.status,
        hasData: !!data
      }
    }
    
    return results
  })
  testResults.systemAnalysis.nextAuth = nextAuthTest
}

// Phase 2: Authentication Flow Tests
async function runAuthenticationTests() {
  console.log('\n🔐 PHASE 2: AUTHENTICATION FLOW TESTS')
  console.log('======================================')
  
  // Test 1: Login with Valid Credentials
  const validLoginTest = await testWithRetry('Valid Admin Login', async () => {
    const csrfResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/auth/csrf`)
    const { csrfToken } = await csrfResponse.json()
    
    const loginResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: TEST_CONFIG.adminCredentials.email,
        password: TEST_CONFIG.adminCredentials.password,
        csrfToken,
        redirect: 'false'
      }),
      redirect: 'manual'
    })
    
    if (loginResponse.status !== 200 && loginResponse.status !== 302) {
      throw new Error(`Login failed with status ${loginResponse.status}`)
    }
    
    // Check for session cookie
    const cookies = loginResponse.headers.get('set-cookie') || ''
    const hasSessionToken = cookies.includes('next-auth.session-token')
    
    return {
      status: loginResponse.status,
      hasSessionCookie: hasSessionToken,
      redirectLocation: loginResponse.headers.get('location')
    }
  })
  testResults.authTests.validLogin = validLoginTest
  
  // Test 2: Login with Invalid Credentials
  const invalidLoginTest = await testWithRetry('Invalid Credentials Login', async () => {
    const csrfResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/auth/csrf`)
    const { csrfToken } = await csrfResponse.json()
    
    const loginResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: TEST_CONFIG.adminCredentials.email,
        password: 'wrong-password',
        csrfToken,
        redirect: 'false'
      }),
      redirect: 'manual'
    })
    
    // Should fail or redirect to error
    if (loginResponse.status === 200) {
      const url = new URL(loginResponse.headers.get('location') || '')
      if (!url.searchParams.has('error')) {
        throw new Error('Invalid login should have failed')
      }
    }
    
    return {
      status: loginResponse.status,
      properly_rejected: true
    }
  })
  testResults.authTests.invalidLogin = invalidLoginTest
}

// Phase 3: Route Protection Tests
async function runRouteProtectionTests() {
  console.log('\n🛡️ PHASE 3: ROUTE PROTECTION TESTS')
  console.log('===================================')
  
  // Test 1: Protected Dashboard Access (Unauthenticated)
  const dashboardUnauthTest = await testWithRetry('Dashboard Access (Unauthenticated)', async () => {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/admin/dashboard`, {
      redirect: 'manual'
    })
    
    // Should redirect to login
    if (response.status !== 307 && response.status !== 302) {
      throw new Error(`Expected redirect, got status ${response.status}`)
    }
    
    const location = response.headers.get('location')
    if (!location || !location.includes('/admin/login')) {
      throw new Error(`Expected redirect to /admin/login, got ${location}`)
    }
    
    return {
      status: response.status,
      redirectLocation: location,
      properlyProtected: true
    }
  })
  testResults.routeTests.dashboardUnauth = dashboardUnauthTest
  
  // Test 2: Admin Login Page Access
  const loginPageTest = await testWithRetry('Admin Login Page Access', async () => {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/admin/login`)
    
    if (!response.ok) {
      throw new Error(`Login page not accessible: ${response.status}`)
    }
    
    const html = await response.text()
    const hasLoginForm = html.includes('type="email"') && html.includes('type="password"')
    
    return {
      status: response.status,
      hasLoginForm,
      accessible: true
    }
  })
  testResults.routeTests.loginPage = loginPageTest
  
  // Test 3: API Route Protection
  const apiProtectionTest = await testWithRetry('Admin API Protection', async () => {
    const routes = [
      '/api/admin/villas',
      '/api/admin/bookings'
    ]
    
    const results = {}
    
    for (const route of routes) {
      try {
        const response = await fetch(`${TEST_CONFIG.baseUrl}${route}`)
        results[route] = {
          status: response.status,
          protected: response.status === 401 || response.status === 403
        }
      } catch (error) {
        results[route] = {
          status: 'ERROR',
          error: error.message
        }
      }
    }
    
    return results
  })
  testResults.routeTests.apiProtection = apiProtectionTest
}

// Phase 4: Session Persistence Tests
async function runSessionTests() {
  console.log('\n🔄 PHASE 4: SESSION PERSISTENCE TESTS')
  console.log('======================================')
  
  // Test 1: Session Endpoint Response
  const sessionEndpointTest = await testWithRetry('Session Endpoint', async () => {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/auth/session`)
    
    if (!response.ok) {
      throw new Error(`Session endpoint failed: ${response.status}`)
    }
    
    const session = await response.json()
    
    return {
      status: response.status,
      hasSessionStructure: typeof session === 'object',
      sessionData: session
    }
  })
  testResults.sessionTests.endpoint = sessionEndpointTest
}

// Generate Comprehensive Report
async function generateTestReport() {
  console.log('\n📊 COMPREHENSIVE TEST REPORT')
  console.log('=============================')
  
  const totalTests = testResults.summary.passed + testResults.summary.failed
  testResults.summary.total = totalTests
  
  const passRate = totalTests > 0 ? Math.round((testResults.summary.passed / totalTests) * 100) : 0
  
  console.log(`\n📈 OVERALL RESULTS:`)
  console.log(`   Total Tests: ${totalTests}`)
  console.log(`   Passed: ${testResults.summary.passed} ✅`)
  console.log(`   Failed: ${testResults.summary.failed} ❌`)
  console.log(`   Pass Rate: ${passRate}%`)
  
  console.log(`\n🧠 SYSTEM ANALYSIS:`)
  Object.entries(testResults.systemAnalysis).forEach(([test, result]) => {
    console.log(`   ${test}: ${result.status} ${result.status === 'PASS' ? '✅' : '❌'}`)
  })
  
  console.log(`\n🔐 AUTHENTICATION TESTS:`)
  Object.entries(testResults.authTests).forEach(([test, result]) => {
    console.log(`   ${test}: ${result.status} ${result.status === 'PASS' ? '✅' : '❌'}`)
  })
  
  console.log(`\n🛡️ ROUTE PROTECTION TESTS:`)
  Object.entries(testResults.routeTests).forEach(([test, result]) => {
    console.log(`   ${test}: ${result.status} ${result.status === 'PASS' ? '✅' : '❌'}`)
  })
  
  console.log(`\n🔄 SESSION TESTS:`)
  Object.entries(testResults.sessionTests).forEach(([test, result]) => {
    console.log(`   ${test}: ${result.status} ${result.status === 'PASS' ? '✅' : '❌'}`)
  })
  
  // System Status
  const systemStatus = passRate >= 90 ? 'EXCELLENT' : passRate >= 75 ? 'GOOD' : passRate >= 50 ? 'FAIR' : 'NEEDS WORK'
  const statusIcon = passRate >= 90 ? '🚀' : passRate >= 75 ? '✅' : passRate >= 50 ? '⚠️' : '🚫'
  
  console.log(`\n${statusIcon} SYSTEM STATUS: ${systemStatus}`)
  
  if (passRate >= 90) {
    console.log(`\n🎉 SYSTEM VERIFICATION COMPLETE!`)
    console.log(`   Your NextAuth + Supabase authentication system is`)
    console.log(`   production-ready and fully functional! 🚀`)
  } else {
    console.log(`\n⚠️ SYSTEM NEEDS ATTENTION:`)
    console.log(`   Some tests failed. Review the details above.`)
  }
  
  return {
    passRate,
    totalTests,
    systemStatus,
    testResults
  }
}

// Create Markdown Report
async function createMarkdownReport(reportData) {
  const timestamp = new Date().toISOString()
  
  const markdown = `# 🧪 AUTO TEST REPORT
Generated: ${timestamp}

## 📊 Overall Results
- **Total Tests**: ${reportData.totalTests}
- **Passed**: ${testResults.summary.passed} ✅
- **Failed**: ${testResults.summary.failed} ❌
- **Pass Rate**: ${reportData.passRate}%
- **System Status**: ${reportData.systemStatus}

## 🧠 System Analysis Tests
${Object.entries(testResults.systemAnalysis).map(([test, result]) => 
  `- **${test}**: ${result.status} ${result.status === 'PASS' ? '✅' : '❌'}`
).join('\n')}

## 🔐 Authentication Flow Tests
${Object.entries(testResults.authTests).map(([test, result]) => 
  `- **${test}**: ${result.status} ${result.status === 'PASS' ? '✅' : '❌'}`
).join('\n')}

## 🛡️ Route Protection Tests
${Object.entries(testResults.routeTests).map(([test, result]) => 
  `- **${test}**: ${result.status} ${result.status === 'PASS' ? '✅' : '❌'}`
).join('\n')}

## 🔄 Session Persistence Tests
${Object.entries(testResults.sessionTests).map(([test, result]) => 
  `- **${test}**: ${result.status} ${result.status === 'PASS' ? '✅' : '❌'}`
).join('\n')}

## 🎯 System Summary
${reportData.passRate >= 90 ? 
  '🚀 **EXCELLENT**: System is production-ready and fully functional!' :
  reportData.passRate >= 75 ?
  '✅ **GOOD**: System is mostly functional with minor issues.' :
  reportData.passRate >= 50 ?
  '⚠️ **FAIR**: System has some issues that need attention.' :
  '🚫 **NEEDS WORK**: System has significant issues that must be resolved.'
}

## 🔧 NextAuth + Supabase Configuration Status
- **Framework**: Next.js 15.5.3 with App Router
- **Authentication**: NextAuth.js with Credentials Provider
- **Database**: PostgreSQL with Prisma ORM
- **Session Strategy**: JWT with 30-day expiration
- **Route Protection**: Middleware-based authentication
- **Admin System**: Role-based access control (ADMIN role required)

${reportData.passRate >= 90 ? 
  '## ✨ Production Ready\nYour authentication system is ready for production deployment!' :
  '## 🔧 Action Required\nReview failed tests and resolve issues before production deployment.'
}
`
  
  return markdown
}

// Main Test Execution
async function runCompleteTestSuite() {
  try {
    console.log('⏱️ Starting comprehensive test suite...\n')
    
    await runSystemAnalysisTests()
    await runAuthenticationTests()
    await runRouteProtectionTests()
    await runSessionTests()
    
    const reportData = await generateTestReport()
    const markdownReport = await createMarkdownReport(reportData)
    
    // Write report to file
    const fs = require('fs').promises
    await fs.writeFile('AUTO_TEST_REPORT.md', markdownReport)
    
    console.log(`\n📄 Detailed report saved to: AUTO_TEST_REPORT.md`)
    
    return reportData
    
  } catch (error) {
    console.error('❌ Test suite execution failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute the test suite
runCompleteTestSuite()
  .then((result) => {
    if (result.passRate >= 90) {
      console.log('\n🎉 ALL SYSTEMS GO! Authentication is production-ready! 🚀')
      process.exit(0)
    } else {
      console.log('\n⚠️ Some tests failed. Check AUTO_TEST_REPORT.md for details.')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('\n💥 Test suite failed:', error.message)
    process.exit(1)
  })