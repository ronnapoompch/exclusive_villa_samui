// Placeholder Image API for deployment without large image folders
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string[] }> }
) {
  try {
    const resolvedParams = await params
    const [type] = resolvedParams.type
    
    // Determine image dimensions based on type
    const dimensions = {
      villa: { width: 800, height: 600 },
      thumbnail: { width: 400, height: 300 },
      hero: { width: 1200, height: 600 },
      gallery: { width: 600, height: 400 }
    }
    
    const { width, height } = dimensions[type as keyof typeof dimensions] || dimensions.villa
    
    // Generate Unsplash URL for luxury villa imagery
    const unsplashUrl = new URL('https://images.unsplash.com/photo-1571896349842-33c89424de2d')
    unsplashUrl.searchParams.set('auto', 'format')
    unsplashUrl.searchParams.set('fit', 'crop')
    unsplashUrl.searchParams.set('w', width.toString())
    unsplashUrl.searchParams.set('h', height.toString())
    unsplashUrl.searchParams.set('q', '80')
    
    // Fetch the image
    const imageResponse = await fetch(unsplashUrl.toString())
    
    if (!imageResponse.ok) {
      return new NextResponse('Image not found', { status: 404 })
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    })
    
  } catch (error) {
    console.error('Placeholder image error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}