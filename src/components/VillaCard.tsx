"use client";
import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  priceRange?: string | { min: number; max: number; display: string }; // Price range
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
  // Handle Vercel Blob URLs and local paths
  const getValidImageUrl = (imageUrl?: string): string => {
    if (!imageUrl) {
      // Fallback to first villa's hero image
      return '/optimized-villas/5-stars-beachfront-villa/hero/909.webp';
    }
    
    // Support Vercel Blob URLs and local paths
    return imageUrl;
  };
  
  const heroImage = getValidImageUrl(villa.images?.[0]);
  
  return (
    <Card className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-white border border-gray-200 hover:border-amber-300/60 rounded-2xl shadow-lg ${className}`}>
      <Link href={`/villa/${villa.slug}`} className="block">
        <div className="aspect-[16/11] relative overflow-hidden bg-gray-100 rounded-t-2xl">
          <img
            src={heroImage}
            alt={villa.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {villa.featured && (
              <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 text-xs px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Premium
              </Badge>
            )}
            {villa.beachfront && (
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 text-xs px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                <Waves className="w-3 h-3 mr-1" />
                Beachfront
              </Badge>
            )}
          </div>
        </div>
      </Link>
      <CardContent className="p-5 space-y-4">
        <Link href={`/villa/${villa.slug}`} className="block group/title">
          <div className="space-y-3">
            <h3 className="font-bold text-lg text-gray-900 group-hover/title:text-amber-600 transition-colors line-clamp-2 leading-snug min-h-[3.5rem]">
              {villa.name}
            </h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-2 text-amber-500 flex-shrink-0" />
              <span className="font-medium truncate">{villa.location}</span>
            </div>
          </div>
          
          {/* Amenities Row */}
          <div className="flex items-center gap-5 text-gray-700 text-sm pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{villa.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{villa.maxGuests}</span>
            </div>
          </div>
          
          {/* Modern Price Display */}
          <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-900 leading-tight">
                  {villa.priceRange ? (
                    typeof villa.priceRange === 'string' 
                      ? villa.priceRange 
                      : villa.priceRange.display || `฿${villa.priceRange.min?.toLocaleString()}-${villa.priceRange.max?.toLocaleString()}`
                  ) : villa.pricePerNight ? (
                    `฿${villa.pricePerNight.toLocaleString()}`
                  ) : (
                    '-'
                  )}
                </div>
                <div className="text-xs text-gray-600 font-medium mt-0.5">
                  {villa.isMonthlyRate ? 'per month' : 
                     (villa.pricePerNight || villa.priceRange) ? 'per night' : ''}
                </div>
                {!villa.isMonthlyRate && (villa.pricePerNight || villa.priceRange) && (
                  <div className="text-xs text-amber-600 mt-2 font-semibold">
                    Min. 3 nights
                  </div>
                )}
              </div>
              {(villa.weeklyRate || villa.monthlyRate) && !villa.isMonthlyRate && (
                <div className="text-right text-xs space-y-1 flex-shrink-0">
                  {villa.weeklyRate && (
                    <div className="text-gray-700">
                      <div className="font-semibold">฿{villa.weeklyRate.toLocaleString()}</div>
                      <div className="text-gray-500">weekly</div>
                    </div>
                  )}
                  {villa.monthlyRate && (
                    <div className="text-gray-700">
                      <div className="font-semibold">฿{villa.monthlyRate.toLocaleString()}</div>
                      <div className="text-gray-500">monthly</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
        
        {/* Action Buttons */}
        <div className="flex gap-2.5 mt-5 pt-4 border-t border-gray-100">
          <Link href={`/villa/${villa.slug}`} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full text-sm h-11 rounded-xl border-2 border-gray-300 text-gray-700 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 transition-all duration-300 font-semibold shadow-sm hover:shadow"
            >
              Details
            </Button>
          </Link>
          <Link href={`/booking/${villa.slug}`} className="flex-1">
            <Button 
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm h-11 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-bold"
            >
              Book Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
