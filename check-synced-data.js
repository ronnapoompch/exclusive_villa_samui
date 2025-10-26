const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSyncedData() {
  try {
    console.log('📊 Checking Synced Airbnb Data\n');

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

    console.log(`✅ Villa: ${villa.name}\n`);

    // Get all blocked dates grouped by source
    const allBlocked = await prisma.blockedDate.findMany({
      where: {
        villaId: villa.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    const bySource = {};
    allBlocked.forEach(b => {
      const source = b.source || 'Unknown';
      if (!bySource[source]) bySource[source] = [];
      bySource[source].push(b);
    });

    console.log('📅 Blocked Dates by Source:\n');
    Object.keys(bySource).forEach(source => {
      console.log(`${source}: ${bySource[source].length} dates`);
    });

    // December bookings
    console.log('\n📅 December 2025 Bookings (from Airbnb):\n');
    const decemberBlocked = allBlocked.filter(b => {
      const date = new Date(b.date);
      return date.getMonth() === 11 && date.getFullYear() === 2025 && b.source === 'Airbnb';
    });

    const decemberDates = [...new Set(decemberBlocked.map(b => 
      b.date.toISOString().split('T')[0]
    ))].sort();

    decemberDates.forEach(date => {
      const blocked = decemberBlocked.find(b => 
        b.date.toISOString().split('T')[0] === date
      );
      console.log(`   ❌ ${date} - ${blocked.reason}`);
    });

    console.log(`\n📊 Total December blocked: ${decemberDates.length} days`);
    console.log(`📊 Total all blocked: ${allBlocked.length} dates`);

    // November bookings
    console.log('\n📅 November 2025 Bookings:\n');
    const novemberBlocked = allBlocked.filter(b => {
      const date = new Date(b.date);
      return date.getMonth() === 10 && date.getFullYear() === 2025;
    });

    const novemberBySource = {};
    novemberBlocked.forEach(b => {
      const source = b.source || 'Unknown';
      if (!novemberBySource[source]) novemberBySource[source] = [];
      novemberBySource[source].push(b.date.toISOString().split('T')[0]);
    });

    Object.keys(novemberBySource).forEach(source => {
      const dates = [...new Set(novemberBySource[source])].sort();
      console.log(`${source}:`);
      dates.forEach(date => console.log(`   ❌ ${date}`));
      console.log();
    });

    console.log('✅ Data check complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSyncedData();
