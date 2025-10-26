const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVillaPricing() {
  try {
    console.log('🔍 Checking Villa Pricing...\n');

    // หา villa
    const villa = await prisma.villa.findFirst({
      where: {
        name: {
          contains: '5 Stars beachfront'
        }
      },
      include: {
        pricing: {
          orderBy: [
            { year: 'asc' },
            { month: 'asc' }
          ]
        }
      }
    });

    if (!villa) {
      console.log('❌ Villa not found');
      return;
    }

    console.log(`✅ Villa: ${villa.name}`);
    console.log(`   Airbnb URL: ${villa.airbnbUrl || 'Not set'}\n`);

    if (villa.pricing.length === 0) {
      console.log('❌ No pricing data found');
      console.log('💡 Need to add pricing data to VillaPricing table\n');
      
      console.log('Example pricing structure:');
      console.log('- Daily Rate: THB per night');
      console.log('- Weekly Rate: THB per week (optional)');
      console.log('- Monthly Rate: THB per month (optional)');
      console.log('- Can set different rates for different months/years');
    } else {
      console.log(`📊 Found ${villa.pricing.length} pricing records:\n`);
      
      villa.pricing.forEach(p => {
        const monthName = new Date(2000, p.month - 1).toLocaleString('en', { month: 'long' });
        console.log(`${monthName} ${p.year || 'All Years'}:`);
        if (p.dailyRate) console.log(`  Daily: ${Number(p.dailyRate).toLocaleString()} ${p.currency}`);
        if (p.weeklyRate) console.log(`  Weekly: ${Number(p.weeklyRate).toLocaleString()} ${p.currency}`);
        if (p.monthlyRate) console.log(`  Monthly: ${Number(p.monthlyRate).toLocaleString()} ${p.currency}`);
        console.log();
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVillaPricing();
