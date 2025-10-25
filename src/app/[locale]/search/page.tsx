'use client'

import { AdvancedVillaSearch } from '@/components/search/AdvancedVillaSearch'
import { VillaSearchResults } from '@/components/search/VillaSearchResults'
import { useVillaSearch } from '@/hooks/useVillaSearch'

export default function VillaSearchPage() {
  const { searchResults, isLoading, searchVillas, loadMore } = useVillaSearch()

  const handleSearch = async (filters: any) => {
    await searchVillas(filters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Perfect Villa
          </h1>
          <p className="text-gray-600 text-lg">
            Discover luxury villas in Koh Samui with our advanced searchS
          </p>
        </div>

        <div className="space-y-8">
          {/* Search Form */}
          <AdvancedVillaSearch 
            onSearch={handleSearch}
            isLoading={isLoading}
          />

          {/* Search Results */}
          <VillaSearchResults
            results={searchResults?.villas || []}
            isLoading={isLoading}
            onLoadMore={loadMore}
            hasMore={searchResults?.pagination.hasMore ?? false}
          />
        </div>
      </div>
    </div>
  )
}