const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateVillaPricing() {
  try {
    console.log('💰 Updating Villa Pricing from Airbnb Data\n');
    console.log('='.repeat(60) + '\n');

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

    console.log(`✅ Villa: ${villa.name}`);
    console.log(`   ID: ${villa.id}\n`);

    // Pricing from Airbnb calendar (from screenshot)
    console.log('📊 Airbnb Pricing Schedule:\n');
    console.log('   Standard Rate: ฿28,608/night');
    console.log('     - October 2025');
    console.log('     - November 1-23, 2025');
    console.log('     - December 1-23, 2025');
    console.log('');
    console.log('   High Season Rate: ฿35,760/night');
    console.log('     - November 24-30, 2025');
    console.log('     - December 24-31, 2025');
    console.log('');

    // Update November 2025 (Standard Rate)
    const nov2025 = await prisma.villaPricing.upsert({
      where: {
        villaId_month_year: {
          villaId: villa.id,
          month: 11,
          year: 2025
        }
      },
      create: {
        villaId: villa.id,
        month: 11,
        year: 2025,
        dailyRate: BigInt(28608),
        weeklyRate: BigInt(Math.round(28608 * 7 * 0.9)),
        monthlyRate: BigInt(Math.round(28608 * 30 * 0.75)),
        currency: 'THB'
      },
      update: {
        dailyRate: BigInt(28608),
        weeklyRate: BigInt(Math.round(28608 * 7 * 0.9)),
        monthlyRate: BigInt(Math.round(28608 * 30 * 0.75))
      }
    });

    console.log('✅ November 2025 Pricing Updated:');
    console.log(`   Daily: ฿${Number(nov2025.dailyRate).toLocaleString()}`);
    console.log(`   Weekly: ฿${Number(nov2025.weeklyRate).toLocaleString()} (10% off)`);
    console.log(`   Monthly: ฿${Number(nov2025.monthlyRate).toLocaleString()} (25% off)`);
    console.log('');

    // Update December 2025 (High Season Rate)
    const dec2025 = await prisma.villaPricing.upsert({
      where: {
        villaId_month_year: {
          villaId: villa.id,
          month: 12,
          year: 2025
        }
      },
      create: {
        villaId: villa.id,
        month: 12,
        year: 2025,
        dailyRate: BigInt(35760),
        weeklyRate: BigInt(Math.round(35760 * 7 * 0.9)),
        monthlyRate: BigInt(Math.round(35760 * 30 * 0.75)),
        currency: 'THB'
      },
      update: {
        dailyRate: BigInt(35760),
        weeklyRate: BigInt(Math.round(35760 * 7 * 0.9)),
        monthlyRate: BigInt(Math.round(35760 * 30 * 0.75))
      }
    });

    console.log('✅ December 2025 Pricing Updated (High Season):');
    console.log(`   Daily: ฿${Number(dec2025.dailyRate).toLocaleString()}`);
    console.log(`   Weekly: ฿${Number(dec2025.weeklyRate).toLocaleString()} (10% off)`);
    console.log(`   Monthly: ฿${Number(dec2025.monthlyRate).toLocaleString()} (25% off)`);
    console.log('');

    // Verify
    const allPricing = await prisma.villaPricing.findMany({
      where: {
        villaId: villa.id
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' }
      ]
    });

    console.log('='.repeat(60));
    console.log('📋 All Villa Pricing:\n');
    allPricing.forEach(p => {
      const monthName = new Date(p.year || 2025, p.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
      console.log(`${monthName}:`);
      console.log(`   Daily: ฿${Number(p.dailyRate).toLocaleString()}`);
      if (p.weeklyRate) console.log(`   Weekly: ฿${Number(p.weeklyRate).toLocaleString()}`);
      if (p.monthlyRate) console.log(`   Monthly: ฿${Number(p.monthlyRate).toLocaleString()}`);
      console.log('');
    });

    console.log('✅ Pricing update complete!');
    console.log('\n💡 Prices are now stored in database and will be used for booking calculations');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateVillaPricing();
