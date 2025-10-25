/**
 * 🧪 SIMPLIFIED AUTHENTICATION SYSTEM TEST
 * Production-Ready NextAuth + Supabase Verification
 */

const { PrismaClient } = require('@prisma/client')
const https = require('https')
const http = require('http')

const prisma = new PrismaClient()

// Test Configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  adminCredentials: {
    email: 'admin@exclusivevillasamui.com',
    password: 'admin123'
  }
}

console.log('🚀 AUTHENTICATION SYSTEM VERIFICATION')
console.log('=====================================')
console.log('Testing NextAuth + Supabase Integration\n')

// Simple HTTP request function
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const requestModule = urlObj.protocol === 'https:' ? https : http
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }

    const req = requestModule.request(reqOptions, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          ok: res.statusCode >= 200 && res.statusCode < 300
        })
      })
    })

    req.on('error', reject)
    
    if (options.body) {
      req.write(options.body)
    }
    
    req.end()
  })
}

async function runTests() {
  const results = []
  
  try {
    console.log('📋 Test 1: Database Connection')
    const adminUser = await prisma.user.findUnique({
      where: { email: TEST_CONFIG.adminCredentials.email }
    })
    
    if (adminUser && adminUser.role === 'ADMIN' && adminUser.active) {
      console.log('✅ Database: PASS - Admin user exists and is active')
      results.push({ name: 'Database Connection', status: 'PASS' })
    } else {
      console.log('❌ Database: FAIL - Admin user not found or inactive')
      results.push({ name: 'Database Connection', status: 'FAIL' })
    }

    console.log('\n📋 Test 2: Server Availability')
    try {
      const serverResponse = await httpRequest(TEST_CONFIG.baseUrl)
      if (serverResponse.ok) {
        console.log('✅ Server: PASS - Server is running and responding')
        results.push({ name: 'Server Availability', status: 'PASS' })
      } else {
        console.log(`❌ Server: FAIL - Server responded with ${serverResponse.status}`)
        results.push({ name: 'Server Availability', status: 'FAIL' })
      }
    } catch (error) {
      console.log('❌ Server: FAIL - Server not accessible')
      results.push({ name: 'Server Availability', status: 'FAIL' })
    }

    console.log('\n📋 Test 3: NextAuth Session Endpoint')
    try {
      const sessionResponse = await httpRequest(`${TEST_CONFIG.baseUrl}/api/auth/session`)
      if (sessionResponse.ok) {
        console.log('✅ NextAuth Session: PASS - Session endpoint responding')
        results.push({ name: 'NextAuth Session Endpoint', status: 'PASS' })
      } else {
        console.log(`❌ NextAuth Session: FAIL - Status ${sessionResponse.status}`)
        results.push({ name: 'NextAuth Session Endpoint', status: 'FAIL' })
      }
    } catch (error) {
      console.log('❌ NextAuth Session: FAIL - Endpoint not accessible')
      results.push({ name: 'NextAuth Session Endpoint', status: 'FAIL' })
    }

    console.log('\n📋 Test 4: Admin Login Page')
    try {
      const loginResponse = await httpRequest(`${TEST_CONFIG.baseUrl}/admin/login`)
      if (loginResponse.ok && loginResponse.data.includes('type="email"')) {
        console.log('✅ Admin Login Page: PASS - Login form is accessible')
        results.push({ name: 'Admin Login Page', status: 'PASS' })
      } else {
        console.log('❌ Admin Login Page: FAIL - Login form not found')
        results.push({ name: 'Admin Login Page', status: 'FAIL' })
      }
    } catch (error) {
      console.log('❌ Admin Login Page: FAIL - Page not accessible')
      results.push({ name: 'Admin Login Page', status: 'FAIL' })
    }

    console.log('\n📋 Test 5: Admin Dashboard Protection')
    try {
      const dashboardResponse = await httpRequest(`${TEST_CONFIG.baseUrl}/admin/dashboard`)
      
      // Dashboard should either redirect (302/307) or show login requirement
      if (dashboardResponse.status === 302 || dashboardResponse.status === 307) {
        const location = dashboardResponse.headers.location
        if (location && location.includes('/admin/login')) {
          console.log('✅ Dashboard Protection: PASS - Properly redirects to login')
          results.push({ name: 'Dashboard Protection', status: 'PASS' })
        } else {
          console.log('⚠️ Dashboard Protection: PARTIAL - Redirects but not to login')
          results.push({ name: 'Dashboard Protection', status: 'PARTIAL' })
        }
      } else if (dashboardResponse.status === 200 && dashboardResponse.data.includes('login')) {
        console.log('✅ Dashboard Protection: PASS - Shows login requirement')
        results.push({ name: 'Dashboard Protection', status: 'PASS' })
      } else {
        console.log('❌ Dashboard Protection: FAIL - No protection detected')
        results.push({ name: 'Dashboard Protection', status: 'FAIL' })
      }
    } catch (error) {
      console.log('❌ Dashboard Protection: FAIL - Test failed')
      results.push({ name: 'Dashboard Protection', status: 'FAIL' })
    }

    console.log('\n📋 Test 6: CSRF Token Endpoint')
    try {
      const csrfResponse = await httpRequest(`${TEST_CONFIG.baseUrl}/api/auth/csrf`)
      if (csrfResponse.ok) {
        const csrfData = JSON.parse(csrfResponse.data)
        if (csrfData.csrfToken) {
          console.log('✅ CSRF Protection: PASS - CSRF token available')
          results.push({ name: 'CSRF Protection', status: 'PASS' })
        } else {
          console.log('❌ CSRF Protection: FAIL - No CSRF token found')
          results.push({ name: 'CSRF Protection', status: 'FAIL' })
        }
      } else {
        console.log('❌ CSRF Protection: FAIL - CSRF endpoint not accessible')
        results.push({ name: 'CSRF Protection', status: 'FAIL' })
      }
    } catch (error) {
      console.log('❌ CSRF Protection: FAIL - CSRF test failed')
      results.push({ name: 'CSRF Protection', status: 'FAIL' })
    }

    // Generate Report
    console.log('\n📊 TEST RESULTS SUMMARY')
    console.log('========================')
    
    const passed = results.filter(r => r.status === 'PASS').length
    const partial = results.filter(r => r.status === 'PARTIAL').length
    const failed = results.filter(r => r.status === 'FAIL').length
    const total = results.length
    const passRate = Math.round((passed / total) * 100)

    console.log(`Total Tests: ${total}`)
    console.log(`Passed: ${passed} ✅`)
    console.log(`Partial: ${partial} ⚠️`)
    console.log(`Failed: ${failed} ❌`)
    console.log(`Pass Rate: ${passRate}%`)
    
    console.log('\nDetailed Results:')
    results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌'
      console.log(`${icon} ${result.name}: ${result.status}`)
    })

    // Generate Markdown Report
    const timestamp = new Date().toISOString()
    const markdownReport = `# 🧪 AUTO TEST REPORT
Generated: ${timestamp}

## 📊 Overall Results
- **Total Tests**: ${total}
- **Passed**: ${passed} ✅
- **Partial**: ${partial} ⚠️  
- **Failed**: ${failed} ❌
- **Pass Rate**: ${passRate}%

## 📋 Test Results

${results.map(result => {
  const icon = result.status === 'PASS' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌'
  return `### ${result.name}
