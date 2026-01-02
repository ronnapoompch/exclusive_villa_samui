const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createMultipleTestBookings() {
  try {
    console.log('🔧 Creating multiple test bookings...\n')

    // Get active villas
    const villas = await prisma.villa.findMany({
      where: { active: true },
      take: 5
    })

    if (villas.length === 0) {
      console.log('❌ No active villas found')
      return
    }

    console.log(`✅ Found ${villas.length} villas\n`)

    // Test data
    const guests = [
      { name: 'John Smith', email: 'john.smith@example.com', phone: '+66812345671' },
      { name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '+66812345672' },
      { name: 'Michael Chen', email: 'michael.chen@example.com', phone: '+66812345673' },
      { name: 'Emma Williams', email: 'emma.w@example.com', phone: '+66812345674' },
      { name: 'David Brown', email: 'david.brown@example.com', phone: '+66812345675' },
      { name: 'Lisa Anderson', email: 'lisa.a@example.com', phone: '+66812345676' },
      { name: 'James Wilson', email: 'james.w@example.com', phone: '+66812345677' },
      { name: 'Maria Garcia', email: 'maria.g@example.com', phone: '+66812345678' },
      { name: 'Robert Taylor', email: 'robert.t@example.com', phone: '+66812345679' },
      { name: 'Jennifer Lee', email: 'jennifer.l@example.com', phone: '+66812345680' },
      { name: 'Thomas Martin', email: 'thomas.m@example.com', phone: '+66812345681' },
      { name: 'Anna Rodriguez', email: 'anna.r@example.com', phone: '+66812345682' },
      { name: 'Daniel White', email: 'daniel.w@example.com', phone: '+66812345683' },
      { name: 'Sophie Clark', email: 'sophie.c@example.com', phone: '+66812345684' },
      { name: 'Mark Thompson', email: 'mark.t@example.com', phone: '+66812345685' }
    ]

    const statuses = ['PENDING', 'CONFIRMED', 'CANCELLED']
    const amounts = [45000, 58000, 62000, 78000, 95000, 120000, 150000]

    let createdCount = 0

    // Create 15 bookings with different dates
    for (let i = 0; i < 15; i++) {
      const guest = guests[i]
      const villa = villas[i % villas.length]
      const status = statuses[i % 3]
      const amount = amounts[i % amounts.length]
      
      // Vary check-in dates
      const daysOffset = 10 + (i * 5)
      const checkIn = new Date()
      checkIn.setDate(checkIn.getDate() + daysOffset)
      
      const checkOut = new Date(checkIn)
      checkOut.setDate(checkOut.getDate() + (3 + (i % 5)))

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          villaId: villa.id,
          guestName: guest.name,
          guestEmail: guest.email,
          guestPhone: guest.phone,
          checkIn,
          checkOut,
          guests: 2 + (i % 6),
          totalAmount: amount,
          status,
          specialRequests: i % 3 === 0 ? 'Early check-in requested' : null
        }
      })

      // Create payment
      const paymentStatus = status === 'CANCELLED' ? 'REFUNDED' : (status === 'CONFIRMED' ? 'PAID' : 'PENDING')
      
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: amount,
          currency: 'THB',
          status: paymentStatus,
          paymentIntentId: `pi_test_${Date.now()}_${i}`,
          transactionId: status === 'PENDING' ? null : `txn_${Date.now()}_${i}`,
          paymentMethod: 'TEST'
        }
      })

      createdCount++
      console.log(`✅ ${createdCount}. ${guest.name} - ${villa.name} - ${status}`)
    }

    console.log(`\n🎉 Created ${createdCount} test bookings!\n`)
    console.log('📊 Summary:')
    console.log(`   PENDING: ${statuses.filter(s => s === 'PENDING').length * 5}`)
    console.log(`   CONFIRMED: ${statuses.filter(s => s === 'CONFIRMED').length * 5}`)
    console.log(`   CANCELLED: ${statuses.filter(s => s === 'CANCELLED').length * 5}`)
    console.log('\n🌐 Go to: http://localhost:3000/admin/bookings')
    console.log('   Test pagination (page 1, 2)')
    console.log('   Test filters (All, Pending, Confirmed, Cancelled)')
    console.log('   Test search (try: "John", "Sarah", villa names)')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createMultipleTestBookings()
