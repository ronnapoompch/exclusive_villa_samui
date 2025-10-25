'use client'

import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

export interface Villa {
  id: string
  name: string
  slug: string
  description: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  beachfront: boolean
  location: string
  images: string[]
  amenities: string[]
  featured: boolean
  petFriendly?: boolean
  pricePerNight?: number | null // Price in THB, null if no price
  priceRange?: string // Price range like "฿120,000-140,000"
  weeklyRate?: number // Weekly rate from Excel
  monthlyRate?: number // Monthly rate from Excel
  isMonthlyRate?: boolean // Flag if price is per month instead of per night
  pricing: {
    dailyRate?: string
    weeklyRate?: string
    monthlyRate?: string
    currency: string
  } | null
  rating?: number | null
  reviewCount: number
}

export interface SearchFilters {
  location?: string
  checkIn?: string
  checkOut?: string
  bedrooms?: number
  bathrooms?: number
  maxGuests?: number
  minPrice?: number
  maxPrice?: number
  beachfront?: boolean
  featured?: boolean
  petFriendly?: boolean
  amenities?: string[]
  sortBy?: 'price' | 'name' | 'bedrooms' | 'rating' | 'created'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface SearchResults {
  villas: Villa[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }
  filters: SearchFilters
  meta: {
    searchTime: string
    resultsFound: number
    availabilityChecked: boolean
  }
}

export interface AvailabilityCheck {
  available: boolean
  reason?: string
  message?: string
  villa: {
    id: string
    name: string
    maxGuests?: number
    minimumStay?: number
  }
  dateRange?: {
    checkIn: string
    checkOut: string
    nights: number
  }
  pricing?: {
    currency: string
    nightlyRate: number
    subtotal: number
    cleaningFee: number
    serviceFee: number
    taxAmount: number
    total: number
    breakdown: {
      baseAmount: string
      cleaningFee: string
      serviceFee: string
      tax: string
      total: string
    }
  }
  conflictingBookings?: Array<{
    checkIn: string
    checkOut: string
    status: string
  }>
}

export function useVillaSearch() {
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchVillas = useCallback(async (filters: SearchFilters = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/villas/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Search failed')
      }

      setSearchResults(data.data)
      
      // Show success toast
      const { resultsFound } = data.data.meta
      toast.success(`Found ${resultsFound} villa${resultsFound !== 1 ? 's' : ''}`)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const checkAvailability = useCallback(async (
    villaId: string,
    checkIn: string,
    checkOut: string,
    guests?: number
  ): Promise<AvailabilityCheck | null> => {
    try {
      const response = await fetch('/api/v1/villas/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          villaId,
          checkIn,
          checkOut,
          guests,
        }),
      })

      if (!response.ok) {
        throw new Error(`Availability check failed: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Availability check failed')
      }

      return data.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Availability check failed'
      toast.error(errorMessage)
      return null
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!searchResults || !searchResults.pagination.hasMore || isLoading) {
      return
    }

    setIsLoading(true)

    try {
      const nextPage = searchResults.pagination.page + 1
      const filters = {
        ...searchResults.filters,
        page: nextPage,
      }

      const response = await fetch('/api/v1/villas/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      })

      if (!response.ok) {
        throw new Error(`Load more failed: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Load more failed')
      }

      setSearchResults(prev => {
        if (!prev) return data.data

        return {
          ...data.data,
          villas: [...prev.villas, ...data.data.villas],
        }
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Load more failed'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [searchResults, isLoading])

  const reset = useCallback(() => {
    setSearchResults(null)
    setError(null)
  }, [])

  return {
    searchResults,
    isLoading,
    error,
    searchVillas,
    checkAvailability,
    loadMore,
    reset,
  }
}