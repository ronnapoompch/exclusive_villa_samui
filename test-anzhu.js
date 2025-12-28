const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAnzhu() {
  try {
    const villa = await prisma.villa.findFirst({
      where: { slug: 'anzhu-serenity' }
    })
    
    const dec = await prisma.villaPricing.findFirst({
      where: { 
        villaId: villa.id,
        month: 12,
        year: 2025
      }
    })
    
    console.log('🏠 Anzhu Serenity - December 2025:')
    console.log('='.repeat(60))
    console.log('dailyRate:', dec.dailyRate.toString())
    console.log('monthlyRate:', dec.monthlyRate?.toString() || 'null')
    console.log('='.repeat(60))
    
    console.log('\n📊 Logic check:')
    const daily = Number(dec.dailyRate)
    const monthly = Number(dec.monthlyRate || 0)
    console.log(`daily: ${daily}`)
    console.log(`monthly: ${monthly}`)
    console.log(`monthly > 0: ${monthly > 0}`)
    console.log(`daily === 0: ${daily === 0}`)
    console.log(`Should show monthly grid: ${monthly > 0 && daily === 0}`)
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkAnzhu()
