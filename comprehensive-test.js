const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function comprehensiveSystemTest() {
  console.log('🔍 COMPREHENSIVE SYSTEM TEST');
  console.log('='.repeat(80));
  console.log('Testing Date:', new Date().toISOString());
  console.log('='.repeat(80));
  console.log('');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
  };

  function logTest(category, name, status, message, details = null) {
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} [${category}] ${name}`);
    if (message) console.log(`   ${message}`);
    if (details) console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    console.log('');
    
    results.tests.push({ category, name, status, message, details });
    if (status === 'PASS') results.passed++;
    else if (status === 'FAIL') results.failed++;
    else results.warnings++;
  }

  // ============================================================================
  // 1. DATABASE TESTS
  // ============================================================================
  console.log('\n📊 DATABASE TESTS\n' + '-'.repeat(80));
  
  try {
    // Test 1.1: Database connection
    await prisma.$queryRaw`SELECT 1`;
    logTest('Database', 'Connection', 'PASS', 'Database connected successfully');
  } catch (error) {
    logTest('Database', 'Connection', 'FAIL', `Cannot connect: ${error.message}`);
  }

  try {
    // Test 1.2: Villa count
    const villaCount = await prisma.villa.count();
    if (villaCount === 226) {
      logTest('Database', 'Villa Count', 'PASS', `Correct: ${villaCount} villas`);
    } else {
      logTest('Database', 'Villa Count', 'WARN', `Expected 226, got ${villaCount}`);
    }
  } catch (error) {
    logTest('Database', 'Villa Count', 'FAIL', error.message);
  }

  try {
    // Test 1.3: User table exists and has admin
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    if (adminUser) {
      logTest('Database', 'Admin User', 'PASS', `Admin exists: ${adminUser.email}`);
    } else {
      logTest('Database', 'Admin User', 'FAIL', 'No admin user found!');
    }
  } catch (error) {
    logTest('Database', 'Admin User', 'FAIL', error.message);
  }

  try {
    // Test 1.4: Booking table structure
    const bookingCount = await prisma.booking.count();
    logTest('Database', 'Booking Table', 'PASS', `Table exists with ${bookingCount} bookings`);
  } catch (error) {
    logTest('Database', 'Booking Table', 'FAIL', error.message);
  }

  // ============================================================================
  // 2. API ENDPOINT TESTS
  // ============================================================================
  console.log('\n🌐 API ENDPOINT TESTS\n' + '-'.repeat(80));

  const baseUrl = 'http://localhost:3000';
  
  async function testEndpoint(name, path, expectedStatus = 200) {
    try {
      const response = await fetch(`${baseUrl}${path}`);
      if (response.status === expectedStatus) {
        logTest('API', name, 'PASS', `${path} returned ${response.status}`);
        return true;
      } else {
        logTest('API', name, 'WARN', `${path} returned ${response.status}, expected ${expectedStatus}`);
        return false;
      }
    } catch (error) {
      logTest('API', name, 'FAIL', `${path} error: ${error.message}`);
      return false;
    }
  }

  // Wait for server to be ready
  console.log('⏳ Waiting for server...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  await testEndpoint('Homepage', '/en');
  await testEndpoint('Villa Listing', '/en/api/villas');
  await testEndpoint('Specific Villa API', '/en/api/villas?slug=5-stars-beachfront-villa');
  
  // Test availability API with real villa
  const firstVilla = await prisma.villa.findFirst({ select: { slug: true } });
  if (firstVilla) {
    await testEndpoint('Availability API', `/api/villas/${firstVilla.slug}/availability`);
  }

  // ============================================================================
  // 3. FILE STRUCTURE TESTS
  // ============================================================================
  console.log('\n📁 FILE STRUCTURE TESTS\n' + '-'.repeat(80));

  const fs = require('fs');
  const path = require('path');

  function checkFile(name, filePath) {
    if (fs.existsSync(filePath)) {
      logTest('Files', name, 'PASS', `File exists: ${filePath}`);
      return true;
    } else {
      logTest('Files', name, 'FAIL', `Missing: ${filePath}`);
      return false;
    }
  }

  checkFile('Environment File', '.env.local');
  checkFile('Prisma Schema', 'prisma/schema.prisma');
  checkFile('Villa Data JSON', 'data/villas-optimized.json');
  checkFile('NextAuth Route', 'src/app/[locale]/api/auth/[...nextauth]/route.ts');
  checkFile('Login Page', 'src/app/[locale]/auth/login/page.tsx');
  checkFile('Register Page', 'src/app/[locale]/auth/register/page.tsx');
  checkFile('Availability API', 'src/app/api/villas/[slug]/availability/route.ts');

  // ============================================================================
  // 4. AUTHENTICATION TESTS
  // ============================================================================
  console.log('\n🔐 AUTHENTICATION TESTS\n' + '-'.repeat(80));

  try {
    // Check if register API exists and has code
    const registerPath = 'src/app/[locale]/api/register/route.ts';
    if (fs.existsSync(registerPath)) {
      const content = fs.readFileSync(registerPath, 'utf8');
      if (content.trim().length > 100) {
        logTest('Auth', 'Register API Implementation', 'PASS', 'Register API has code');
      } else {
        logTest('Auth', 'Register API Implementation', 'FAIL', 'Register API file is empty or too small!');
      }
    } else {
      logTest('Auth', 'Register API Implementation', 'FAIL', 'Register API file not found!');
    }
  } catch (error) {
    logTest('Auth', 'Register API Implementation', 'FAIL', error.message);
  }

  try {
    // Check NextAuth configuration
    const nextAuthPath = 'src/app/[locale]/api/auth/[...nextauth]/route.ts';
    if (fs.existsSync(nextAuthPath)) {
      const content = fs.readFileSync(nextAuthPath, 'utf8');
      if (content.includes('CredentialsProvider')) {
        logTest('Auth', 'NextAuth Config', 'PASS', 'CredentialsProvider configured');
      } else {
        logTest('Auth', 'NextAuth Config', 'WARN', 'CredentialsProvider not found');
      }
      
      if (content.includes('NEXTAUTH_SECRET')) {
        logTest('Auth', 'NextAuth Secret', 'PASS', 'Secret configured');
      } else {
        logTest('Auth', 'NextAuth Secret', 'WARN', 'Secret reference not found');
      }
    }
  } catch (error) {
    logTest('Auth', 'NextAuth Config', 'FAIL', error.message);
  }

  // ============================================================================
  // 5. ENVIRONMENT VARIABLES TEST
  // ============================================================================
  console.log('\n🔧 ENVIRONMENT VARIABLES\n' + '-'.repeat(80));

  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY'
  ];

  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      logTest('Environment', varName, 'PASS', 'Variable is set');
    } else {
      logTest('Environment', varName, 'FAIL', `${varName} is not set!`);
    }
  });

  // ============================================================================
  // 6. PACKAGE & DEPENDENCIES TEST
  // ============================================================================
  console.log('\n📦 PACKAGES & DEPENDENCIES\n' + '-'.repeat(80));

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const criticalDeps = {
      'next': packageJson.dependencies.next,
      'next-auth': packageJson.dependencies['next-auth'],
      '@prisma/client': packageJson.dependencies['@prisma/client'],
      'stripe': packageJson.dependencies.stripe,
      'react': packageJson.dependencies.react
    };

    Object.entries(criticalDeps).forEach(([name, version]) => {
      if (version) {
        logTest('Packages', name, 'PASS', `Installed: ${version}`);
      } else {
        logTest('Packages', name, 'FAIL', `${name} not found in dependencies!`);
      }
    });
  } catch (error) {
    logTest('Packages', 'package.json', 'FAIL', error.message);
  }

  // ============================================================================
  // FINAL SUMMARY
  // ============================================================================
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Passed:   ${results.passed}`);
  console.log(`❌ Failed:   ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`📝 Total:    ${results.tests.length}`);
  console.log('='.repeat(80));

  const successRate = ((results.passed / results.tests.length) * 100).toFixed(1);
  console.log(`\n🎯 Success Rate: ${successRate}%`);

  if (results.failed > 0) {
    console.log('\n❌ CRITICAL ISSUES FOUND:');
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        console.log(`   - [${t.category}] ${t.name}: ${t.message}`);
      });
  }

  if (results.warnings > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.tests
      .filter(t => t.status === 'WARN')
      .forEach(t => {
        console.log(`   - [${t.category}] ${t.name}: ${t.message}`);
      });
  }

  console.log('');
  await prisma.$disconnect();
  process.exit(results.failed > 0 ? 1 : 0);
}

comprehensiveSystemTest();
