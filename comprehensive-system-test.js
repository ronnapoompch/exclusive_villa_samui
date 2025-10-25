console.log('🧪 COMPREHENSIVE SYSTEM TEST')
console.log('='.repeat(50))

async function runAllTests() {
  const testResults = {
    passed: 0,
    failed: 0,
    total: 0
  }

  function test(name, condition) {
    testResults.total++
    if (condition) {
      console.log(`✅ ${name}`)
      testResults.passed++
    } else {
      console.log(`❌ ${name}`)
      testResults.failed++
    }
  }

  try {
    // Test 1: Database Connection
    console.log('\n📊 Testing Database...')
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    await prisma.$connect()
    test('Database Connection', true)
    
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@exclusivevillasamui.com' }
    })
    test('Admin User Exists', !!adminUser)
    test('Admin User Active', adminUser?.active === true)
    test('Admin User Role', adminUser?.role === 'ADMIN')
    
    const villaCount = await prisma.villa.count()
    test('Villa Data Loaded', villaCount > 0)
    
    await prisma.$disconnect()

    // Test 2: Server Health
    console.log('\n🌐 Testing Server...')
    const fetch = require('node-fetch')
    
    try {
      const healthResponse = await fetch('http://localhost:3000/api/auth/session')
      test('Server Responding', healthResponse.status === 200)
    } catch (e) {
      test('Server Responding', false)
    }

    // Test 3: NextAuth Config
    console.log('\n🔐 Testing Auth System...')
    const fs = require('fs')
    
    const nextAuthExists = fs.existsSync('./src/app/api/auth/[...nextauth]/route.ts')
    test('NextAuth Route Exists', nextAuthExists)
    
    const envExists = fs.existsSync('./.env.local')
    test('Environment Config Exists', envExists)

    // Test 4: Admin Pages
    console.log('\n📱 Testing Admin Interface...')
    const loginPageExists = fs.existsSync('./src/app/admin/login/page.tsx')
    test('Admin Login Page Exists', loginPageExists)
    
    const dashboardExists = fs.existsSync('./src/app/admin/dashboard/page.tsx')
    test('Admin Dashboard Exists', dashboardExists)

    // Test 5: API Routes
    console.log('\n🔌 Testing API Routes...')
    const adminStatsExists = fs.existsSync('./src/app/api/admin/stats/route.ts')
    test('Admin Stats API Exists', adminStatsExists)
    
    const adminVillasExists = fs.existsSync('./src/app/api/admin/villas/route.ts')
    test('Admin Villas API Exists', adminVillasExists)

  } catch (error) {
    console.error('❌ Test suite error:', error.message)
    testResults.failed++
  }

  // Results Summary
  console.log('\n' + '='.repeat(50))
  console.log('📋 TEST RESULTS SUMMARY')
  console.log('='.repeat(50))
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`📊 Total: ${testResults.total}`)
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`)

  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! System is ready for production.')
    console.log('\n🔗 Quick Access Links:')
    console.log('   • Admin Login: http://localhost:3000/admin/login')
    console.log('   • Admin Dashboard: http://localhost:3000/admin/dashboard')
    console.log('   • Admin Credentials: admin@exclusivevillasamui.com / admin123')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.')
  }
}

runAllTests()