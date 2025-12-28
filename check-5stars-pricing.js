const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPricing() {
  const villa = await prisma.villa.findUnique({
    where: { slug: '5-stars-beachfront-villa' },
    include: { 
      pricing: { 
        where: { month: 12, year: 2025 } 
      } 
    }
  });

  console.log('Villa found:', !!villa);
  console.log('Villa ID:', villa?.id);
  console.log('Pricing records:', villa?.pricing?.length || 0);
  
  if (villa?.pricing && villa.pricing.length > 0) {
    console.log('December pricing:', {
      dailyRate: villa.pricing[0].dailyRate?.toString(),
      weeklyRate: villa.pricing[0].weeklyRate?.toString(),
      monthlyRate: villa.pricing[0].monthlyRate?.toString()
    });
  } else {
    console.log('NO DECEMBER PRICING');
    
    // Check all pricing
    const allPricing = await prisma.villaPricing.findMany({
      where: { villaId: villa?.id }
    });
    console.log('Total pricing records:', allPricing.length);
    if (allPricing.length > 0) {
      console.log('Sample:', {
        month: allPricing[0].month,
        year: allPricing[0].year,
        dailyRate: allPricing[0].dailyRate?.toString()
      });
    }
  }
  
  await prisma.$disconnect();
}

checkPricing();
