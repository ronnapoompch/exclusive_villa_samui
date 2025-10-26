import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import VillaImageGallery from '@/components/VillaImageGallery';
import BackToVillas from '@/components/BackToVillas';
import { 
  Bed, 
  Bath, 
  Users, 
  MapPin, 
  Waves, 
  Wifi, 
  Car, 
  Coffee,
  Star,
  Calendar,
  Phone,
  Trophy
} from 'lucide-react';

interface Villa {
  id: string;
  name: string;
  slug: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  beachfront: boolean;
  location: string;
  images: string[];
  amenities: string[];
  featured: boolean;
  pricing: {
    dailyRate?: string;
    weeklyRate?: string;
    monthlyRate?: string;
    currency: string;
  };
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    guestName: string;
    createdAt: string;
  }>;
}

async function getVilla(slug: string): Promise<Villa | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    // ใช้ villa API ที่มีอยู่แล้ว แล้วค้นหา by slug
    const response = await fetch(`${baseUrl}/api/villas?limit=1000`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} - ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    // ค้นหา villa จาก slug
    const villa = data.data?.villas?.find((v: Villa) => v.slug === slug);
    
    if (villa) {
      console.log(`✅ Villa data loaded for slug: ${slug}`, villa.name);
      return villa;
    }
    
    console.log(`❌ Villa not found for slug: ${slug}`);
    return null;
  } catch (error) {
    console.error('Error fetching villa:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const villa = await getVilla(resolvedParams.slug);

  if (!villa) {
    return {
      title: 'Villa Not Found | Exclusive Villa Samui',
    };
  }

  return {
    title: `${villa.name} | Exclusive Villa Samui`,
    description: villa.description,
  };
}

const amenityIcons: Record<string, any> = {
  'Wi-Fi': Wifi,
  'Parking': Car,
  'Kitchen': Coffee,
  'Beachfront': Waves,
};

export default async function VillaDetailPage({ params }: { params: { slug: string } }) {
  const resolvedParams = await params;
  const villa = await getVilla(resolvedParams.slug);

  if (!villa) {
    notFound();
  }

  const averageRating = villa.reviews?.length 
    ? villa.reviews.reduce((acc, review) => acc + review.rating, 0) / villa.reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      {/* Premium Header - Glass Morphism Effect */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-white/20 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <BackToVillas />
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex border-cyan-200 hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300"
              >
                <Phone className="w-4 h-4 mr-2 text-cyan-600" />
                <span className="text-cyan-700">Contact</span>
              </Button>
              <Button 
                size="sm" 
                className="sm:hidden bg-white border-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50 shadow-lg"
                variant="outline"
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Link href={`/booking/${villa.slug}`}>
                <Button className="bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-700 hover:via-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base px-4 sm:px-6">
                  <Calendar className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Book Now</span>
                  <span className="sm:hidden">Book</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with Enhanced Styling */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="relative">
          <VillaImageGallery 
            images={villa.images || []}
            villaName={villa.name}
            className="mb-8 sm:mb-12 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/20"
          />
          
          {/* Floating Quick Stats */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900">{villa.bedrooms}</div>
                  <div className="text-xs text-gray-600">Bedrooms</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900">{villa.bathrooms}</div>
                  <div className="text-xs text-gray-600">Bathrooms</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900">{villa.maxGuests}</div>
                  <div className="text-xs text-gray-600">Guests</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Villa Info - Premium Layout */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content - Enhanced Typography */}
          <div className="xl:col-span-2 space-y-8 sm:space-y-12">
            {/* Premium Title Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-white/30">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-6">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text">
                      {villa.name}
                    </h1>
                    {villa.beachfront && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg self-start px-3 py-1.5">
                        <Waves className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" />
                        <span className="text-sm sm:text-base font-semibold">Beachfront Villa</span>
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <div className="bg-cyan-100 p-2 rounded-full mr-3">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                      </div>
                      <span className="text-sm sm:text-base font-medium">{villa.location}, Koh Samui</span>
                    </div>
                    {villa.reviews && villa.reviews.length > 0 && (
                      <>
                        <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
                        <div className="flex items-center">
                          <div className="bg-yellow-100 p-2 rounded-full mr-3">
                            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-500 text-yellow-500" />
                          </div>
                          <div>
                            <span className="text-sm sm:text-base font-bold text-gray-900">
                              {averageRating.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-600 ml-1">
                              ({villa.reviews.length} reviews)
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {villa.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white border-0 shadow-lg px-4 py-2 self-start">
                    <Trophy className="w-4 h-4 mr-2" />
                    <span className="font-semibold">Featured Property</span>
                  </Badge>
                )}
              </div>

              {/* Enhanced Quick Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
                  <div className="flex items-center">
                    <div className="bg-cyan-500 p-2 rounded-lg mr-3">
                      <Bed className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-bold text-gray-900">{villa.bedrooms}</div>
                      <div className="text-sm text-gray-600">Bedrooms</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center">
                    <div className="bg-blue-500 p-2 rounded-lg mr-3">
                      <Bath className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-bold text-gray-900">{villa.bathrooms}</div>
                      <div className="text-sm text-gray-600">Bathrooms</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                  <div className="flex items-center">
                    <div className="bg-indigo-500 p-2 rounded-lg mr-3">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-bold text-gray-900">{villa.maxGuests}</div>
                      <div className="text-sm text-gray-600">Max Guests</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Description */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-white/30">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-xl mr-4">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  About this luxury villa
                </h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-medium">
                  {villa.description}
                </p>
              </div>
            </div>

            {/* Premium Amenities Section */}
            {villa.amenities && Array.isArray(villa.amenities) && villa.amenities.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-white/30">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl mr-4">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Premium Amenities
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {villa.amenities.map((amenity, index) => {
                    const Icon = amenityIcons[amenity] || Coffee;
                    const gradientColors = [
                      'from-cyan-500 to-blue-500',
                      'from-blue-500 to-indigo-500', 
                      'from-indigo-500 to-purple-500',
                      'from-purple-500 to-pink-500',
                      'from-pink-500 to-rose-500',
                      'from-rose-500 to-orange-500'
                    ];
                    const gradientColor = gradientColors[index % gradientColors.length];
                    
                    return (
                      <div key={`${amenity}-${index}`} className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 sm:p-5 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-center">
                          <div className={`bg-gradient-to-br ${gradientColor} p-3 rounded-lg mr-4 group-hover:shadow-lg transition-all duration-300`}>
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div>
                            <span className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                              {amenity}
                            </span>
                            <div className="text-xs text-gray-500">Premium</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Premium Reviews Section */}
            {villa.reviews && villa.reviews.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-white/30">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl mr-4">
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Guest Reviews
                      </h2>
                      <div className="flex items-center mt-1">
                        <span className="text-2xl font-bold text-yellow-500 mr-2">
                          {averageRating.toFixed(1)}
                        </span>
                        <div className="flex items-center mr-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          Based on {villa.reviews.length} reviews
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 sm:gap-6">
                  {villa.reviews.slice(0, 3).map((review) => (
                    <Card key={review.id} className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                              <span className="text-lg font-bold text-gray-700">
                                {review.guestName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-base sm:text-lg">
                                {review.guestName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed italic">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Premium Booking Sidebar */}
          <div className="xl:col-span-1 order-first xl:order-last">
            <Card className="xl:sticky xl:top-32 border-0 shadow-2xl bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/30 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                {/* Pricing Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl p-6 mb-4">
                    <div className="text-3xl sm:text-4xl font-black mb-2">
                      {villa.pricing?.monthlyRate} {villa.pricing?.currency}
                    </div>
                    <div className="text-cyan-100 text-lg font-medium">per month</div>
                  </div>
                  {villa.pricing?.dailyRate && (
                    <div className="text-sm sm:text-base text-gray-600 bg-white/50 rounded-lg p-3">
                      <span className="font-semibold">Daily rate from:</span>{' '}
                      <span className="text-cyan-600 font-bold">
                        {villa.pricing.dailyRate} {villa.pricing.currency}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                  <Button className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-700 hover:via-cyan-600 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-xl">
                    <Calendar className="w-5 h-5 mr-3" />
                    Reserve This Villa
                  </Button>
                  
                  <Button variant="outline" className="w-full h-12 font-semibold border-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Villa Host
                  </Button>
                </div>

                {/* Price Breakdown */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/50">
                  <h3 className="font-bold text-gray-900 mb-4 text-center">What&apos;s Included</h3>
                  <div className="space-y-3 text-sm sm:text-base">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">Concierge Service</span>
                      </div>
                      <span className="text-green-600 font-semibold">Included</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">Daily Housekeeping</span>
                      </div>
                      <span className="text-green-600 font-semibold">Included</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">Airport Transfer</span>
                      </div>
                      <span className="text-green-600 font-semibold">Included</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center font-bold text-base sm:text-lg">
                        <span className="text-gray-900">Total Price</span>
                        <span className="text-cyan-600">
                          {villa.pricing?.monthlyRate} {villa.pricing?.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        <span>Verified</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                        <span>Premium</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                        <span>5★ Host</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}