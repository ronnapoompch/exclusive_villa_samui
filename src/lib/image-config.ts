// Image fallback configuration for production deployment
// This handles missing images when optimized-data-images is excluded from deployment

export const imageConfig = {
  // Fallback images for when actual images are not available
  fallbackImages: {
    villa: '/api/placeholder/villa',
    thumbnail: '/api/placeholder/thumbnail',
    hero: '/api/placeholder/hero'
  },
  
  // CDN configuration for external image hosting
  cdnConfig: {
    enabled: process.env.NODE_ENV === 'production',
    baseUrl: process.env.NEXT_PUBLIC_CDN_URL || '',
    domains: ['images.unsplash.com', 'res.cloudinary.com']
  },
  
  // Image optimization settings
  optimization: {
    quality: 80,
    formats: ['webp', 'jpg'],
    sizes: [640, 750, 828, 1080, 1200, 1920]
  }
}

// Helper function to get optimized image URL
export function getImageUrl(villaId: string, imageName: string): string {
  const { cdnConfig } = imageConfig
  
  // If CDN is enabled and configured, use external URL
  if (cdnConfig.enabled && cdnConfig.baseUrl) {
    return `${cdnConfig.baseUrl}/villas/${villaId}/${imageName}`
  }
  
  // Try local image API first
  const localUrl = `/api/images/${villaId}/main/${imageName}`
  
  // Fallback to placeholder if needed
  return localUrl
}

// Generate placeholder image URLs
export function getPlaceholderUrl(type: 'villa' | 'thumbnail' | 'hero' = 'villa'): string {
  const width = type === 'thumbnail' ? 400 : type === 'hero' ? 1200 : 800
  const height = type === 'thumbnail' ? 300 : type === 'hero' ? 600 : 600
  
  return `https://images.unsplash.com/${width}x${height}/?villa,luxury,resort&auto=format&fit=crop&w=${width}&h=${height}`
}