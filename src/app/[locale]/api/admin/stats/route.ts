import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get stats in parallel
    const [
      totalVillas,
      activeVillas,
      totalBookings,
      paidBookings,
      totalRevenue,
    ] = await Promise.all([
      prisma.villa.count(),
      prisma.villa.count({ where: { active: true } }),
      prisma.booking.count(),
      prisma.booking.findMany({
        where: { paymentStatus: 'PAID' },
        select: { totalAmount: true }
      }),
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true }
      })
    ])

    // Calculate average booking value
    const avgBookingValue = paidBookings.length > 0 
      ? paidBookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0) / paidBookings.length 
      : 0

    // Calculate occupancy rate (simplified - you may want to make this more sophisticated)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    
    const monthlyBookings = await prisma.booking.count({
      where: {
        checkIn: {
          gte: new Date(currentYear, currentMonth, 1),
          lt: new Date(currentYear, currentMonth + 1, 1)
        }
      }
    })

    const occupancyRate = activeVillas > 0 
      ? Math.round((monthlyBookings / (activeVillas * daysInMonth)) * 100) 
      : 0

    const stats = {
      totalVillas,
      activeVillas,
      totalBookings,
      totalRevenue: Number(totalRevenue._sum?.totalAmount || 0),
      avgBookingValue: Math.round(avgBookingValue),
      occupancyRate: Math.min(occupancyRate, 100) // Cap at 100%
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
