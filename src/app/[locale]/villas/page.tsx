'use client';

import VillaList from '@/components/VillaList';
import AuthenticatedNavigation from '@/components/AuthenticatedNavigation';
import { AdvancedVillaSearch } from '@/components/search/AdvancedVillaSearch';
import { useState } from 'react';

interface SearchFilters {
  location?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
}

export default function VillasPage(): JSX.Element {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});

  const handleSearch = (data: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }) => {
    console.log('[VillasPage] Search submitted:', data);
    setSearchFilters({
      location: data.location,
      checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
      checkOut: data.checkOut ? new Date(data.checkOut) : undefined,
      guests: data.guests,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedNavigation />
      
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Luxury Villas in Koh Samui
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90">
            Discover your perfect paradise getaway
          </p>
          
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <AdvancedVillaSearch 
              onSearch={handleSearch}
            />
          </div>
        </div>
      </section>

      {/* Villas Listing */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <VillaList 
            location={searchFilters.location}
            guests={searchFilters.guests}
            limit={12}
          />
        </div>
      </section>
    </div>
  );
}