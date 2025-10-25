// Test admin system using database directly
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminDatabase() {
  console.log('🧪 Testing Admin System Database...\n');
  
  try {
    // Test 1: Check villas
    console.log('1. 🏡 Testing Villas...');
    const villas = await prisma.villa.findMany({
      include: {
        pricing: true,
        bookings: true
      },
      take: 3
    });
    
    console.log(`   Found ${villas.length} villas`);
    villas.forEach((villa, index) => {
      console.log(`   ${index + 1}. ${villa.name} (${villa.slug})`);
      console.log(`      Active: ${villa.active}`);
      console.log(`      Bookings: ${villa.bookings.length}`);
      if (villa.pricing.length > 0) {
        console.log(`      Price: ฿${villa.pricing[0].dailyRate}/night`);
      }
    });
    
    // Test 2: Check bookings
    console.log('\n2. 📋 Testing Bookings...');
    const bookings = await prisma.booking.findMany({
      include: {
        villa: true
      },
      take: 5
    });
    
    console.log(`   Found ${bookings.length} bookings`);
    bookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.guestName} - ${booking.villa.name}`);
      console.log(`      Status: ${booking.status}`);
      console.log(`      Total: ฿${booking.totalAmount}`);
      console.log(`      Date: ${booking.checkIn.toDateString()} - ${booking.checkOut.toDateString()}`);
    });
    
    // Test 3: Calculate stats
    console.log('\n3. 📊 Calculating Stats...');
    
    const totalBookings = await prisma.booking.count();
    const totalVillas = await prisma.villa.count();
    const totalUsers = await prisma.user.count();
    
    const revenue = await prisma.booking.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        status: 'CONFIRMED'
      }
    });
    
    const monthlyBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });
    
    console.log(`   Total Villas: ${totalVillas}`);
    console.log(`   Total Bookings: ${totalBookings}`);
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Total Revenue: ฿${revenue._sum.totalAmount || 0}`);
    console.log(`   This Month Bookings: ${monthlyBookings}`);
    
    // Test 4: Test CRUD operations
    console.log('\n4. 🔧 Testing CRUD Operations...');
    
    // Create test villa
    console.log('   Creating test villa...');
    const testVilla = await prisma.villa.create({
      data: {
        name: 'Test Admin Villa',
        slug: 'test-admin-villa',
        description: 'A villa created for testing admin system',
        location: 'Test Location, Samui',
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['WiFi', 'Pool', 'Kitchen'],
        images: ['test1.jpg', 'test2.jpg'],
        active: true,
        pricing: {
          create: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            dailyRate: 5000,
            currency: 'THB'
          }
        }
      }
    });
    console.log(`   ✅ Created villa: ${testVilla.name} (ID: ${testVilla.id})`);
    
    // Update villa
    console.log('   Updating test villa...');
    const updatedVilla = await prisma.villa.update({
      where: { id: testVilla.id },
      data: {
        name: 'Updated Test Admin Villa',
        maxGuests: 6
      }
    });
    console.log(`   ✅ Updated villa: ${updatedVilla.name}, Max Guests: ${updatedVilla.maxGuests}`);
    
    // Delete villa
    console.log('   Deleting test villa...');
    await prisma.villaPricing.deleteMany({
      where: { villaId: testVilla.id }
    });
    await prisma.villa.delete({
      where: { id: testVilla.id }
    });
    console.log(`   ✅ Deleted test villa`);
    
    console.log('\n✅ Admin Database Test Complete!');
    console.log('\n📝 Admin System Features Available:');
    console.log('   • Villa Management (Create, Read, Update, Delete)');
    console.log('   • Booking Management (View, Update Status, Export)');
    console.log('   • User Management');
    console.log('   • Statistics Dashboard');
    console.log('   • Revenue Analytics');
    console.log('   • Export Functions (CSV)');
    
  } catch (error) {
    console.error('❌ Test Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminDatabase();