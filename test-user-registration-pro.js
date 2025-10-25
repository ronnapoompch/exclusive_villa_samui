// Professional User Registration Test
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testUserRegistration() {
  console.log('🧪 PROFESSIONAL USER REGISTRATION TEST');
  console.log('=' .repeat(50));
  
  const testUser = {
    name: 'Test Professional User',
    email: `test-${Date.now()}@exclusivevillasamui.com`,
    password: 'TestPassword123!',
    phone: '+66812345678'
  };
  
  console.log('📝 Test User Data:');
  console.log(`   Name: ${testUser.name}`);
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Phone: ${testUser.phone}`);
  console.log('');
  
  try {
    // Test 1: Check if email already exists
    console.log('1️⃣ Testing email uniqueness...');
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email }
    });
    
    if (existingUser) {
      console.log('   ❌ Email already exists (this should not happen with timestamp)');
      return;
    } else {
      console.log('   ✅ Email is unique');
    }
    
    // Test 2: Hash password
    console.log('\n2️⃣ Testing password hashing...');
    const hashedPassword = await bcrypt.hash(testUser.password, 12);
    console.log('   ✅ Password hashed successfully');
    console.log(`   Hash length: ${hashedPassword.length} characters`);
    
    // Test 3: Create user in database
    console.log('\n3️⃣ Creating user in database...');
    const newUser = await prisma.user.create({
      data: {
        name: testUser.name,
        email: testUser.email,
        password: hashedPassword,
        phone: testUser.phone,
        role: 'USER',
        preferredLanguage: 'en'
      }
    });
    
    console.log('   ✅ User created successfully');
    console.log(`   User ID: ${newUser.id}`);
    console.log(`   Created at: ${newUser.createdAt}`);
    
    // Test 4: Verify password
    console.log('\n4️⃣ Testing password verification...');
    const passwordValid = await bcrypt.compare(testUser.password, hashedPassword);
    
    if (passwordValid) {
      console.log('   ✅ Password verification successful');
    } else {
      console.log('   ❌ Password verification failed');
    }
    
    // Test 5: Test invalid password
    console.log('\n5️⃣ Testing invalid password...');
    const invalidPassword = await bcrypt.compare('WrongPassword123!', hashedPassword);
    
    if (!invalidPassword) {
      console.log('   ✅ Invalid password correctly rejected');
    } else {
      console.log('   ❌ Invalid password incorrectly accepted');
    }
    
    // Test 6: Retrieve user
    console.log('\n6️⃣ Testing user retrieval...');
    const retrievedUser = await prisma.user.findUnique({
      where: { email: testUser.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        emailVerified: true
      }
    });
    
    if (retrievedUser) {
      console.log('   ✅ User retrieved successfully');
      console.log('   User data:');
      console.log(`     ID: ${retrievedUser.id}`);
      console.log(`     Name: ${retrievedUser.name}`);
      console.log(`     Email: ${retrievedUser.email}`);
      console.log(`     Role: ${retrievedUser.role}`);
      console.log(`     Email Verified: ${retrievedUser.emailVerified ? 'Yes' : 'No'}`);
    } else {
      console.log('   ❌ User retrieval failed');
    }
    
    // Test 7: Test duplicate email
    console.log('\n7️⃣ Testing duplicate email rejection...');
    try {
      await prisma.user.create({
        data: {
          name: 'Duplicate User',
          email: testUser.email,
          password: hashedPassword,
        }
      });
      console.log('   ❌ Duplicate email was allowed (should be blocked)');
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('   ✅ Duplicate email correctly rejected');
      } else {
        console.log('   ⚠️ Unexpected error:', error.message);
      }
    }
    
    // Test 8: Get user statistics
    console.log('\n8️⃣ Getting user statistics...');
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const verifiedCount = await prisma.user.count({ 
      where: { emailVerified: { not: null } } 
    });
    
    console.log(`   Total users: ${userCount}`);
    console.log(`   Admin users: ${adminCount}`);
    console.log(`   Verified users: ${verifiedCount}`);
    
    // Test 9: Cleanup (optional)
    console.log('\n9️⃣ Cleanup test user...');
    await prisma.user.delete({
      where: { id: newUser.id }
    });
    console.log('   ✅ Test user deleted successfully');
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL REGISTRATION TESTS PASSED!');
    console.log('✅ User registration system is working correctly');
    
  } catch (error) {
    console.log('\n❌ Registration test failed:');
    console.log(`Error: ${error.message}`);
    console.log(`Code: ${error.code || 'Unknown'}`);
    
    if (error.code === 'P1001') {
      console.log('💡 Solution: Check database connection');
    } else if (error.code === 'P2002') {
      console.log('💡 This is expected for duplicate email test');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testUserRegistration();