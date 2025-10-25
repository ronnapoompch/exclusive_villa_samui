"use client";
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { MapPin, Bed, Users, Star, Waves } from 'lucide-react';

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
  pricePerNight?: number | null; // Price in THB, null if no price
  priceRange?: string; // Price range like "฿120,000-140,000"
  weeklyRate?: number; // Weekly rate from Excel
  monthlyRate?: number; // Monthly rate from Excel
  isMonthlyRate?: boolean; // Flag if price is per month instead of per night
  pricing?: {
    dailyRate?: string;
    weeklyRate?: string;
    monthlyRate?: string;
    currency: string;
  };
}

interface VillaCardProps {
  villa: Villa;
  className?: string;
}

export type { Villa };
export default function VillaCard({ villa, className = '' }: VillaCardProps) {
  // Get current locale from pathname
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  
  // Handle both local and Cloudinary URLs
  const getValidImageUrl = (imageUrl?: string): string => {
    if (!imageUrl) {
      // Fallback to first villa's hero image
      return '/optimized-villas/5-stars-beachfront-villa/hero/909.webp';
    }
    
    // Already a valid URL (local or Cloudinary)
    return imageUrl;
  };
  
  const heroImage = getValidImageUrl(villa.images?.[0]);
  
  return (
    <Card className={`card-mobile overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-white border border-gray-200 hover:border-amber-300/50 rounded-2xl shadow-lg ${className}`}>
      <Link href={`/${locale}/villa/${villa.slug}`} className="group block">
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 rounded-t-2xl">
          <Image
            src={heroImage}
            alt={villa.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 xs:top-3 left-2 xs:left-3 flex flex-wrap gap-1 xs:gap-2">
            {villa.featured && (
              <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 text-xs xs:text-sm px-2 xs:px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
                <Star className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1 fill-current" />
                Premium
              </Badge>
            )}
            {villa.beachfront && (
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 text-xs xs:text-sm px-2 xs:px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
                <Waves className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1" />
                Beachfront
              </Badge>
            )}
          </div>
        </div>
      </Link>
      <CardContent className="p-4 xs:p-5 space-y-4">
        <Link href={`/en/villa/${villa.slug}`} className="group block">
          <div className="space-y-2 xs:space-y-3">
            <h3 className="font-semibold text-lg xs:text-xl text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2">
              {villa.name}
            </h3>
            <div className="flex items-center text-gray-600 text-sm xs:text-base">
              <MapPin className="w-4 h-4 xs:w-5 xs:h-5 mr-2 text-amber-500" />
              <span className="font-medium">{villa.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 xs:gap-6 text-gray-700 text-sm xs:text-base">
            <div className="flex items-center">
              <Bed className="w-4 h-4 xs:w-5 xs:h-5 mr-2 text-gray-500" />
              <span className="font-medium">{villa.bedrooms} Bedrooms</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 xs:w-5 xs:h-5 mr-2 text-gray-500" />
              <span className="font-medium">Up to {villa.maxGuests} Guests</span>
            </div>
          </div>
          
          {/* Modern Price Display */}
          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-amber-50 rounded-xl border border-amber-200/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {villa.priceRange ? (
                    villa.priceRange
                  ) : villa.pricePerNight ? (
                    `฿${villa.pricePerNight.toLocaleString()}`
                  ) : (
                    '-'
                  )}
                  <span className="text-sm text-gray-600 font-normal">
                    {villa.isMonthlyRate ? ' / month' : 
                     (villa.pricePerNight || villa.priceRange) ? ' / night' : ''}
                  </span>
                </div>
                {!villa.isMonthlyRate && (villa.pricePerNight || villa.priceRange) && (
                  <div className="text-sm text-amber-600 mt-1 font-medium">
                    Minimum 3 nights
                  </div>
                )}
              </div>
              {(villa.weeklyRate || villa.monthlyRate) && !villa.isMonthlyRate && (
                <div className="text-right text-sm space-y-1">
                  {villa.weeklyRate && (
                    <div className="text-gray-700">
                      <span className="font-medium">฿{villa.weeklyRate.toLocaleString()}</span>
                      <span className="text-gray-500">/nt weekly</span>
                    </div>
                  )}
                  {villa.monthlyRate && (
                    <div className="text-gray-700">
                      <span className="font-medium">฿{villa.monthlyRate.toLocaleString()}</span>
                      <span className="text-gray-500">/nt monthly</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
        <div className="flex gap-3 mt-5">
          <Link href={`/${locale}/villa/${villa.slug}`} className="flex-1">
            <Button variant="outline" className="w-full text-sm xs:text-base h-11 xs:h-12 rounded-xl border-2 border-gray-300 text-gray-700 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 font-medium">
              View Details
            </Button>
          </Link>
          <Link href={`/${locale}/booking/${villa.slug}`} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm xs:text-base h-11 xs:h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold">
              Book Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
