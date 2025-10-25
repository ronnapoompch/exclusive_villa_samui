import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      include: {
        villa: {
          select: {
            name: true,
            location: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Create CSV content
    const csvHeader = [
      'Booking ID',
      'Customer Name', 
      'Customer Email',
      'Customer Phone',
      'Villa Name',
      'Villa Location',
      'Check In',
      'Check Out',
      'Guests',
      'Total Amount',
      'Payment Status',
      'Special Requests',
      'Booking Date'
    ].join(',')

    const csvRows = bookings.map(booking => [
      booking.id,
      `"${booking.guestName}"`,
      booking.guestEmail,
      booking.guestPhone || '',
      `"${booking.villa.name}"`,
      `"${booking.villa.location}"`,
      new Date(booking.checkIn).toLocaleDateString(),
      new Date(booking.checkOut).toLocaleDateString(),
      booking.guests,
      Number(booking.totalAmount),
      booking.paymentStatus,
      `"${booking.specialRequests || ''}"`,
      new Date(booking.createdAt).toLocaleDateString()
    ].join(','))

    const csvContent = [csvHeader, ...csvRows].join('\n')

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=bookings-${new Date().toISOString().split('T')[0]}.csv`
      }
    })
  } catch (error) {
    console.error('Error exporting bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}