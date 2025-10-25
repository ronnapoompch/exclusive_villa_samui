const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndUpdateAdmin() {
    try {
        console.log('🔍 Checking admin user...');
        
        // Check current admin
        const admin = await prisma.user.findUnique({
            where: { email: 'admin@exclusivevillasamui.com' }
        });
        
        if (!admin) {
            console.log('❌ No admin user found');
            return;
        }
        
        console.log('📋 Current admin details:');
        console.log(`ID: ${admin.id}`);
        console.log(`Email: ${admin.email}`);
        console.log(`Name: ${admin.name}`);
        console.log(`Role: ${admin.role}`);
        console.log(`Active: ${admin.active}`);
        console.log(`Password hash exists: ${admin.password ? 'YES' : 'NO'}`);
        
        // Test both passwords
        const passwords = ['admin123', 'Admin123!'];
        
        for (const pwd of passwords) {
            const isValid = await bcrypt.compare(pwd, admin.password);
            console.log(`🔑 Password "${pwd}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        }
        
        // Update to new password if needed
        console.log('\n🔄 Updating admin password to "Admin123!"...');
        const newHash = await bcrypt.hash('Admin123!', 12);
        
        await prisma.user.update({
            where: { email: 'admin@exclusivevillasamui.com' },
            data: { 
                password: newHash,
                active: true // Make sure admin is active
            }
        });
        
        console.log('✅ Admin password updated successfully!');
        console.log('📧 Email: admin@exclusivevillasamui.com');
        console.log('🔑 Password: Admin123!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAndUpdateAdmin();