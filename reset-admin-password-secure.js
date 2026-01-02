const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔐 Phase 1.4: Resetting Admin Password...\n');

    // Generate strong password
    const newPassword = generateStrongPassword();
    
    console.log('✅ Generated strong password (save this!)');
    console.log('━'.repeat(50));
    console.log(`Email:    admin@exclusivevillasamui.com`);
    console.log(`Password: ${newPassword}`);
    console.log('━'.repeat(50));
    console.log('⚠️  Save this password in your password manager!\n');

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update admin user
    const admin = await prisma.user.update({
      where: {
        email: 'admin@exclusivevillasamui.com'
      },
      data: {
        password: hashedPassword
      }
    });

    console.log('✅ Admin password updated successfully');
    console.log(`   User ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}\n`);

    console.log('🔒 Security Recommendations:');
    console.log('   1. Save password in password manager (1Password, LastPass)');
    console.log('   2. Do not share password via chat/email');
    console.log('   3. Enable 2FA when available');
    console.log('   4. Change password every 90 days\n');

    // Test login
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log(`✅ Password verification: ${isValid ? 'PASSED' : 'FAILED'}\n`);

  } catch (error) {
    console.error('❌ Error resetting password:', error);
    
    if (error.code === 'P2025') {
      console.error('\n⚠️  Admin user not found!');
      console.error('   Run: node create-admin.js first\n');
    }
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate cryptographically strong password
 * - 16 characters
 * - Uppercase, lowercase, numbers, special chars
 * - Meets OWASP guidelines
 */
function generateStrongPassword() {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const all = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill rest with random characters
  for (let i = 4; i < 16; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Run if called directly
if (require.main === module) {
  resetAdminPassword();
}

module.exports = { resetAdminPassword };
