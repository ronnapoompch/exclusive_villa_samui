const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDirectBooking() {
  try {
    console.log('📝 Adding Direct Booking to System...\n');

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

    console.log(`✅ Villa: ${villa.name} (${villa.id})\n`);

    // สร้าง blocked dates สำหรับ 13-15 พฤศจิกายน 2025
    const dates = [
      new Date('2025-11-13T00:00:00Z'),
      new Date('2025-11-14T00:00:00Z'),
      new Date('2025-11-15T00:00:00Z')
    ];

    console.log('📅 Adding blocked dates for direct booking:');
    
    for (const date of dates) {
      const blocked = await prisma.blockedDate.upsert({
        where: {
          villaId_date_source: {
            villaId: villa.id,
            date: date,
            source: 'Direct'
          }
        },
        create: {
          villaId: villa.id,
          date: date,
          reason: 'Direct booking with villa owner',
          source: 'Direct'
        },
        update: {
          reason: 'Direct booking with villa owner'
        }
      });
      
      console.log(`   ✅ ${date.toISOString().split('T')[0]} - Blocked`);
    }

    console.log('\n✅ Direct booking dates added successfully!');
    console.log('\n💡 These dates are now blocked in the system.');
    console.log('   Users cannot book these dates through the website.\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDirectBooking();
