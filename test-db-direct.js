const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDirect() {
  try {
    console.log('🔍 Testing Database Direct Query...\n');

    // หา villa
    const villa = await prisma.villa.findFirst({
      where: {
        name: {
          contains: '5 Stars beachfront'
        }
      }
    });

    if (!villa) {
      console.log('❌ Villa not found');
      return;
    }

    console.log(`✅ Found: ${villa.name}`);
    console.log(`   ID: ${villa.id}\n`);

    // ดู blocked dates
    const blocked = await prisma.blockedDate.findMany({
      where: {
        villaId: villa.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`📅 Blocked Dates: ${blocked.length} dates`);
    blocked.forEach(b => {
      console.log(`   ${b.date.toISOString().split('T')[0]}: ${b.reason || 'No reason'} (${b.source})`);
    });

    // ทดสอบเช็คว่า Oct 29 blocked หรือไม่
    console.log('\n🧪 Testing Oct 29, 2025...');
    const checkDate = new Date('2025-10-29T00:00:00.000Z'); // Use UTC
    
    console.log(`   Looking for: ${checkDate.toISOString()}`);
    
    const isBlocked = await prisma.blockedDate.findFirst({
      where: {
        villaId: villa.id,
        date: checkDate
      }
    });

    if (isBlocked) {
      console.log(`❌ Oct 29 is BLOCKED`);
      console.log(`   Stored date: ${isBlocked.date.toISOString()}`);
      console.log(`   Reason: ${isBlocked.reason || 'No reason'}`);
      console.log(`   Source: ${isBlocked.source}`);
    } else {
      console.log(`✅ Oct 29 is AVAILABLE`);
      console.log(`   (No exact match found)`);
    }

    // ทดสอบเช็คช่วง Oct 27 - Nov 2
    console.log('\n🧪 Testing Range Oct 27 - Nov 2...');
    const rangeBlocked = await prisma.blockedDate.findMany({
      where: {
        villaId: villa.id,
        date: {
          gte: new Date('2025-10-27'),
          lte: new Date('2025-11-02')
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`Found ${rangeBlocked.length} blocked dates in range:`);
    rangeBlocked.forEach(b => {
      console.log(`   ${b.date.toISOString().split('T')[0]}`);
    });

    console.log('\n✅ Direct database test complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDirect();
