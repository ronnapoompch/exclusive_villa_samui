import VillaCard from '@/components/VillaCard'

interface Villa {
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
  pricing: {
    dailyRate?: string
    weeklyRate?: string
    monthlyRate?: string
    currency: string
  } | null
  rating?: number | null
  reviewCount: number
}

interface VillaSearchResultsProps {
  results: Villa[]
  isLoading: boolean
  onLoadMore: () => void
  hasMore: boolean
}

// Helper function to convert Villa to VillaCard expected format
const convertVillaForCard = (villa: Villa) => {
  return {
    ...villa,
    pricing: villa.pricing || undefined,
    pricePerNight: villa.pricing?.dailyRate ? parseInt(villa.pricing.dailyRate) : undefined
  }
}

export function VillaSearchResults({ results, isLoading, onLoadMore, hasMore }: VillaSearchResultsProps) {
  if (isLoading && results.length === 0) {
    return <div>Loading...</div>
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No villas found matching your criteria.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {results.map((villa) => (
        <VillaCard key={villa.id} villa={convertVillaForCard(villa)} />
      ))}
      {hasMore && (
        <button 
          className="w-full py-2 text-blue-600 hover:text-blue-800"
          onClick={onLoadMore}
        >
          Load More
        </button>
      )}
    </div>
  )
}
