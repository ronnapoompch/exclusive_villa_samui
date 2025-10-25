const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Creating admin user with known password...\n');
    
    const adminPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Update existing admin or create new one
    const admin = await prisma.user.upsert({
      where: { email: 'admin@exclusivevillasamui.com' },
      update: {
        password: hashedPassword,
        active: true
      },
      create: {
        email: 'admin@exclusivevillasamui.com',
        name: 'Villa Admin',
        password: hashedPassword,
        role: 'ADMIN',
        active: true
      }
    });
    
    console.log('✅ Admin user updated/created:');
    console.log('   Email: admin@exclusivevillasamui.com');
    console.log('   Password: Admin123!');
    console.log('   Role: ADMIN');
    
    // Test password verification
    const isValid = await bcrypt.compare(adminPassword, hashedPassword);
    console.log(`   Password verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    
    // Also create simple test users
    const users = [
      { email: 'test@villa.com', password: 'test123', name: 'Test User', role: 'USER' },
      { email: 'user@villa.com', password: 'user123', name: 'Villa User', role: 'USER' }
    ];
    
    for (const userData of users) {
      const hashedUserPassword = await bcrypt.hash(userData.password, 12);
      
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          password: hashedUserPassword,
          active: true
        },
        create: {
          email: userData.email,
          name: userData.name,
          password: hashedUserPassword,
          role: userData.role,
          active: true
        }
      });
      
      console.log(`✅ User created: ${userData.email} / ${userData.password}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();