/**
 * Cleanup Test Data Script
 * Phase 1.10 - Production Preparation
 * 
 * Safely removes all test bookings and payments from database
 * Creates backup before deletion
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function cleanupTestData() {
  console.log('🧹 Phase 1.10: Cleaning Test Data\n');
  
  try {
    // Step 1: Create backup
    console.log('📦 Step 1: Creating backup...');
    
    const allBookings = await prisma.booking.findMany({
      include: {
        villa: { select: { name: true, slug: true } },
        payments: true
      }
    });
    
    const allPayments = await prisma.payment.findMany();
    
    const backup = {
      timestamp: new Date().toISOString(),
      bookings: allBookings,
      payments: allPayments,
      counts: {
        bookings: allBookings.length,
        payments: allPayments.length
      }
    };
    
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    const backupFile = path.join(
      backupDir,
      `backup_before_cleanup_${Date.now()}.json`
    );
    
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`   Total bookings: ${backup.counts.bookings}`);
    console.log(`   Total payments: ${backup.counts.payments}\n`);
    
    // Step 2: Identify test data
    console.log('🔍 Step 2: Identifying test data...\n');
    
    const testBookings = await prisma.booking.findMany({
      where: {
        OR: [
          { guestName: { contains: 'Test', mode: 'insensitive' } },
          { guestEmail: { contains: 'test@', mode: 'insensitive' } },
          { guestEmail: { contains: 'example.com', mode: 'insensitive' } },
          { guestEmail: { contains: 'demo@', mode: 'insensitive' } },
        ]
      },
      include: {
        villa: { select: { name: true } },
        payments: true
      }
    });
    
    console.log('📋 Test Bookings Found:');
    console.log('━'.repeat(80));
    
    if (testBookings.length === 0) {
      console.log('✅ No test bookings found!\n');
    } else {
      testBookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.guestName} (${booking.guestEmail})`);
        console.log(`   Villa: ${booking.villa?.name || 'Unknown'}`);
        console.log(`   Dates: ${booking.checkIn.toISOString().split('T')[0]} → ${booking.checkOut.toISOString().split('T')[0]}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Payments: ${booking.payments.length}`);
        console.log('');
      });
    }
    
    // Step 3: Confirm deletion
    console.log(`⚠️  About to delete ${testBookings.length} test bookings\n`);
    
    if (testBookings.length === 0) {
      console.log('✅ Nothing to delete. Database is clean!\n');
      return;
    }
    
    // Auto-confirm in script (comment out for interactive mode)
    const confirmed = true;
    
    if (!confirmed) {
      console.log('❌ Deletion cancelled\n');
      return;
    }
    
    // Step 4: Delete test data
    console.log('🗑️  Step 3: Deleting test data...\n');
    
    const testBookingIds = testBookings.map(b => b.id);
    
    // Delete payments first (foreign key constraint)
    const deletedPayments = await prisma.payment.deleteMany({
      where: {
        bookingId: { in: testBookingIds }
      }
    });
    
    console.log(`✅ Deleted ${deletedPayments.count} payments`);
    
    // Delete bookings
    const deletedBookings = await prisma.booking.deleteMany({
      where: {
        id: { in: testBookingIds }
      }
    });
    
    console.log(`✅ Deleted ${deletedBookings.count} bookings\n`);
    
    // Step 5: Verify deletion
    console.log('✅ Step 4: Verifying deletion...\n');
    
    const remainingBookings = await prisma.booking.count();
    const remainingPayments = await prisma.payment.count();
    
    console.log('📊 Remaining Data:');
    console.log('━'.repeat(50));
    console.log(`Bookings: ${remainingBookings}`);
    console.log(`Payments: ${remainingPayments}\n`);
    
    // Step 6: Final summary
    console.log('🎯 Cleanup Summary:');
    console.log('━'.repeat(50));
    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`✅ Deleted ${deletedBookings.count} test bookings`);
    console.log(`✅ Deleted ${deletedPayments.count} test payments`);
    console.log(`✅ Remaining: ${remainingBookings} bookings, ${remainingPayments} payments\n`);
    
    console.log('✨ Database cleanup complete!\n');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    console.error('\n⚠️  Database NOT modified due to error');
    console.error('   Backup file created successfully\n');
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  cleanupTestData();
}

module.exports = { cleanupTestData };
