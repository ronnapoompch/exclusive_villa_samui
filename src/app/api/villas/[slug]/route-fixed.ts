// Villa Slug API with Folder-Based Names (Direct from Image Folders)
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Load folder-based villa data
function loadFolderBasedVillas() {
  try {
    const filePath = path.join(process.cwd(), 'src/data/folder-based-villas.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('❌ Error loading folder-based villas:', error);
  }
  return null;
}

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Villa slug is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Looking for villa with slug: ${slug}`);

    // Load folder-based villas (using folder names as villa names)
    const folderBasedData = loadFolderBasedVillas();
    if (folderBasedData && folderBasedData[slug]) {
      const villa = folderBasedData[slug];
      
      console.log(`✅ Found folder-based villa: ${villa.name} with ${villa.totalImages} images from folder`);
      
      return NextResponse.json({
        success: true,
        data: villa,
        message: 'Using villa name directly from image folder'
      });
    }

    // If no villa found, return 404
    console.warn(`📝 Villa '${slug}' not found in folder-based data`);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Villa not found',
      },
      { status: 404 }
    );

  } catch (error) {
    console.error('Villa Details API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch villa details',
      },
      { status: 500 }
    );
  }
}