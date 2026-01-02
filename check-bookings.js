const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkBookings() {
  try {
    console.log('🔍 Checking bookings in database...\n')

    // Get all bookings
    const bookings = await prisma.booking.findMany({
      include: {
        villa: {
          select: {
            name: true,
            slug: true
          }
        },
        payments: {
          select: {
            status: true,
            amount: true,
            transactionId: true,
            paymentIntentId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Total bookings: ${bookings.length}\n`)

    if (bookings.length === 0) {
      console.log('❌ No bookings found in database')
      console.log('\nThis could mean:')
      console.log('1. No one has made a booking yet')
      console.log('2. Webhook is not working')
      console.log('3. Payment integration needs testing')
      return
    }

    // Show summary by status
    const statusCount = bookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1
      return acc
    }, {})

    console.log('📈 Status Summary:')
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`)
    })
    console.log('')

    // Show last 5 bookings
    console.log('📝 Last 5 Bookings:\n')
    bookings.slice(0, 5).forEach((booking, index) => {
      console.log(`${index + 1}. Booking ${booking.bookingReference}`)
      console.log(`   Villa: ${booking.villa.name}`)
      console.log(`   Guest: ${booking.guestName} (${booking.guestEmail})`)
      console.log(`   Check-in: ${booking.checkIn.toISOString().split('T')[0]}`)
      console.log(`   Check-out: ${booking.checkOut.toISOString().split('T')[0]}`)
      console.log(`   Amount: ฿${Number(booking.totalAmount).toLocaleString()}`)
      console.log(`   Status: ${booking.status}`)
      console.log(`   Created: ${booking.createdAt.toISOString()}`)
      
      if (booking.payments.length > 0) {
        const payment = booking.payments[0]
        console.log(`   Payment Status: ${payment.status}`)
        console.log(`   Payment Intent: ${payment.paymentIntentId}`)
        if (payment.transactionId) {
          console.log(`   Transaction ID: ${payment.transactionId}`)
        }
      } else {
        console.log(`   ⚠️ No payment record found`)
      }
      console.log('')
    })

    // Check for bookings without payment
    const bookingsWithoutPayment = bookings.filter(b => b.payments.length === 0)
    if (bookingsWithoutPayment.length > 0) {
      console.log(`⚠️ Warning: ${bookingsWithoutPayment.length} booking(s) without payment record`)
    }

    // Check webhook status
    const recentBookings = bookings.filter(b => {
      const hoursSinceCreated = (Date.now() - b.createdAt.getTime()) / 1000 / 60 / 60
      return hoursSinceCreated < 24
    })

    console.log(`\n✅ Bookings in last 24 hours: ${recentBookings.length}`)

  } catch (error) {
    console.error('❌ Error checking bookings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBookings()
