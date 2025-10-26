const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupTestData() {
  try {
    console.log('🧹 Cleaning up Test Data\n');

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

    // Delete test data
    const deleted = await prisma.blockedDate.deleteMany({
      where: {
        villaId: villa.id,
        source: 'Test'
      }
    });

    console.log(`🗑️  Deleted ${deleted.count} test blocked dates\n`);

    // Show final state
    const remaining = await prisma.blockedDate.findMany({
      where: {
        villaId: villa.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    const bySource = {};
    remaining.forEach(b => {
      const source = b.source || 'Unknown';
      if (!bySource[source]) bySource[source] = 0;
      bySource[source]++;
    });

    console.log('📊 Final Blocked Dates by Source:');
    Object.keys(bySource).forEach(source => {
      console.log(`   ${source}: ${bySource[source]} dates`);
    });

    console.log(`\n✅ Total: ${remaining.length} blocked dates`);
    console.log('✅ Cleanup complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestData();
