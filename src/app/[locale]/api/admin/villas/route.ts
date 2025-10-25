import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get villas with booking count and latest pricing
    const villas = await prisma.villa.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      villas
    })
  } catch (error) {
    console.error('Error fetching villas:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    const {
      name,
      description,
      pricePerNight,
      maxGuests,
      bedrooms,
      bathrooms,
      location,
      amenities = [],
      images = []
    } = data

    if (!name || !description || !pricePerNight || !maxGuests || !bedrooms || !bathrooms || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingVilla = await prisma.villa.findUnique({
      where: { slug }
    })

    const finalSlug = existingVilla 
      ? `${slug}-${Date.now()}`
      : slug

    // Create villa
    const villa = await prisma.villa.create({
      data: {
        name,
        slug: finalSlug,
        description,
        maxGuests: parseInt(maxGuests),
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        location,
        amenities,
        images,
        active: true
      }
    })

    // Create default pricing for current month
    await prisma.villaPricing.create({
      data: {
        villaId: villa.id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        dailyRate: BigInt(Math.round(parseFloat(pricePerNight))),
        currency: 'THB'
      }
    })

    return NextResponse.json({
      success: true,
      villa
    })
  } catch (error) {
    console.error('Error creating villa:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
