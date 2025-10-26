// Test blocked dates system with sample data
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBlockedDates() {
  console.log('🧪 Testing Blocked Dates System\n');
  
  try {
    // 1. Find villa
    const villa = await prisma.villa.findUnique({
      where: { slug: '5-stars-beachfront-villa' }
    });
    
    if (!villa) {
      console.log('❌ Villa not found');
      return;
    }
    
    console.log(`✅ Found villa: ${villa.name}\n`);
    
    // 2. Create test blocked dates
    console.log('📅 Creating test blocked dates...');
    
    const today = new Date();
    const testDates = [];
    
    // Block next 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      testDates.push({
        villaId: villa.id,
        date: date,
        reason: 'Test booking',
        source: 'Test'
      });
    }
    
    // Clear old test data
    await prisma.blockedDate.deleteMany({
      where: {
        villaId: villa.id,
        source: 'Test'
      }
    });
    
    // Insert test dates
    const result = await prisma.blockedDate.createMany({
      data: testDates,
      skipDuplicates: true
    });
    
    console.log(`✅ Created ${result.count} blocked dates\n`);
    
    // 3. Query blocked dates
    console.log('🔍 Querying blocked dates...\n');
    
    const blockedDates = await prisma.blockedDate.findMany({
      where: { villaId: villa.id },
      include: { villa: { select: { name: true } } },
      orderBy: { date: 'asc' },
      take: 10
    });
    
    console.log(`📊 Found ${blockedDates.length} blocked dates:\n`);
    
    blockedDates.forEach((blocked, i) => {
      const dateStr = blocked.date.toISOString().split('T')[0];
      console.log(`   ${i + 1}. ${dateStr} - ${blocked.reason} (${blocked.source})`);
    });
    
    // 4. Check availability function
    console.log('\n🔍 Testing availability check...\n');
    
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + 3); // Check 3 days from now
    
    const isBlocked = await prisma.blockedDate.findFirst({
      where: {
        villaId: villa.id,
        date: {
          gte: new Date(checkDate.setHours(0, 0, 0, 0)),
          lt: new Date(checkDate.setHours(23, 59, 59, 999))
        }
      }
    });
    
    const checkDateStr = checkDate.toISOString().split('T')[0];
    
    if (isBlocked) {
      console.log(`❌ ${checkDateStr} is BLOCKED (${isBlocked.reason})`);
    } else {
      console.log(`✅ ${checkDateStr} is AVAILABLE`);
    }
    
    // 5. Get available date range
    console.log('\n📅 Finding next available dates...\n');
    
    const allBlockedDates = await prisma.blockedDate.findMany({
      where: {
        villaId: villa.id,
        date: { gte: today }
      },
      orderBy: { date: 'asc' },
      select: { date: true }
    });
    
    const blockedDateSet = new Set(
      allBlockedDates.map(d => d.date.toISOString().split('T')[0])
    );
    
    let availableCount = 0;
    let checkingDate = new Date(today);
    const availableDates = [];
    
    for (let i = 0; i < 30 && availableCount < 5; i++) {
      checkingDate.setDate(today.getDate() + i);
      const dateStr = checkingDate.toISOString().split('T')[0];
      
      if (!blockedDateSet.has(dateStr)) {
        availableDates.push(dateStr);
        availableCount++;
      }
    }
    
    console.log('Next 5 available dates:');
    availableDates.forEach((date, i) => {
      console.log(`   ${i + 1}. ${date} ✅`);
    });
    
    // 6. Stats
    console.log('\n📊 Statistics:\n');
    
    const stats = await prisma.blockedDate.groupBy({
      by: ['source'],
      where: { villaId: villa.id },
      _count: { source: true }
    });
    
    console.log('Blocked dates by source:');
    stats.forEach(stat => {
      console.log(`   ${stat.source}: ${stat._count.source} dates`);
    });
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testBlockedDates();
