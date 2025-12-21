'use client';

import { useState, useEffect, useCallback } from 'react';
import VillaCard from './VillaCard';
import { Button } from '@/components/ui/button';
import { Loader2, Filter } from 'lucide-react';

interface Villa {
  id: string;
  name: string;
  slug: string;
  description?: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  beachfront: boolean;
  location: string;
  images?: string[];
  amenities?: string[];
  featured: boolean;
  pricing?: {
    dailyRate?: string;
    weeklyRate?: string;
    monthlyRate?: string;
    currency: string;
  };
}

interface VillaListProps {
  featuredOnly?: boolean;
  limit?: number;
  location?: string;
  bedrooms?: number;
  guests?: number;
  beachfront?: boolean;
  featured?: boolean;
  priceMax?: number;
  priceMin?: number;
  priceRange?: [number, number];
  searchQuery?: string;
  className?: string;
}

interface VillaResponse {
  success: boolean;
  data: {
    villas: Villa[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export default function VillaList({
  featuredOnly = false,
  limit = 1000, // Load all villas by default
  location,
  bedrooms,
  guests,
  beachfront,
  featured,
  priceMax,
  priceMin,
  priceRange,
  searchQuery,
  className = ""
}: VillaListProps) {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVillas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);      // Build query parameters
      const params = new URLSearchParams();
      if (featuredOnly) params.append('featured', 'true');
      if (limit) params.append('limit', limit.toString());
      if (location && location !== 'All Locations') params.append('location', location);
      if (bedrooms && bedrooms > 0) params.append('bedrooms', bedrooms.toString());
      if (guests && guests > 0) params.append('guests', guests.toString());
      if (beachfront) params.append('beachfront', 'true');
      if (featured) params.append('featured', 'true');
      
      // Handle price filtering with priority: priceRange > individual values
      if (priceRange && priceRange[0] >= 0 && priceRange[1] > 0) {
        if (priceRange[0] > 0) params.append('minPrice', priceRange[0].toString());
        if (priceRange[1] < 1000000) params.append('maxPrice', priceRange[1].toString());
      } else {
        if (priceMin && priceMin > 0) params.append('minPrice', priceMin.toString());
        if (priceMax && priceMax < 1000000) params.append('maxPrice', priceMax.toString());
      }
      
      if (searchQuery) params.append('search', searchQuery);

      // Direct API path without locale
      const apiPath = `/api/villas?${params.toString()}`;
      
      console.log('[VillaList] Making API call to:', apiPath);
      const response = await fetch(apiPath);
      console.log('[VillaList] API response status:', response.status);
      
      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText} - Path: ${apiPath}`);
        throw new Error(`Failed to fetch villas: ${response.status} ${response.statusText}`);
      }

      const data: VillaResponse = await response.json();
      
      if (data.success) {
        setVillas(data.data.villas);
      } else {
        throw new Error('Failed to load villas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [featuredOnly, limit, location, bedrooms, guests, beachfront, featured, priceMax, priceMin, priceRange, searchQuery]);

  useEffect(() => {
    fetchVillas();
  }, [featuredOnly, limit, location, bedrooms, guests, beachfront, featured, priceMax, priceMin, priceRange, searchQuery, fetchVillas]);

  if (loading) {
    return (
      <div className={`py-12 xs:py-16 ${className}`}>
        <div className="container-mobile max-w-7xl mx-auto">
          <div className="text-center">
            <Loader2 className="w-6 h-6 xs:w-8 xs:h-8 animate-spin mx-auto mb-3 xs:mb-4 text-cyan-600" />
            <p className="text-sm xs:text-base text-gray-600">Loading amazing villas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-12 xs:py-16 ${className}`}>
        <div className="container-mobile max-w-7xl mx-auto">
          <div className="text-center card-mobile bg-red-50 border border-red-200">
            <p className="text-red-600 mb-3 xs:mb-4 text-sm xs:text-base">{error}</p>
            <Button onClick={() => fetchVillas()} variant="outline" className="btn-mobile">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (villas.length === 0) {
    return (
      <div className={`py-12 xs:py-16 ${className}`}>
        <div className="container-mobile max-w-7xl mx-auto">
          <div className="text-center">
            <Filter className="w-8 h-8 xs:w-12 xs:h-12 mx-auto mb-3 xs:mb-4 text-gray-400" />
            <h3 className="heading-mobile text-lg xs:text-xl font-semibold text-gray-900 mb-2">No villas found</h3>
            <p className="body-mobile text-sm xs:text-base text-gray-600">Try adjusting your search criteria</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className={`py-16 xs:py-20 bg-gradient-to-br from-gray-50 via-white to-amber-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
        {/* Villa Grid - Professional Balanced Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 mb-12 xs:mb-16">
          {villas.map((villa) => (
            <VillaCard key={villa.id} villa={villa} />
          ))}
        </div>

        {/* Total Count Display */}
        {villas.length > 0 && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm font-semibold text-amber-700">
                Showing all {villas.length} luxury villas
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}