require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runComprehensiveTests() {
  console.log('🔍 COMPREHENSIVE SYSTEM TEST');
  console.log('=' .repeat(50));
  console.log('');

  let passCount = 0;
  let failCount = 0;
  const issues = [];

  // Test 1: Database Connection
  console.log('📊 TEST 1: Database Connection');
  try {
    await prisma.$connect();
    console.log('✅ PASS: Database connected\n');
    passCount++;
  } catch (error) {
    console.log('❌ FAIL: Database connection failed');
    console.log('Error:', error.message, '\n');
    failCount++;
    issues.push('Database connection failed');
  }

  // Test 2: Villa Count
  console.log('📊 TEST 2: Villa Count');
  try {
    const count = await prisma.villa.count();
    if (count === 226) {
      console.log(`✅ PASS: Found ${count} villas (correct)\n`);
      passCount++;
    } else {
      console.log(`❌ FAIL: Found ${count} villas (expected 226)\n`);
      failCount++;
      issues.push(`Incorrect villa count: ${count}`);
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message, '\n');
    failCount++;
    issues.push('Villa count check failed');
  }

  // Test 3: Admin User Exists
  console.log('📊 TEST 3: Admin User');
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    if (admin) {
      console.log('✅ PASS: Admin user exists');
      console.log(`   Email: ${admin.email}\n`);
      passCount++;
    } else {
      console.log('❌ FAIL: No admin user found\n');
      failCount++;
      issues.push('No admin user exists');
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message, '\n');
    failCount++;
    issues.push('Admin user check failed');
  }

  // Test 4: Create Test User (Register API functionality)
  console.log('📊 TEST 4: User Registration (Direct DB)');
  const testEmail = `testuser${Date.now()}@example.com`;
  try {
    const hashedPassword = await bcrypt.hash('Test123456', 10);
    const newUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: testEmail,
        password: hashedPassword,
        phone: '+66812345678',
        role: 'USER',
        active: true,
        language: 'en',
        preferredCurrency: 'THB',
        preferredLanguage: 'en'
      }
    });
    console.log('✅ PASS: User created successfully');
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}\n`);
    passCount++;
  } catch (error) {
    console.log('❌ FAIL:', error.message, '\n');
    failCount++;
    issues.push('User creation failed');
  }

  // Test 5: User Login (Password Verification)
  console.log('📊 TEST 5: Password Verification');
  try {
    const user = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    if (user) {
      const isValid = await bcrypt.compare('Test123456', user.password);
      if (isValid) {
        console.log('✅ PASS: Password verification works\n');
        passCount++;
      } else {
        console.log('❌ FAIL: Password verification failed\n');
        failCount++;
        issues.push('Password verification failed');
      }
    } else {
      console.log('❌ FAIL: User not found\n');
      failCount++;
      issues.push('User not found for login test');
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message, '\n');
    failCount++;
    issues.push('Password verification test failed');
  }

  // Test 6: Booking Table Structure
  console.log('📊 TEST 6: Booking Table');
  try {
    const bookingCount = await prisma.booking.count();
    console.log(`✅ PASS: Booking table accessible (${bookingCount} bookings)\n`);
    passCount++;
  } catch (error) {
    console.log('❌ FAIL:', error.message, '\n');
    failCount++;
    issues.push('Booking table check failed');
  }

  // Test 7: Sample Villa with Slug
  console.log('📊 TEST 7: Villa Slug Query');
  try {
    const villa = await prisma.villa.findFirst({
      select: {
        id: true,
        name: true,
        slug: true,
        bedrooms: true,
        bathrooms: true
      }
    });
    if (villa) {
      console.log('✅ PASS: Villa query works');
      console.log(`   Name: ${villa.name}`);
      console.log(`   Slug: ${villa.slug}`);
      console.log(`   Rooms: ${villa.bedrooms} bed, ${villa.bathrooms} bath\n`);
      passCount++;
    } else {
      console.log('❌ FAIL: No villa found\n');
      failCount++;
      issues.push('No villa found');
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message, '\n');
    failCount++;
    issues.push('Villa slug query failed');
  }

  // Test 8: Availability Check Logic
  console.log('📊 TEST 8: Availability Logic Test');
  try {
    const villa = await prisma.villa.findFirst();
    if (villa) {
      const testCheckIn = new Date('2025-12-01');
      const testCheckOut = new Date('2025-12-05');
      
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          villaId: villa.id,
          status: { in: ['CONFIRMED', 'PENDING'] },
          OR: [
            {
              checkIn: { lte: testCheckOut },
              checkOut: { gte: testCheckIn }
            }
          ]
        }
      });
      
      console.log('✅ PASS: Availability query works');
      console.log(`   Checked: ${villa.name}`);
      console.log(`   Date range: Dec 1-5, 2025`);
      console.log(`   Conflicts: ${conflictingBookings.length}\n`);
      passCount++;
    } else {
      console.log('❌ FAIL: No villa found for test\n');
      failCount++;
      issues.push('No villa for availability test');
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message, '\n');
    failCount++;
    issues.push('Availability logic test failed');
  }

  // Test 9: Environment Variables
  console.log('📊 TEST 9: Environment Variables');
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY'
  ];
  
  let envPass = 0;
  let envFail = 0;
  
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set`);
      envPass++;
    } else {
      console.log(`❌ ${varName}: Not set`);
      envFail++;
      issues.push(`${varName} not set`);
    }
  });
  
  if (envFail === 0) {
    console.log('✅ PASS: All environment variables set\n');
    passCount++;
  } else {
    console.log(`❌ FAIL: ${envFail} environment variables missing\n`);
    failCount++;
  }

  // Test 10: Register API File
  console.log('📊 TEST 10: Register API File');
  const fs = require('fs');
  const registerPath = './src/app/[locale]/api/register/route.ts';
  try {
    const fileContent = fs.readFileSync(registerPath, 'utf8');
    if (fileContent.length > 100 && fileContent.includes('hashPassword')) {
      console.log('✅ PASS: Register API file exists and has content');
      console.log(`   File size: ${fileContent.length} bytes\n`);
      passCount++;
    } else {
      console.log('❌ FAIL: Register API file is empty or incomplete\n');
      failCount++;
      issues.push('Register API file incomplete');
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message, '\n');
    failCount++;
    issues.push('Register API file not found');
  }

  // Cleanup test user
  console.log('🧹 Cleaning up test user...');
  try {
    await prisma.user.delete({
      where: { email: testEmail }
    });
    console.log('✅ Test user cleaned up\n');
  } catch (error) {
    console.log('⚠️  Could not cleanup test user\n');
  }

  // Final Summary
  console.log('=' .repeat(50));
  console.log('📊 FINAL RESULTS');
  console.log('=' .repeat(50));
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);
  console.log('');

  if (issues.length > 0) {
    console.log('🔴 CRITICAL ISSUES TO FIX:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    console.log('');
  } else {
    console.log('🎉 ALL TESTS PASSED! System is ready.');
    console.log('');
  }

  await prisma.$disconnect();
  process.exit(failCount > 0 ? 1 : 0);
}

runComprehensiveTests().catch(console.error);
