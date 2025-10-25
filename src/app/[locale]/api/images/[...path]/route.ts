// Professional Image Serving API for 210 Villas - Vercel Compatible
import { NextRequest, NextResponse } from 'next/server';

// Unsplash villa image collection for fallback
const UNSPLASH_VILLA_IMAGES = [
  'photo-1571896349842-33c89424de2d', // Luxury villa with pool
  'photo-1582719478250-c89cae4dc85b', // Modern villa exterior
  'photo-1564013799919-ab600027ffc6', // Villa living room
  'photo-1566073771259-6a8506099945', // Villa bedroom
  'photo-1591088398332-8a7791972843', // Traditional villa
  'photo-1570129477492-45c003edd2be', // Villa kitchen
  'photo-1560448204-e02f11c3d0e2', // Villa pool
  'photo-1600585154340-be6161a56a0c', // Villa garden
  'photo-1600596542815-ffad4c1539a9', // Villa dining
  'photo-1600607687939-ce8a6c25118c', // Villa bathroom
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    console.log('🖼️ Image API called');
    const resolvedParams = await params;
    const imagePath = resolvedParams.path;
    console.log('📁 Image path:', imagePath);
    
    if (!imagePath || imagePath.length < 2) {
      return getPlaceholderImage(800, 600);
    }

    // Construct file path: /api/images/[...path] -> VillaName/category/filename
    const villaName = decodeURIComponent(imagePath[0]);
    const category = imagePath[1];
    const filename = imagePath[2] || 'default.jpg';
    
    // Security: validate path components
    if (!villaName || !category) {
      return getPlaceholderImage(800, 600);
    }
    
    // Prevent directory traversal
    if (villaName.includes('..') || category.includes('..') || filename.includes('..')) {
      return new NextResponse('Invalid path', { status: 400 });
    }

    // Since images are in .vercelignore, use Unsplash as fallback
    // Select image based on hash of villa name + category for consistency
    const hash = simpleHash(villaName + category + filename);
    const imageId = UNSPLASH_VILLA_IMAGES[hash % UNSPLASH_VILLA_IMAGES.length];
    
    // Determine dimensions based on category
    const dimensions = getDimensionsByCategory(category);
    
    return getPlaceholderImage(dimensions.width, dimensions.height, imageId);
    
  } catch (error) {
    console.error('❌ Image API Error:', error);
    return getPlaceholderImage(800, 600);
  }
}

function getDimensionsByCategory(category: string): { width: number; height: number } {
  const categoryMap: Record<string, { width: number; height: number }> = {
    'hero': { width: 1200, height: 800 },
    'ext': { width: 1000, height: 750 },
    'liv': { width: 900, height: 600 },
    'din': { width: 900, height: 600 },
    'kit': { width: 800, height: 600 },
    'bed1': { width: 900, height: 600 },
    'bed2-5': { width: 900, height: 600 },
    'bath1': { width: 800, height: 600 },
    'bath2-5': { width: 800, height: 600 },
    'pool': { width: 1000, height: 750 },
    'view': { width: 1200, height: 800 },
    'amen': { width: 800, height: 600 },
  };
  
  return categoryMap[category] || { width: 800, height: 600 };
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

async function getPlaceholderImage(width: number, height: number, imageId?: string): Promise<NextResponse> {
  try {
    // Use provided imageId or default
    const photoId = imageId || UNSPLASH_VILLA_IMAGES[0];
    
    // Generate Unsplash URL
    const unsplashUrl = new URL(`https://images.unsplash.com/${photoId}`);
    unsplashUrl.searchParams.set('auto', 'format');
    unsplashUrl.searchParams.set('fit', 'crop');
    unsplashUrl.searchParams.set('w', width.toString());
    unsplashUrl.searchParams.set('h', height.toString());
    unsplashUrl.searchParams.set('q', '80');
    
    // Fetch the image
    const imageResponse = await fetch(unsplashUrl.toString(), {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!imageResponse.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hour cache
      },
    });
  } catch (error) {
    console.error('Placeholder image error:', error);
    return new NextResponse('Image service unavailable', { status: 503 });
  }
}