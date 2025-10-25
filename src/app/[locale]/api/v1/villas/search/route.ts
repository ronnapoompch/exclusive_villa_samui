import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { validateRequest } from '@/lib/api/validate'
import { z } from 'zod'

// Advanced search schema
const villaSearchSchema = z.object({
  // Basic filters
  location: z.string().optional(),
  bedrooms: z.number().min(1).max(20).optional(),
  bathrooms: z.number().min(1).max(20).optional(),
  maxGuests: z.number().min(1).max(50).optional(),
  
  // Price filters
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  currency: z.string().default('THB'),
  
  // Feature filters
  beachfront: z.boolean().optional(),
  featured: z.boolean().optional(),
  petFriendly: z.boolean().optional(),
  
  // Amenity filters
  amenities: z.array(z.string()).optional(),
  
  // Date availability
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  
  // Sorting and pagination
  sortBy: z.enum(['price', 'name', 'bedrooms', 'rating', 'created']).default('created'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
})

/**
 * POST /api/v1/villas/search
 * Advanced villa search with filters and availability checking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = await validateRequest(villaSearchSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: { 
            message: 'Validation failed',
            details: validation.error?.issues
          }
        },
        { status: 400 }
      )
    }

    const {
      location,
      bedrooms,
      bathrooms,
      maxGuests,
      minPrice,
      maxPrice,
      currency,
      beachfront,
      featured,
      petFriendly,
      amenities,
      checkIn,
      checkOut,
      sortBy,
      sortOrder,
      page,
      limit
    } = validation.data!

    const offset = ((page || 1) - 1) * (limit || 12)

    // Build where clause
    const where: any = {
      active: true,
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(bedrooms && { bedrooms: { gte: bedrooms } }),
      ...(bathrooms && { bathrooms: { gte: bathrooms } }),
      ...(maxGuests && { maxGuests: { gte: maxGuests } }),
      ...(beachfront !== undefined && { beachfront }),
      ...(featured !== undefined && { featured }),
      ...(petFriendly !== undefined && { petFriendly }),
      ...(amenities?.length && { 
        amenities: { 
          hasEvery: amenities 
        }
      }),
    }

    // Price filtering
    let priceFilter = {}
    if (minPrice !== undefined || maxPrice !== undefined) {
      priceFilter = {
        some: {
          currency,
          ...(minPrice !== undefined && { dailyRate: { gte: minPrice } }),
          ...(maxPrice !== undefined && { dailyRate: { lte: maxPrice } }),
        }
      }
    }

    // Availability filtering
    let availabilityFilter = {}
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)
      
      // Exclude villas with conflicting bookings
      availabilityFilter = {
        NOT: {
          bookings: {
            some: {
              status: { in: ['PENDING', 'CONFIRMED'] },
              OR: [
                {
                  checkIn: { lte: checkOutDate },
                  checkOut: { gte: checkInDate }
                }
              ]
            }
          }
        }
      }
    }

    // Build orderBy clause
    let orderBy: any
    switch (sortBy) {
      case 'price':
        orderBy = { pricing: { _count: sortOrder } } // Fallback sort
        break
      case 'name':
        orderBy = { name: sortOrder }
        break
      case 'bedrooms':
        orderBy = { bedrooms: sortOrder }
        break
      case 'rating':
        orderBy = { reviews: { _count: sortOrder } } // Sort by review count as proxy
        break
      case 'created':
        orderBy = { createdAt: sortOrder }
        break
      default:
        orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }]
    }

    // Execute search with all filters
    const finalWhere = {
      ...where,
      ...(Object.keys(priceFilter).length > 0 && { pricing: priceFilter }),
      ...availabilityFilter
    }

    const [villas, totalCount] = await Promise.all([
      prisma.villa.findMany({
        where: finalWhere,
        include: {
          pricing: {
            where: { currency },
            take: 1,
            orderBy: { month: 'asc' }
          },
          reviews: {
            where: { verified: true },
            select: {
              rating: true,
            }
          }
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.villa.count({
        where: finalWhere,
      }),
    ])

    // Format response data
    const formattedVillas = villas.map(villa => {
      // Calculate average rating
      const ratings = villa.reviews.map(r => r.rating)
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : null

      return {
        id: villa.id,
        name: villa.name,
        slug: villa.slug,
        description: villa.description,
        bedrooms: villa.bedrooms,
        bathrooms: villa.bathrooms,
        maxGuests: villa.maxGuests,
        beachfront: villa.beachfront,
        location: villa.location,
        images: villa.images,
        amenities: villa.amenities,
        featured: villa.featured,
        petFriendly: villa.petFriendly,
        pricing: villa.pricing.length > 0 ? {
          dailyRate: villa.pricing[0].dailyRate?.toString(),
          weeklyRate: villa.pricing[0].weeklyRate?.toString(),
          monthlyRate: villa.pricing[0].monthlyRate?.toString(),
          currency: villa.pricing[0].currency,
        } : null,
        rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        reviewCount: villa.reviews.length,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        villas: formattedVillas,
        pagination: {
          total: totalCount,
          page: page || 1,
          limit: limit || 12,
          totalPages: Math.ceil(totalCount / (limit || 12)),
          hasMore: (page || 1) * (limit || 12) < totalCount,
        },
        filters: {
          location,
          bedrooms,
          bathrooms,
          maxGuests,
          minPrice,
          maxPrice,
          currency,
          beachfront,
          featured,
          petFriendly,
          amenities,
          checkIn,
          checkOut,
        },
        meta: {
          searchTime: new Date().toISOString(),
          resultsFound: totalCount,
          availabilityChecked: !!(checkIn && checkOut),
        }
      },
    })

  } catch (error) {
    console.error('Villa search error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: { message: 'Internal server error during villa search' }
      },
      { status: 500 }
    )
  }
}