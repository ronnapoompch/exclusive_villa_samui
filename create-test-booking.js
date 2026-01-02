const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createTestBooking() {
  try {
    console.log('🔧 Creating test booking...\n')

    // Get first active villa
    const villa = await prisma.villa.findFirst({
      where: { active: true }
    })

    if (!villa) {
      console.log('❌ No active villa found')
      return
    }

    console.log(`✅ Using villa: ${villa.name}\n`)

    // Create booking
    const checkIn = new Date('2026-01-15')
    const checkOut = new Date('2026-01-20')
    const totalAmount = 50000 // 50,000 baht

    const booking = await prisma.booking.create({
      data: {
        villaId: villa.id,
        guestName: 'Test Guest',
        guestEmail: 'testguest@example.com',
        guestPhone: '+66812345678',
        checkIn,
        checkOut,
        guests: 4,
        totalAmount,
        status: 'PENDING',
        specialRequests: 'Test booking for development'
      }
    })

    console.log('✅ Booking created successfully!')
    console.log(`   ID: ${booking.id}`)
    console.log(`   Villa: ${villa.name}`)
    console.log(`   Check-in: ${booking.checkIn.toISOString().split('T')[0]}`)
    console.log(`   Check-out: ${booking.checkOut.toISOString().split('T')[0]}`)
    console.log(`   Amount: ฿${Number(booking.totalAmount).toLocaleString()}`)
    console.log(`   Status: ${booking.status}\n`)

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: totalAmount,
        currency: 'THB',
        status: 'PAID',
        paymentIntentId: `pi_test_${Date.now()}`,
        transactionId: `txn_test_${Date.now()}`,
        paymentMethod: 'TEST'
      }
    })

    console.log('✅ Payment record created!')
    console.log(`   Transaction ID: ${payment.transactionId}`)
    console.log(`   Status: ${payment.status}\n`)

    console.log('🎉 Test booking created successfully!')
    console.log('\nNow you can:')
    console.log('1. Go to http://localhost:3000/admin/bookings')
    console.log('2. View the test booking')
    console.log('3. Test status changes')
    console.log('4. Test filters and search')

  } catch (error) {
    console.error('❌ Error creating test booking:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestBooking()
