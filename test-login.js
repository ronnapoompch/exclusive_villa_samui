const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('Testing login system...\n');
    
    // ตรวจสอบ users ที่มีอยู่
    const existingUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        active: true,
        password: true
      }
    });
    
    console.log('Existing users:');
    existingUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Active: ${user.active} - Has password: ${!!user.password}`);
    });
    
    // ลองตรวจสอบ password ของ admin
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@exclusivevillasamui.com' }
    });
    
    if (adminUser && adminUser.password) {
      console.log('\n🔍 Testing password verification for admin user...');
      
      // Test common passwords
      const testPasswords = ['admin123', 'password', 'admin', '123456', 'Villa2024!'];
      
      for (const testPassword of testPasswords) {
        try {
          const isValid = await bcrypt.compare(testPassword, adminUser.password);
          if (isValid) {
            console.log(`✅ Password found: ${testPassword}`);
            break;
          } else {
            console.log(`❌ Password '${testPassword}' is incorrect`);
          }
        } catch (err) {
          console.log(`⚠️ Error testing password '${testPassword}':`, err.message);
        }
      }
    }
    
    // สร้าง test user ใหม่ด้วย password ที่รู้
    console.log('\n📝 Creating test user with known password...');
    
    const testPassword = 'test123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    
    try {
      await prisma.user.upsert({
        where: { email: 'test@villa.com' },
        update: {
          password: hashedPassword,
          active: true
        },
        create: {
          email: 'test@villa.com',
          name: 'Test User',
          password: hashedPassword,
          role: 'USER',
          active: true
        }
      });
      
      console.log('✅ Test user created/updated:');
      console.log('   Email: test@villa.com');
      console.log('   Password: test123');
      console.log('   Role: USER');
    } catch (error) {
      console.log('❌ Error creating test user:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();