// cleanup-payments.js - ทำความสะอาดข้อมูล payment
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupPayments() {
  try {
    console.log('🧹 === ทำความสะอาดข้อมูล Payment === 🧹\n');
    
    // ตรวจสอบข้อมูล payment ที่มีอยู่
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          select: { id: true, guestName: true }
        }
      }
    });
    
    console.log(`📊 พบข้อมูล Payment: ${payments.length} รายการ`);
    
    if (payments.length > 0) {
      console.log('📋 รายการ Payment:');
      payments.forEach((payment, index) => {
        console.log(`  ${index + 1}. ID: ${payment.id} | Booking: ${payment.booking.guestName} | Amount: ${payment.amount} ${payment.currency}`);
      });
      
      console.log('\n🗑️ ลบข้อมูล Payment ทั้งหมด...');
      await prisma.payment.deleteMany({});
      console.log('✅ ลบข้อมูล Payment เสร็จสิ้น');
    }
    
    // ตรวจสอบข้อมูล booking
    const bookings = await prisma.booking.findMany({
      select: { id: true, guestName: true, status: true, paymentStatus: true }
    });
    
    console.log(`\n📊 พบข้อมูล Booking: ${bookings.length} รายการ`);
    
    if (bookings.length > 0) {
      console.log('📋 รายการ Booking:');
      bookings.slice(0, 5).forEach((booking, index) => {
        console.log(`  ${index + 1}. ${booking.guestName} | Status: ${booking.status} | Payment: ${booking.paymentStatus}`);
      });
      
      if (bookings.length > 5) {
        console.log(`  ... และอีก ${bookings.length - 5} รายการ`);
      }
    }
    
    console.log('\n✅ ทำความสะอาดเสร็จสิ้น! พร้อม migrate ได้แล้ว');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupPayments();