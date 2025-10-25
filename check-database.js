const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBookings() {
  try {
    const bookings = await prisma.booking.findMany({ take: 3 });
    console.log('📋 Existing Bookings:', JSON.stringify(bookings, null, 2));
    
    // Also check villas
    const villas = await prisma.villa.findMany({ 
      take: 3,
      select: { id: true, name: true, slug: true }
    });
    console.log('🏡 Existing Villas:', JSON.stringify(villas, null, 2));
    
  } catch (error) {
    console.error('Database Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkBookings();