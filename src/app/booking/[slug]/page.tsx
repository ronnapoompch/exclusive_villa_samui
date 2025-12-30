import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BookingForm from '@/components/booking/BookingForm';
import VillaImageGallery from '@/components/VillaImageGallery';
import BackToVillas from '@/components/BackToVillas';
import { 
  Bed, 
  Bath, 
  Users, 
  MapPin, 
  Star,
  CreditCard,
  Shield
} from 'lucide-react';

interface Villa {
  id: string;
  name: string;
  slug: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests?: number;
  guests?: number;
  beachfront: boolean;
  location: string;
  images?: string[];
  hero?: string[];
  amenities: string[];
  featured?: boolean;
  pricePerNight?: number;
  monthlyPrice?: string;
  priceRange?: {
    min: number;
    max: number;
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
    // Use absolute URL in production, relative in development
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    
    // Fetch single villa by slug using dedicated endpoint
    const response = await fetch(`${baseUrl}/api/villas?slug=${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} - ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      console.log(`✅ Villa booking data loaded for slug: ${slug}`, data.data.name);
      return data.data;
    }
    
    console.log(`❌ Villa not found for slug: ${slug}`);
    return null;
  } catch (error) {
    console.error('Error fetching villa for booking:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const villa = await getVilla(resolvedParams.slug);

  if (!villa) {
    return {
      title: 'Villa Booking | Exclusive Villa Samui',
    };
  }

  return {
    title: `Book ${villa.name} | Exclusive Villa Samui`,
    description: `Book your stay at ${villa.name} - ${villa.description}`,
  };
}

export default async function VillaBookingPage({ params }: { params: { slug: string } }) {
  const resolvedParams = await params;
  const villa = await getVilla(resolvedParams.slug);

  if (!villa) {
    notFound();
  }

  const averageRating = villa.reviews?.length 
    ? villa.reviews.reduce((acc, review) => acc + review.rating, 0) / villa.reviews.length 
    : 0;

  // Get villa images from hero or images array
  const villaImages = villa.hero || villa.images || [];
  
  // Get price - prioritize priceRange.min, then pricePerNight
  const displayPrice = villa.priceRange?.min || villa.pricePerNight || 0;
  const maxGuests = villa.maxGuests || villa.guests || 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      {/* Professional Header */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-white/20 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <BackToVillas />
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-green-100 px-4 py-2 rounded-full border border-green-200">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-green-700 font-semibold text-sm">Secure Booking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Content */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column - Villa Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Book {villa.name}
              </h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2 text-cyan-600" />
                <span className="font-medium">{villa.location}</span>
              </div>
            </div>

            {/* Villa Image Gallery */}
            <VillaImageGallery 
              images={villaImages}
              villaName={villa.name}
              className="rounded-2xl overflow-hidden shadow-xl border border-white/20"
            />

            {/* Villa Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
                <div className="flex items-center">
                  <div className="bg-cyan-500 p-2 rounded-lg mr-3">
                    <Bed className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{villa.bedrooms}</div>
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
                    <div className="text-lg font-bold text-gray-900">{villa.bathrooms}</div>
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
                    <div className="text-lg font-bold text-gray-900">{maxGuests}</div>
                    <div className="text-sm text-gray-600">Guests</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                Pricing
              </h3>
              <div className="space-y-3">
                {displayPrice > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Daily Rate:</span>
                    <span className="text-xl font-bold text-gray-900">
                      ฿{displayPrice.toLocaleString()}
                    </span>
                  </div>
                )}
                {villa.monthlyPrice && villa.monthlyPrice !== "" && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Monthly Rate:</span>
                    <span className="text-lg font-semibold text-gray-800">
                      ฿{parseInt(villa.monthlyPrice).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Summary */}
            {villa.reviews && villa.reviews.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
                  Guest Reviews
                </h3>
                <div className="flex items-center mb-4">
                  <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                  <div className="ml-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(averageRating) 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">{villa.reviews.length} reviews</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <BookingForm 
              villaId={villa.id} 
              villaTitle={villa.name}
              villaSlug={villa.slug}
              pricePerNight={displayPrice}
              maxGuests={maxGuests}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