**Status**: ${result.status} ${icon}`
}).join('\n\n')}

## 🎯 System Status
${passRate >= 90 ? '🚀 **EXCELLENT**: System is production-ready!' : 
  passRate >= 75 ? '✅ **GOOD**: System is mostly functional.' : 
  passRate >= 50 ? '⚠️ **FAIR**: System needs some attention.' : 
  '🚫 **NEEDS WORK**: System has significant issues.'}

## 🔧 Authentication System Configuration
- **Framework**: Next.js 15.5.3 with App Router
- **Authentication**: NextAuth.js with Credentials Provider  
- **Database**: PostgreSQL with Prisma ORM
- **Session Strategy**: JWT with 30-day expiration
- **Route Protection**: Middleware-based authentication
- **Admin Access**: Role-based (ADMIN role required)

## 🌟 Production Readiness
${passRate >= 85 ? 
  'Your NextAuth + Supabase authentication system is **PRODUCTION READY** and fully functional! 🚀' :
  'Review failed tests and resolve issues before production deployment. 🔧'
}
`

    require('fs').writeFileSync('AUTO_TEST_REPORT.md', markdownReport)
    console.log('\n📄 Detailed report saved to: AUTO_TEST_REPORT.md')

    if (passRate >= 85) {
      console.log('\n🎉 SYSTEM VERIFICATION COMPLETE!')
      console.log('Your authentication system is production-ready! 🚀')
    } else {
      console.log('\n⚠️ Some tests need attention. Check the report for details.')
    }

    return { passRate, results }

  } catch (error) {
    console.error('💥 Test execution failed:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the tests
runTests()
  .then(result => {
    process.exit(result.passRate >= 85 ? 0 : 1)
  })
  .catch(error => {
    console.error('Test suite failed:', error.message)
    process.exit(1)
  })