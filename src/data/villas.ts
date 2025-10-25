export interface Villa {
  id: string
  name: string
  slug: string  // Add slug field
  location: string
  price: number  // Keep for backward compatibility (in THB)
  pricePerNight: number | null  // Price in THB (Thai Baht), null if no price
  priceRange?: string  // Price range like "120,000-140,000" for display
  weeklyRate?: number  // Weekly rate from Excel
  monthlyRate?: number  // Monthly rate from Excel
  isMonthlyRate?: boolean  // Flag if price is per month instead of per night
  rating: number
  reviews: number
  bedrooms: number
  bathrooms: number  // Add bathrooms field
  maxGuests: number
  images: string[]
  amenities: string[]
  description: string
  featured: boolean
  beachfront: boolean  // Add beachfront field
}

export const sampleVillas: Villa[] = [
  {
    id: '1',
    name: 'Luxury Beachfront Villa Sunset',
    slug: 'luxury-beachfront-villa-sunset',
    location: 'Chaweng Beach, Koh Samui',
    price: 15000,
    pricePerNight: 450,
    rating: 4.9,
    reviews: 127,
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    amenities: ['pool', 'wifi', 'parking', 'kitchen', 'beachfront', 'chef'],
    description: 'Stunning beachfront villa with infinity pool overlooking the crystal clear waters of Chaweng Beach. Perfect for families seeking luxury and comfort.',
    featured: true,
    beachfront: true
  },
  {
    id: '2',
    name: 'Modern Hillside Retreat',
    slug: 'modern-hillside-retreat',
    location: 'Bophut Hills, Koh Samui',
    price: 12500,
    pricePerNight: 380,
    rating: 4.8,
    reviews: 89,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    amenities: ['pool', 'wifi', 'parking', 'kitchen'],
    description: 'Contemporary villa nestled in the hills with panoramic ocean views. Features modern amenities and tropical garden.',
    featured: false,
    beachfront: false
  },
  {
    id: '3',
    name: 'Traditional Thai Paradise',
    slug: 'traditional-thai-paradise',
    location: 'Maenam Beach, Koh Samui',
    price: 8500,
    pricePerNight: 250,
    rating: 4.7,
    reviews: 156,
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    amenities: ['wifi', 'parking', 'kitchen', 'beachfront'],
    description: 'Authentic Thai-style villa with traditional architecture and modern comforts. Located steps from pristine Maenam Beach.',
    featured: false,
    beachfront: true
  },
  {
    id: '4',
    name: 'Exclusive Estate Villa Grande',
    slug: 'exclusive-estate-villa-grande',
    location: 'Lamai Beach, Koh Samui',
    price: 25000,
    pricePerNight: 750,
    rating: 5.0,
    reviews: 67,
    bedrooms: 6,
    bathrooms: 5,
    maxGuests: 12,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    amenities: ['pool', 'wifi', 'parking', 'kitchen', 'beachfront', 'chef'],
    description: 'Ultra-luxury estate with private beach access, full staff service, and world-class amenities. Perfect for special occasions.',
    featured: true,
    beachfront: true
  },
  {
    id: '5',
    name: 'Tropical Garden Villa',
    slug: 'tropical-garden-villa',
    location: 'Choeng Mon Beach, Koh Samui',
    price: 9500,
    pricePerNight: 285,
    rating: 4.6,
    reviews: 98,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    amenities: ['pool', 'wifi', 'parking', 'kitchen'],
    description: 'Peaceful villa surrounded by lush tropical gardens with a private pool. Close to the quiet Choeng Mon Beach.',
    featured: false,
    beachfront: true
  },
  {
    id: '6',
    name: 'Oceanview Penthouse Villa',
    slug: 'oceanview-penthouse-villa',
    location: 'Big Buddha, Koh Samui',
    price: 18000,
    pricePerNight: 540,
    rating: 4.9,
    reviews: 73,
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    amenities: ['pool', 'wifi', 'parking', 'kitchen', 'chef'],
    description: 'Elevated villa with spectacular 360-degree ocean and island views. Features infinity pool and rooftop terrace.',
    featured: true,
    beachfront: false
  }
]

export const featuredVillas = sampleVillas.filter(villa => villa.featured)
export const allVillas = sampleVillas
