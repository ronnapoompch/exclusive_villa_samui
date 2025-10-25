import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const villa = await prisma.villa.findUnique({
      where: { id: params.id },
      include: {
        pricing: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })

    if (!villa) {
      return NextResponse.json({ error: 'Villa not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      villa
    })
  } catch (error) {
    console.error('Error fetching villa:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      name,
      description,
      pricePerNight,
      maxGuests,
      bedrooms,
      bathrooms,
      location,
      amenities = [],
      images = [],
      active
    } = data

    // Update villa
    const villa = await prisma.villa.update({
      where: { id: params.id },
      data: {
        name,
        description,
        maxGuests: maxGuests ? parseInt(maxGuests) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        location,
        amenities,
        images,
        active: active !== undefined ? active : undefined
      }
    })

    // Update pricing if provided
    if (pricePerNight) {
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()

      await prisma.villaPricing.upsert({
        where: {
          villaId_month_year: {
            villaId: villa.id,
            month: currentMonth,
            year: currentYear
          }
        },
        create: {
          villaId: villa.id,
          month: currentMonth,
          year: currentYear,
          dailyRate: BigInt(Math.round(parseFloat(pricePerNight))),
          currency: 'THB'
        },
        update: {
          dailyRate: BigInt(Math.round(parseFloat(pricePerNight)))
        }
      })
    }

    return NextResponse.json({
      success: true,
      villa
    })
  } catch (error) {
    console.error('Error updating villa:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if villa has bookings
    const bookingCount = await prisma.booking.count({
      where: { villaId: params.id }
    })

    if (bookingCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete villa with existing bookings. Deactivate instead.' },
        { status: 400 }
      )
    }

    // Delete villa (pricing will be deleted automatically due to cascade)
    await prisma.villa.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Villa deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting villa:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}