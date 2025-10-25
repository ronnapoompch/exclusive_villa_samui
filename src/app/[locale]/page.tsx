'use client';

import VillaList from '@/components/VillaList';
import AuthenticatedNavigation from '@/components/AuthenticatedNavigation';
import { AdvancedVillaSearch } from '@/components/search/AdvancedVillaSearch';
import { Trophy, Shield, HeartHandshake } from 'lucide-react';
import { useState } from 'react';

interface SearchFilters {
  location?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  beachfront?: boolean;
}

// Component follows docs structure: features/villas, features/search
export default function HomePage(): JSX.Element {
  // Temporary static text for Next.js 15 compatibility
  // const t = useTranslations();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});

  const handleSearch = (data: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    beachfront?: boolean;
  }): void => {
    const filters: SearchFilters = {
      location: data.location,
      checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
      checkOut: data.checkOut ? new Date(data.checkOut) : undefined,
      guests: data.guests,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      beachfront: data.beachfront,
    };
    setSearchFilters(filters);
    // Scroll to villas section - already handled in AdvancedVillaSearch
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header Navigation - Follows docs navigation structure */}
      <AuthenticatedNavigation />

      {/* Hero Section - Exclusive Villa Luxury Style */}
      <main role="main">
        <section 
          className="relative h-screen flex items-center justify-center overflow-hidden" 
          aria-labelledby="hero-title"
        >
          {/* Background Image - Original background */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
            style={{ 
              backgroundImage: 'url(/assets/images/bg/bg1.jpg)',
              willChange: 'transform'
            }}
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/50 to-amber-900/40"></div>
          </div>

          <div className="relative z-20 text-center text-white px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1] mb-8">
              <span className="font-extralight text-white">Exclusive Villa </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-white font-light">
                Samui
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl font-light mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Discover your perfect luxury villa escape in paradise
            </p>

            {/* Luxury Villa Search */}
            <div className="max-w-4xl mx-auto mb-12">
              <AdvancedVillaSearch onSearch={handleSearch} />
            </div>

            {/* Luxury Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-white/80">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-amber-300" />
                <span className="text-sm font-light">Verified Luxury Properties</span>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-300" />
                <span className="text-sm font-light">Award Winning Service</span>
              </div>
              <div className="flex items-center gap-3">
                <HeartHandshake className="w-5 h-5 text-amber-300" />
                <span className="text-sm font-light">Concierge Available</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Villa Collection Section - Luxury Style */}
        <section 
          id="villas-section" 
          className="py-16 sm:py-20 lg:py-24 bg-slate-50"
          aria-labelledby="villas-title"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header - Elegant and Minimal */}
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-amber-100 rounded-full mb-4">
                <span className="text-amber-800 text-sm font-medium tracking-wide uppercase">Our Collection</span>
              </div>
              <h2 
                id="villas-title"
                className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6"
              >
                Luxury Villas in Koh Samui
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
                Carefully curated collection of extraordinary properties
              </p>
            </div>

            {/* Villa Grid - Luxury Focused */}
            <VillaList 
              location={searchFilters.location}
              guests={searchFilters.guests}
              priceMin={searchFilters.minPrice}
              priceMax={searchFilters.maxPrice}
              beachfront={searchFilters.beachfront}
            />
          </div>
        </section>
      </main>

      {/* Exclusive Services & Value Proposition - Luxury Style */}      
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-amber-100 rounded-full mb-4">
              <span className="text-amber-800 text-sm font-medium tracking-wide uppercase">Why Choose Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6">
              The Exclusive Villa Experience
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Unmatched luxury, personalized service, and unforgettable experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <Trophy className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-4">
                Curated Excellence
              </h3>
              <p className="text-slate-600 leading-relaxed font-light">
                Every villa is meticulously selected and personally inspected to ensure the highest standards of luxury and comfort.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <Shield className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-4">
                Premium Security
              </h3>
              <p className="text-slate-600 leading-relaxed font-light">
                Advanced booking protection with secure payments and comprehensive insurance coverage for your peace of mind.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <HeartHandshake className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-4">
                Dedicated Concierge
              </h3>
              <p className="text-slate-600 leading-relaxed font-light">
                24/7 luxury concierge service to arrange transfers, dining, activities, and create bespoke experiences.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}