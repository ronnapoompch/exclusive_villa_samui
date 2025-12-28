const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkMonthlyPricing() {
  try {
    // Check Anzhu Serenity (EXVLSM0003)
    const villa = await prisma.villa.findFirst({
      where: { slug: 'anzhu-serenity' }
    })
    
    if (!villa) {
      console.log('Villa not found')
      return
    }
    
    const pricing = await prisma.villaPricing.findMany({
      where: { 
        villaId: villa.id,
        year: 2025 
      },
      orderBy: { month: 'asc' }
    })
    
    console.log('🏠 Anzhu Serenity - 2025 Pricing:')
    console.log('=' .repeat(60))
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    pricing.forEach(p => {
      const daily = Number(p.dailyRate || 0).toLocaleString()
      const monthly = Number(p.monthlyRate || 0).toLocaleString()
      console.log(`${monthNames[p.month - 1]}: ฿${daily}/night + ฿${monthly}/month`)
    })
    
    console.log('=' .repeat(60))
    
    // Check other monthly villas
    const monthlyVillas = await prisma.villaPricing.findMany({
      where: { 
        year: 2025,
        month: 12,
        monthlyRate: { gt: 0 }
      },
      include: { villa: true }
    })
    
    console.log(`\n📊 ${monthlyVillas.length} villas with monthly rates in December:\n`)
    monthlyVillas.slice(0, 10).forEach(p => {
      const monthly = Number(p.monthlyRate).toLocaleString()
      console.log(`${p.villa.name}: ฿${monthly}/month`)
    })
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkMonthlyPricing()
